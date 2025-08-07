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
    required: false // Correcto: no es obligatorio hasta que el vendedor activa su cuenta
  },
  status: { // <-- LA ÚNICA Y CORRECTA DEFINICIÓN
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
  token: {
    type: String,
    default: null
  },
  // El campo confirmEmail no es tan necesario si usas el flujo de activación,
  // pero lo dejamos por si lo usas en otro lado.
  confirmEmail: {
    type: Boolean,
    default: false 
  },
  rol: {
    type: String,
    default: "vendedor",
    enum: ["vendedor"] // Un vendedor solo puede tener el rol de vendedor
  }
}, {
  timestamps: true
});

// --- Middleware para encriptar password ANTES de guardar ---
// Es vital para que la contraseña se guarde hasheada
vendedorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
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


// --- MÉTODOS DEL MODELO ---

// Comparar contraseñas en el LOGIN
vendedorSchema.methods.matchPassword = async function (password) {
  // Compara la contraseña del formulario con el hash guardado
  // Si el campo password está vacío (antes de la activación), la comparación fallará (lo cual es correcto)
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Generar token para recuperación o activación
vendedorSchema.methods.crearToken = function () {
  const tokenGenerado = Math.random().toString(36).slice(2);
  this.token = tokenGenerado;
  return tokenGenerado;
};

export default model("Vendedor", vendedorSchema);