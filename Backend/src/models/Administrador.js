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
    enum: ["administrador"]
  }
}, {
  timestamps: true
});

// Método para encriptar contraseña
administradorSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

// Método para comparar contraseñas
administradorSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Método para generar token de verificación o recuperación
administradorSchema.methods.crearToken = function () {
  this.token = Math.random().toString(36).slice(2);
  return this.token;
};

export default model("Administrador", administradorSchema);
