import mongoose, { Schema, model } from "mongoose";

const productoPedidoSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  cantidad: { type: Number, required: true },
  imagen: { type: String, required: true, trim: true },
  precio: { type: Number, required: true },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  }
});

const ordenSchema = new Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  productoPedido: [productoPedidoSchema],

  direccionEnvio: {
    direccion: { type: String, required: true },
    provincia: { type: String, required: true },
    ciudad: { type: String, required: true },
    codigoPostal: { type: String, required: true }
  },

  metodoPago: {
    type: String,
    enum: ['Stripe', 'PayPal', 'Transferencia', 'Efectivo'],
    required: true,
    default: "Stripe"
  },

  resultadoPago: {
    id: { type: String },
    estado: { type: String },
    hora: { type: String },
    email: { type: String }
  },

  precioImpuesto: { type: Number, required: true, default: 0.0 },
  precioEnvio: { type: Number, required: true, default: 0.0 },
  precioTotal: { type: Number, required: true, default: 0.0 },

  estadoPago: { type: Boolean, required: true, default: false },
  fechaPago: { type: Date },

  estadoEnvio: { type: Boolean, required: true, default: false },
  fechaEnvio: { type: Date },

  estadoOrden: {
    type: String,
    enum: ['pendiente', 'pagado', 'enviado', 'cancelado', 'entregado'],
    default: 'pendiente'
  },

  codigoOrden: {
    type: String,
    unique: true
  }

}, { timestamps: true });

export default model("Orden", ordenSchema);
