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
        trim: true,
        maxlength: [300, "La descripcion no puede superar 300 caracteres."]
    },
    categoria: {
        type: String,
        required: true,
        trim: true
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
    // Metros del rollo reservado para venta por metro.
    metrosDisponibles: {
        type: Number,
        default: 0,
        min: [0, 'Los metros disponibles no pueden ser negativos.']
    },
    precioPorMetro: {
        type: Number,
        required: false,
        default: 0,
        min: [0, 'El precio por metro no puede ser negativo.']
    },
    precioPorRollo: {
        type: Number,
        required: false,
        default: 0,
        min: [0, 'El precio por rollo no puede ser negativo.']
    },
    // Rollos completos disponibles para venta por rollo.
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock de rollos no puede ser negativo.']
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

// Virtual: rollos completos disponibles para venta por rollo.
productoSchema.virtual('stockRollosDisponibles').get(function () {
    return this.stock || 0;
});

export default model("Producto", productoSchema);
