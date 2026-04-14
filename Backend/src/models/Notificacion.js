import mongoose from 'mongoose';

const NotificacionSchema = new mongoose.Schema({
  administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', required: true },
  tipo: { type: String, default: 'stock_critico', enum: ['stock_critico', 'orden_creada', 'pago_completado', 'envio_listo', 'solicitud_cancelacion'] },
  mensaje: { type: String, required: true },
  productos: [{ 
    nombre: { type: String, default: 'Producto' },
    stock: { type: Number, default: 0 },
    umbral: { type: Number, default: 5 },
    productId: String,
    categoria: String,
    precio: Number
  }],
  leida: { type: Boolean, default: false },
  bandejaEnviada: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notificacion', NotificacionSchema);