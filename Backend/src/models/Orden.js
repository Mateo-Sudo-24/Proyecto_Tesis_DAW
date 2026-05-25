import mongoose, { Schema, model } from "mongoose";
import shortid from 'shortid';

const itemPedidoSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser mayor que 0.'],
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad debe ser un numero entero.'
        }
    },
    imagen: { type: String, required: false, trim: true },
    precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo.'] },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true }
}, { _id: false });

const direccionEnvioSchema = new Schema({
    direccion: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    provincia: { type: String, required: true, trim: true },
    codigoPostal: { type: String, required: true, trim: true },
    pais: { type: String, required: true, trim: true }
}, { _id: false });

const datosFacturacionSchema = new Schema({
    nombre: { type: String, trim: true, maxlength: 80 },
    apellido: { type: String, trim: true, maxlength: 80 },
    correo: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo de facturacion invalido.']
    },
    direccion: { type: String, trim: true, maxlength: 180 },
    ruc: {
        type: String,
        trim: true,
        match: [/^(\d{10}|\d{13})$/, 'El RUC/cedula debe tener 10 o 13 digitos.']
    },
    telefono: {
        type: String,
        trim: true,
        match: [/^$|^0\d{8,9}$/, 'Telefono de facturacion invalido.']
    }
}, { _id: false });

const ordenSchema = new Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor' },
    productoPedido: [itemPedidoSchema],
    direccionEnvio: direccionEnvioSchema,
    metodoPago: {
        type: String,
        required: true,
        enum: ['Tarjeta de Crédito', 'Transferencia Bancaria', 'PayPal', 'Contra Entrega', 'Efectivo', 'Stripe', 'De Una']
    },
    pagoStripeId: { type: String }, // <-- NUEVO CAMPO PARA ID DE PAGO
    precioTotal: { type: Number, required: true, min: [0, 'El precio total no puede ser negativo.'] },
    datosFacturacion: datosFacturacionSchema,
    estadoOrden: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'pagado', 'procesando', 'enviado', 'listo', 'completado', 'entregado', 'cancelado']
    },
    tipoEntrega: {
        type: String,
        enum: ['domicilio', 'retiro'],
        default: 'domicilio'
    },
    estadoPago: { type: Boolean, default: false },
    fechaPago: { type: Date },
    estadoEnvio: { type: Boolean, default: false },
    fechaEnvio: { type: Date },
    codigoOrden: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    solicitudCancelacion: {
        estado: {
            type: String,
            enum: ['ninguna', 'pendiente', 'aprobada', 'rechazada'],
            default: 'ninguna'
        },
        solicitadoEn: { type: Date },
        solicitadoPor: { type: String, enum: ['cliente', 'vendedor'] },
        razon: { type: String, maxlength: 500 },
        aprobadoPor: { type: String, enum: ['cliente', 'vendedor'] },
        respondidoEn: { type: Date },
        motivoRechazo: { type: String, maxlength: 500 }
    }
}, { timestamps: true });

export default model("Orden", ordenSchema);
