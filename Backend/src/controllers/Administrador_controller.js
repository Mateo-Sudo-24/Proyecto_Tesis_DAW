import Administrador from "../models/Administrador.js";
import sendMailToRegister from "../config/nodemailer.js";

// Registro único del administrador (solo se ejecuta una vez)
const registroAdministrador = async (req, res) => {
    try {
        // Verificar si ya existe un administrador
        const administradorExistente = await Administrador.findOne({});
        if (administradorExistente) {
            return res.status(400).json({
                msg: "Ya existe un administrador registrado en el sistema"
            });
        }

        const { email, password } = req.body;
        
        // Validar campos obligatorios
        if (Object.values(req.body).includes("")) {
            return res.status(400).json({
                msg: "Lo sentimos, debes llenar todos los campos"
            });
        }

        // Crear el único administrador
        const nuevoAdministrador = new Administrador(req.body);
        
        // El password se encripta automáticamente con el middleware pre-save
        // pero si prefieres hacerlo manual:
        // nuevoAdministrador.password = await nuevoAdministrador.encrypPassword(password);
        
        const token = nuevoAdministrador.crearToken();
        await sendMailToRegister(email, token);
        await nuevoAdministrador.save();

        res.status(200).json({
            msg: "Revisa tu correo electrónico para confirmar tu cuenta de administrador"
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error interno del servidor",
            error: error.message
        });
    }
};

// Verificar si existe administrador (útil para setup inicial)
const verificarAdministrador = async (req, res) => {
    try {
        const administrador = await Administrador.findOne({});
        res.status(200).json({
            existe: !!administrador,
            setupCompleto: !!administrador
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al verificar administrador",
            error: error.message
        });
    }
};

// Actualizar datos del administrador (excepto password)
const actualizarAdministrador = async (req, res) => {
    try {
        const { password, ...datosActualizar } = req.body;
        
        const administrador = await Administrador.findOneAndUpdate(
            {},
            datosActualizar,
            { new: true, select: '-password -token' }
        );

        if (!administrador) {
            return res.status(404).json({
                msg: "No se encontró el administrador"
            });
        }

        res.status(200).json({
            msg: "Administrador actualizado exitosamente",
            administrador
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error al actualizar administrador",
            error: error.message
        });
    }
};

// Cambiar password del administrador
const cambiarPasswordAdministrador = async (req, res) => {
    try {
        const { passwordActual, passwordNuevo } = req.body;

        if (!passwordActual || !passwordNuevo) {
            return res.status(400).json({
                msg: "Debe proporcionar la contraseña actual y la nueva"
            });
        }

        const administrador = await Administrador.findOne({});
        
        if (!administrador) {
            return res.status(404).json({
                msg: "No se encontró el administrador"
            });
        }

        // Verificar password actual
        const passwordValido = await administrador.matchPassword(passwordActual);
        if (!passwordValido) {
            return res.status(400).json({
                msg: "La contraseña actual no es correcta"
            });
        }

        // Actualizar password
        administrador.password = passwordNuevo;
        await administrador.save(); // El middleware pre-save encriptará automáticamente

        res.status(200).json({
            msg: "Contraseña actualizada exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error al cambiar contraseña",
            error: error.message
        });
    }
};

// Confirmar email del administrador
const confirmarEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                msg: "Lo sentimos, no se puede validar la cuenta"
            });
        }

        const administrador = await Administrador.findOne({ token });

        if (!administrador) {
            return res.status(404).json({
                msg: "La cuenta ya ha sido confirmada o el token no es válido"
            });
        }

        administrador.token = null;
        administrador.confirmEmail = true;
        await administrador.save();

        res.status(200).json({
            msg: "Token confirmado, cuenta de administrador verificada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error al confirmar email",
            error: error.message
        });
    }
};

export {
    registroAdministrador,
    verificarAdministrador,
    actualizarAdministrador,
    cambiarPasswordAdministrador,
    confirmarEmail
};