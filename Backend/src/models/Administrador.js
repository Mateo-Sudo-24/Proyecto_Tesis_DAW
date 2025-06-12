import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

// Esquema del Administrador
const administradorSchema = new Schema({
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
    unique: true
  },
  password: {
    type: String,
    required: true
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
  rol: {
    type: String,
    default: "administrador",
    enum: ["administrador, cliente, vendedor"]
  }
}, {
  timestamps: true
});

// Método para encriptar contraseña (versión mejorada)
administradorSchema.methods.encrypPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  const passwordEncryp = await bcrypt.hash(password, salt);
  return passwordEncryp;
};

// Método para comparar contraseñas (versión mejorada)
administradorSchema.methods.matchPassword = async function(password) {
  const response = await bcrypt.compare(password, this.password);
  return response;
};

// Método para generar token de verificación o recuperación (versión mejorada)
administradorSchema.methods.crearToken = function() {
  const tokenGenerado = this.token = Math.random().toString(36).slice(2);
  return tokenGenerado;
};

// Middleware para encriptar password antes de guardar
administradorSchema.pre('save', async function(next) {
  // Solo encriptar si el password ha sido modificado o es nuevo
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await this.encrypPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

export default model("Administrador", administradorSchema);