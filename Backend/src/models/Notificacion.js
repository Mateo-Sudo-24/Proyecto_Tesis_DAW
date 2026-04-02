import mongoose from 'mongoose';

const NotificacionSchema = new mongoose.Schema({
  administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', required: true },
  tipo: { type: String, default: 'stock_critico', enum: ['stock_critico', 'orden_creada', 'pago_completado', 'envio_listo', 'solicitud_cancelacion'] },
  mensaje: { type: String, required: true },
  productos: [{ nombre: String, stock: Number, umbral: Number }],
  leida: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notificacion', NotificacionSchema);