import mongoose from 'mongoose';
import crypto from 'crypto';

// Claves para cifrado de datos sensibles
const CIPHER_KEY = process.env.NOTIFICATION_CIPHER_KEY || 'unitex_notification_cipher_2024_secure_key_32_chars';
const CIPHER_ALGORITHM = 'aes-256-cbc';

// Funciones de cifrado/descifrado
const encryptData = (data) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, Buffer.from(CIPHER_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('❌ Error en cifrado:', error.message);
    return JSON.stringify(data); // Fallback si hay error
  }
};

const decryptData = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string' || !encryptedData.includes(':')) {
      return encryptedData;
    }
    const [iv, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, Buffer.from(CIPHER_KEY.padEnd(32, '0').slice(0, 32)), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('❌ Error en descifrado:', error.message);
    return encryptedData; // Retornar tal cual si hay error
  }
};

const NotificacionSchema = new mongoose.Schema({
  administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', default: null },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', default: null },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  tipo: { type: String, default: 'stock_critico', enum: ['stock_critico', 'orden_creada', 'pago_completado', 'envio_listo', 'solicitud_cancelacion', 'confirmacion_pedido', 'mensaje_chat', 'producto_reabastecido', 'orden_cancelada'] },
  mensaje: { type: String, required: true },
  mensajeCifrado: { type: String, default: null }, // Almacena mensaje cifrado
  productos: [{ 
    nombre: { type: String, default: 'Producto' },
    descripcion: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    umbral: { type: Number, default: 5 },
    productId: String,
    categoria: String,
    precio: Number
  }],
  productosCifrados: { type: String, default: null }, // Almacena productos cifrados
  leida: { type: Boolean, default: false },
  bandejaEnviada: { type: Boolean, default: false },
  estadoGestion: { type: String, enum: ['pendiente', 'aprobado', 'rechazado', 'completado'], default: 'pendiente' },
  remitenteId: { type: String, default: null },
  clienteId:   { type: String, default: null },
  datos: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadatos: {
    ipOrigen: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Middleware pre-save para cifrar datos sensibles
NotificacionSchema.pre('save', function (next) {
  try {
    // Cifrar mensaje
    if (this.mensaje) {
      this.mensajeCifrado = encryptData({ msg: this.mensaje, timestamp: new Date() });
    }
    // Cifrar productos si existen
    if (this.productos && this.productos.length > 0) {
      this.productosCifrados = encryptData(this.productos);
    }
    next();
  } catch (error) {
    console.error('❌ Error pre-save en Notificacion:', error.message);
    next();
  }
});

// Método para descifrar datos
NotificacionSchema.methods.descifrarDatos = function () {
  try {
    const decrypted = {
      mensaje: this.mensaje,
      productos: this.productos
    };

    if (this.mensajeCifrado) {
      const msgDecrypted = decryptData(this.mensajeCifrado);
      decrypted.mensaje = msgDecrypted.msg || this.mensaje;
    }

    if (this.productosCifrados) {
      decrypted.productos = decryptData(this.productosCifrados) || this.productos;
    }

    return decrypted;
  } catch (error) {
    console.error('❌ Error descifrado:', error.message);
    return { mensaje: this.mensaje, productos: this.productos };
  }
};

// Método estático para crear notificación con datos cifrados
NotificacionSchema.statics.crearConCifrado = async function (data) {
  const notif = new this(data);
  await notif.save();
  return notif;
};

export default mongoose.model('Notificacion', NotificacionSchema);
