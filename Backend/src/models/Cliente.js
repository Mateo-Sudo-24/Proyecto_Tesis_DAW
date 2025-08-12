import mongoose, { Schema, model } from "mongoose"; // <-- ¡ESTA ES LA LÍNEA CRÍTICA Y CORREGIDA!
import bcrypt from "bcryptjs";

const clienteSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() { return this.proveedor === 'local'; }
    },
    proveedor: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }, telefono: {
    type: String,
    trim: true,
    default: null
  },
  direccion: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  token: {
    type: String,
    default: null
  },
  confirmEmail: {
    type: Boolean,
    default: false
  },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId, // <-- Ahora 'mongoose' está definido
        ref: 'Vendedor'
    },
    rol: {
        type: String,
        default: "cliente",
        enum: ["cliente"]
    }
}, {
    timestamps: true
});

// --- Middleware para hashear la contraseña automáticamente ---
clienteSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// --- Métodos del Modelo ---
clienteSchema.methods.matchPassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

clienteSchema.methods.crearToken = function () {
  const tokenGenerado = Math.random().toString(36).slice(2);
  this.token = tokenGenerado;
  return tokenGenerado;
};

export default model("Cliente", clienteSchema);