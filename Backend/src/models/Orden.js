import mongoose, { Schema, model } from "mongoose";
import shortid from 'shortid';

const itemPedidoSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    cantidad: {
        type: Number,
        required: true,
        min: [0.01, 'La cantidad debe ser mayor que 0.']
    },
    unidadSeleccionada: { type: String, enum: ['metro', 'rollo'], default: 'metro' },
    imagen: { type: String, required: false, trim: true },
    precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo.'] },
    precioUnitario: { type: Number, default: 0 },
    descuento: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
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
        enum: ['Pago por tarjeta en línea', 'De Una', 'Pago contra entrega', 'Pago efectivo / tarjeta débito',
               // legacy compat
               'Tarjeta de Crédito', 'Transferencia Bancaria', 'PayPal', 'Contra Entrega', 'Efectivo', 'Stripe']
    },
    metodoPagoInterno: { type: String }, // 'stripe' | 'de_una' | 'contra_entrega' | 'efectivo'
    pagoStripeId: { type: String },
    // --- Desglose financiero ---
    subtotal: { type: Number, default: 0 },
    descuentoTotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    comisionPago: { type: Number, default: 0 },
    totalFinal: { type: Number, default: 0 },
    // Legacy compat
    precioTotal: { type: Number, default: 0 },
    datosFacturacion: datosFacturacionSchema,
    estadoOrden: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'pagado', 'procesando', 'enviado', 'listo',
               'pedido_recibido', 'buscando_pedido', 'pedido_recepcion',
               'motorizado_camino', 'completado', 'entregado', 'cancelado']
    },
    tipoEntrega: {
        type: String,
        enum: ['domicilio', 'retiro', 'establecimiento', 'venta_local'],
        default: 'domicilio'
    },
    estadoPago: {
        type: String,
        enum: ['pendiente', 'completado', 'fallido'],
        default: 'pendiente'
    },
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
