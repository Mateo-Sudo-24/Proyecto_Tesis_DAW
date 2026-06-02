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
        type: String,
        required: true,
        trim: true
    },
    // Precio base (compatibilidad legacy — igual a precioPorMetro si unidadVenta=metro)
    precio: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo.'],
        default: 0
    },
    // --- STOCK TEXTIL ---
    unidadVenta: {
        type: String,
        enum: ['metro', 'rollo', 'ambos'],
        default: 'metro'
    },
    metrosPorRollo: {
        type: Number,
        default: 100,
        min: [1, 'metrosPorRollo debe ser mayor que 0.']
    },
    // Metros disponibles como fuente real de stock
    metrosDisponibles: {
        type: Number,
        default: 0,
        min: [0, 'Los metros disponibles no pueden ser negativos.']
    },
    precioPorMetro: {
        type: Number,
        default: 0,
        min: [0, 'El precio por metro no puede ser negativo.']
    },
    precioPorRollo: {
        type: Number,
        default: 0,
        min: [0, 'El precio por rollo no puede ser negativo.']
    },
    // Legacy stock (enteros) — se mantiene para compatibilidad
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo.']
    },
    // --- CAMPOS DE IMAGEN ---
    imagenUrl: {
        type: String,
        default: null
    },
    imagenID: {
        type: String,
        default: null
    },
    descuento: {
        type: Number,
        required: true,
        min: [0, 'El descuento no puede ser negativo.'],
        max: [100, 'El descuento no puede superar 100.'],
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
        min: [0, 'La calificacion no puede ser negativa.'],
        max: [5, 'La calificacion no puede ser mayor que 5.'],
        default: 0
    },
    etiquetas: [{
        type: String,
        trim: true
    }],
    // --- CAMPOS DE ATRIBUCIÓN ---
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

productoSchema.index({ estado: 1, createdAt: -1 });
productoSchema.index({ estado: 1, color: 1, createdAt: -1 });
productoSchema.index({ nombre: "text", descripcion: "text" });

// Virtual: rollos disponibles calculados desde metros
productoSchema.virtual('stockRollosDisponibles').get(function () {
    return Math.floor((this.metrosDisponibles || 0) / (this.metrosPorRollo || 100));
});

export default model("Producto", productoSchema);
