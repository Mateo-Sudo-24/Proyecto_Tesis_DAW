import Administrador from "../models/Administrador.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";

const crearAdministrador = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect('tu_connection_string_aqui');
        
        // Crear el administrador
        const nuevoAdmin = new Administrador({
            _id: new mongoose.Types.ObjectId("684e20446cbeddab4b70c4be"),
            nombre: "Juan Carlos",
            apellido: "González", 
            email: "admin@empresa.com",
            password: "12345678", // Este se encriptará automáticamente
            telefono: "0987654321",
            direccion: "Av. Amazonas N24-03 y Colón, Quito",
            status: true,
            token: null,
            confirmEmail: false,
            rol: "administrador"
        });

        await nuevoAdmin.save();
        console.log('Administrador creado exitosamente');
        console.log('Email:', nuevoAdmin.email);
        console.log('Password encriptado:', nuevoAdmin.password);
        
    } catch (error) {
        console.error('Error al crear administrador:', error);
    } finally {
        mongoose.connection.close();
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