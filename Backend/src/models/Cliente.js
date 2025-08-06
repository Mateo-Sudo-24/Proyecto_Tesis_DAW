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
    unique: true
  },
  password: {
  type: String,
  required: function() { return this.proveedor === 'local'; }
  },
  proveedor: {
  type: String,
  enum: ['local', 'google'],
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
  rol: {
    type: String,
    default: "cliente",
    enum: ["cliente", "administrador", "vendedor"]
  },
  proveedor: {
    type: String,
    default: "local", // puede ser "local" o "google"
    enum: ["local", "google"]
  }
}, {
  timestamps: true
});

// Encriptar contraseña
clienteSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar contraseñas
clienteSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generar token
clienteSchema.methods.crearToken = function () {
  this.token = Math.random().toString(36).slice(2);
  return this.token;
};

export default model("Cliente", clienteSchema);
