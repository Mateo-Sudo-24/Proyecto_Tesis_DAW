import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const vendedorSchema = new Schema({
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
    required: false // Hacemos que no sea obligatorio inicialmente
  },
  status: { // Podrías usar un estado para controlar si la cuenta está activa
      type: String,
      enum: ['pendiente', 'activo', 'inactivo'],
      default: 'pendiente'
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
    default: "vendedor",
    enum: ["vendedor", "administrador", "cliente"]
  }
}, {
  timestamps: true
});

// Encriptar contraseña
vendedorSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar contraseñas
vendedorSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generar token
vendedorSchema.methods.crearToken = function () {
  this.token = Math.random().toString(36).slice(2);
  return this.token;
};

export default model("Vendedor", vendedorSchema);
