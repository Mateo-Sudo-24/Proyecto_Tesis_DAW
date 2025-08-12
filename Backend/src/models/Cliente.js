import { Schema, model } from "mongoose";
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
    // La contraseña solo es requerida si el proveedor es 'local' (registro tradicional)
    required: function() { return this.proveedor === 'local'; }
  },
  proveedor: {
    type: String,
    enum: ['local', 'google'], // Solo se permiten estos dos valores
    default: 'local'
  },
  telefono: {
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
  creadoPor: { // <-- AÑADE ESTE CAMPO
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendedor' // O un modelo genérico 'Usuario' si prefieres
  },
  rol: {
    type: String,
    default: "cliente",
    enum: ["cliente"] // Un cliente solo puede tener el rol de cliente
  },
}, {
  timestamps: true
});

// --- Middleware para hashear la contraseña automáticamente ANTES de guardar ---
clienteSchema.pre('save', async function(next) {
    // Si el password no ha sido modificado, o si no hay password (login con Google), no hagas nada.
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

// Comparar contraseñas en el LOGIN
clienteSchema.methods.matchPassword = async function (password) {
  if (!this.password) return false; // Si el usuario se registró con Google, no tiene password para comparar
  return await bcrypt.compare(password, this.password);
};

// Generar token para recuperación o activación
clienteSchema.methods.crearToken = function () {
  const tokenGenerado = Math.random().toString(36).slice(2);
  this.token = tokenGenerado;
  return tokenGenerado;
};

export default model("Cliente", clienteSchema);