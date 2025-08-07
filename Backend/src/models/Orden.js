import mongoose, { Schema, model } from "mongoose";
import shortid from 'shortid';

// Sub-esquema para los productos dentro del pedido
const itemPedidoSchema = new Schema({
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    imagen: { type: String, required: false }, // La imagen es opcional
    precio: { type: Number, required: true },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true }
}, { _id: false });

// Sub-esquema para la dirección de envío
const direccionEnvioSchema = new Schema({
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },
    provincia: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    pais: { type: String, required: true }
}, { _id: false });

const ordenSchema = new Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor' },
    productoPedido: [itemPedidoSchema],
    direccionEnvio: direccionEnvioSchema,
    metodoPago: {
        type: String,
        required: true,
        enum: ['Tarjeta de Crédito', 'Transferencia Bancaria', 'PayPal', 'Contra Entrega', 'Efectivo', 'Stripe']
    },
    precioTotal: { type: Number, required: true },
    estadoOrden: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'pagado', 'procesando', 'enviado', 'completado', 'entregado', 'cancelado']
    },
    estadoPago: { type: Boolean, default: false },
    fechaPago: { type: Date },
    estadoEnvio: { type: Boolean, default: false },
    fechaEnvio: { type: Date },
    codigoOrden: {
        type: String,
        default: shortid.generate,
        unique: true
    }
}, { timestamps: true });

export default model("Orden", ordenSchema);