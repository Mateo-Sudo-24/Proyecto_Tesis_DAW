import Administrador from "../models/Administrador.js";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";

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
        const emailExistente = await Administrador.findOne({ email: email.toLowerCase() });
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
    
    const { nombre, apellido, direccion, telefono, _id, rol } = administradorBDD;
    
    res.status(200).json({
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

        const administrador = await Administrador.findOneAndUpdate(
            {},
            datosActualizar,
            { new: true, select: '-password -token' }
        );

        if (!administrador) {
            return res.status(404).json({ msg: "No se encontró el administrador" });
        }

        res.status(200).json({
            msg: "Administrador actualizado exitosamente",
            administrador
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

    const administrador = await Administrador.findOne({ email });
    if (!administrador) return res.status(404).json({ msg: "El correo no está registrado" });

    const token = administrador.crearToken();
    administrador.token = token;
    await administrador.save();

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
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
        return res.status(400).json({ msg: "Debes proporcionar ambas contraseñas" });
    }

    const administrador = await Administrador.findOne({});
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

export {
    login,
    actualizar,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    cambiarPassword,
    crearAdministrador
};