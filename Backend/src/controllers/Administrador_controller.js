import Administrador from "../models/Administrador.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from "../middlewares/JWT.js";
import { registroVendedor } from "./Vendedor_controller.js";
import Vendedor from '../models/Vendedor.js';

// cargar las variables de entorno

const crearAdministrador = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, direccion, rol } = req.body;

        // Validar campos obligatorios
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ 
                msg: "Los campos nombre, apellido, email y password son obligatorios" 
            });
        }

        // Validar que los campos no estén vacíos
        if ([nombre, apellido, email, password].some(campo => campo.trim() === "")) {
            return res.status(400).json({ 
                msg: "Los campos obligatorios no pueden estar vacíos" 
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "El formato del email no es válido" });
        }

        // Validar longitud mínima de password
        if (password.length < 6) {
            return res.status(400).json({ 
                msg: "El password debe tener al menos 6 caracteres" 
            });
        }

        // Verificar si el email ya existe
        const emailExistente = await Administrador.findOne({ 
            email: email.toLowerCase(), 
            _id: { $ne: id } // Excluye el propio usuario
        });
        if (emailExistente) {
            return res.status(400).json({ 
                msg: "Ya existe un administrador con este email" 
            });
        }


        // Validar teléfono si se proporciona
        if (telefono && telefono.trim() !== "") {
            const telefonoRegex = /^\d{10}$/;
            if (!telefonoRegex.test(telefono.replace(/\s/g, ""))) {
                return res.status(400).json({ 
                    msg: "El teléfono debe tener 10 dígitos" 
                });
            }
        }

        // Crear nuevo administrador
        const nuevoAdministrador = new Administrador({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.toLowerCase().trim(),
            password, // Se encriptará automáticamente con el middleware pre-save
            telefono: telefono ? telefono.trim() : null,
            direccion: direccion ? direccion.trim() : null,
            rol: rol || "administrador",
            status: true,
            confirmEmail: false
        });

        await nuevoAdministrador.save();

        // Responder sin el password
        const { password: _, ...administradorSinPassword } = nuevoAdministrador.toObject();

        res.status(201).json({
            msg: "Administrador creado exitosamente",
            administrador: administradorSinPassword
        });

    } catch (error) {
        console.error('Error al crear administrador:', error);
        
        // Manejo específico de errores de MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ 
                msg: "Ya existe un administrador con este email" 
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                msg: "Error de validación", 
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            msg: "Error interno del servidor al crear administrador" 
        });
    }
};

// ✅ Login de administrador
const login = async (req, res) => {
    const { email, password } = req.body;
    
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }
    
    const administradorBDD = await Administrador.findOne({ email }).select("-status -__v -token -updatedAt -createdAt");
    console.log(req.body);
    if (!administradorBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    }
    
    const verificarPassword = await administradorBDD.matchPassword(password);
    if (!verificarPassword) {
        return res.status(401).json({ msg: "Lo sentimos, el password no es el correcto" });
    }

    // Generar token JWT
    const token = crearTokenJWT(administradorBDD._id, administradorBDD.rol);
    
    const { nombre, apellido, direccion, telefono, _id, rol } = administradorBDD;
    
    res.status(200).json({
        token,
        rol,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email: administradorBDD.email
    });
};

// Actualizar datos (excepto password)
const actualizar = async (req, res) => {
    try {
        const { password, token, _id, ...datosActualizar } = req.body;

        // Validaciones específicas
         if (!_id) {
            return res.status(400).json({ msg: "Debes proporcionar el ID del administrador" });
        }

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({ msg: "No se proporcionaron datos para actualizar" });
        }

        // Validar campos obligatorios si están presentes
        if (datosActualizar.nombre && datosActualizar.nombre.trim() === "") {
            return res.status(400).json({ msg: "El nombre no puede estar vacío" });
        }

        if (datosActualizar.email && datosActualizar.email.trim() === "") {
            return res.status(400).json({ msg: "El email no puede estar vacío" });
        }

        // Validar formato de email si se proporciona
        if (datosActualizar.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datosActualizar.email)) {
                return res.status(400).json({ msg: "El formato del email no es válido" });
            }
        }

        // Validar teléfono si se proporciona
        if (datosActualizar.telefono && datosActualizar.telefono.trim() !== "") {
            const telefonoRegex = /^\d{10}$/;
            if (!telefonoRegex.test(datosActualizar.telefono.replace(/\s/g, ""))) {
                return res.status(400).json({ msg: "El teléfono debe tener 10 dígitos" });
            }
        }

        // Verificar si el email ya existe (si se está actualizando)
        if (datosActualizar.email) {
            const emailExistente = await Administrador.findOne({ 
                email: datosActualizar.email 
            });
            
            if (emailExistente) {
                return res.status(400).json({ msg: "El email ya está registrado" });
            }
        }

        const administradorBDD = await Administrador.findByIdAndUpdate(
            _id,
            datosActualizar,
            { new: true, select: '-password -token' }
        );

        if (!administradorBDD) {
            return res.status(404).json({ msg: "No se encontró el administrador" });
        }

        res.status(200).json({
            msg: "Administrador actualizado exitosamente",
            administradorBDD
        });

    } catch (error) {
        // Manejo específico de errores de MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ msg: "El email ya está registrado" });
        }
        
        res.status(500).json({ msg: "Error al actualizar administrador", error: error.message });
    }
};

// ✅ Recuperar contraseña
const recuperarPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Debes proporcionar el correo electrónico" });

    const administradorBDD = await Administrador.findOne({ email });
    if (!administradorBDD) return res.status(404).json({ msg: "El correo no está registrado" });

    const token = administradorBDD.crearToken();
    await administradorBDD.save();

    await sendMailToRecoveryPassword(email, token);

    res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu contraseña" });
};

// ✅ Comprobar token
const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;

    const administrador = await Administrador.findOne({ token });
    if (!administrador) return res.status(404).json({ msg: "Token no válido o expirado" });

    res.status(200).json({ msg: "Token confirmado. Ahora puedes crear una nueva contraseña." });
};

// ✅ Crear nueva contraseña
const crearNuevoPassword = async (req, res) => {
    const { password, confirmpassword } = req.body;

    if (!password || !confirmpassword) {
        return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({ msg: "Las contraseñas no coinciden" });
    }

    const administrador = await Administrador.findOne({ token: req.params.token });
    if (!administrador) return res.status(404).json({ msg: "Token inválido o expirado" });

    administrador.password = await administrador.encrypPassword(password);
    administrador.token = null;
    await administrador.save();

    // Notificar por correo que fue exitoso (opcional: puedes crear otro correo para esto)
    await sendMailToRecoveryPassword(administrador.email, null, true);

    res.status(200).json({ msg: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
};

// ✅ Cambio manual con contraseña actual
const cambiarPassword = async (req, res) => {
    const { passwordActual, passwordNuevo, _id } = req.body;

    if (!passwordActual || !passwordNuevo || !_id) {
        return res.status(400).json({ msg: "Debes proporcionar ambas contraseñas y el ID" });
    }

    const administrador = await Administrador.findById(_id);
    if (!administrador) {
        return res.status(404).json({ msg: "No se encontró el administrador" });
    }

    const passwordValido = await administrador.matchPassword(passwordActual);
    if (!passwordValido) {
        return res.status(400).json({ msg: "La contraseña actual no es correcta" });
    }

    administrador.password = await administrador.encrypPassword(passwordNuevo);
    await administrador.save();

    res.status(200).json({ msg: "Contraseña actualizada exitosamente" });
};

// LOGICA ADMINISTRADOR 

// CRUD para vendedores -- Crear vendedor -- Actualizar vendedor -- Eliminar vendedor
// Registrar un nuevo vendedor (hecho por el administrador)
const registroVendedor = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }
    const verificarEmailBDD = await Vendedor.findOne({ email });
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    }

    const nuevoVendedor = new Vendedor(req.body);
    nuevoVendedor.password = await nuevoVendedor.encrypPassword(password);
    nuevoVendedor.crearToken(); // Genera token interno, pero no se envía por correo
    await nuevoVendedor.save();

    res.status(200).json({ nuevoVendedor });
};

// Obtener un vendedor por ID
const obtenerVendedorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const vendedor = await Vendedor.findById(id).select("-password -token -__v");

    if (!vendedor) {
      return res.status(404).json({ msg: "Vendedor no encontrado" });
    }

    res.status(200).json({
      msg: "Vendedor encontrado",
      vendedor
    });
  } catch (error) {
    console.error("Error al obtener vendedor:", error);

    // Manejo de error si el ID no es válido
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "ID inválido" });
    }

    res.status(500).json({ msg: "Error al obtener el vendedor" });
  }
};

// Actualizar estado o rol del vendedor
const actualizarVendedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, status, rol, telefono, direccion } = req.body;

  try {
    const vendedor = await Vendedor.findById(id);

    if (!vendedor) {
      return res.status(404).json({ msg: "Vendedor no encontrado" });
    }

    // Actualizar solo campos permitidos
    if (nombre) vendedor.nombre = nombre.trim();
    if (email) vendedor.email = email.trim().toLowerCase();
    if (typeof status === "boolean") vendedor.status = status;
    if (rol) vendedor.rol = rol;
    if (telefono) vendedor.telefono = telefono.trim();
    if (direccion) vendedor.direccion = direccion.trim();

    await vendedor.save();

    res.status(200).json({
      msg: "Vendedor actualizado exitosamente",
      vendedor
    });
  } catch (error) {
    console.error("Error al actualizar vendedor:", error);
    res.status(500).json({ msg: "Error al actualizar vendedor" });
  }
};

// CRUD para ventas Gestion de ventas -- Visualizar ventas -- Actualizar ventas -- Eliminar ventas


// CRUD para pedidos  Gestion de pedidos --Crear pedidios-- Visualizar pedidos -- Actualizar pedidos -- Eliminar pedidos



export {
    login,
    actualizar,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    cambiarPassword,
    crearAdministrador,
    registroVendedor,
    obtenerVendedorPorId, 
    actualizarVendedor
};