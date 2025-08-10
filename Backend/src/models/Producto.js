import { Schema, model } from "mongoose";

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: Schema.Types.ObjectId, // <-- CAMBIO: Referencia a otra colección
        ref: 'Categoria',
        required: true,
    },
    precio: {
        type: Number,
        required: true,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    // --- CAMPOS DE IMAGEN CORREGIDOS Y REQUERIDOS ---
    imagenUrl: {
        type: String,
        required: true
    },
    imagenID: {
        type: String,
        required: true
    },
    descuento: {
        type: Number,
        required: true,
        default: 0
    },
    color: {
        type: String,
        trim: true
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'agotado'],
        default: 'activo'
    },
    calificacionPromedio: {
        type: Number,
        default: 0
    },
    etiquetas: [{
        type: String,
        trim: true
    }],
    // --- CAMPOS DE ATRIBUCIÓN AÑADIDOS ---
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: true
    },
    ultimaModificacionPor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendedor'
    }
}, { timestamps: true });

export default model("Producto", productoSchema);