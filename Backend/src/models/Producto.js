import { Schema, model } from "mongoose";

const productoSchema = new Schema({
    nombre: {
        type : String,
        required : true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim:true
    },
    categoria: {
        type: String,
        required: true,
        trim:true,
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
    imagen:{
        type:  String,
        required: true
    },

    descuento:{
        type: Number,
        required: true,
        default: 0
    },
    color: {
    type: String,
    trim: true
    },
    // 🔥 Visibilidad o estado del producto
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'agotado'],
      default: 'activo'
    },

    // ⭐ Calificación promedio del producto (puedes luego enlazarlo con reviews)
    calificacionPromedio: {
      type: Number,
      default: 0
    },

    // 🏷️ Etiquetas o palabras clave (para filtros, SEO interno, etc.)
    etiquetas: [{
      type: String,
      trim: true
    }],

    // 📅 Fechas automáticas
}, { timestamps: true });

export default model("Producto", productoSchema);