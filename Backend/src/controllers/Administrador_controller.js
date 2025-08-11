import Administrador from "../models/Administrador.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from "../middlewares/JWT.js";

const crearAdministrador = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;
        if (!email || !password || !nombre || !apellido) {
            return res.status(400).json({ msg: "Los campos nombre, apellido, email y password son obligatorios" });
        }
        const existeAdmin = await Administrador.findOne({ email });
        if (existeAdmin) {
            return res.status(400).json({ msg: "El email ya se encuentra registrado para un administrador." });
        }
        
        // Se crea la instancia pasando los datos del body.
        // La contraseña se queda en TEXTO PLANO aquí.
        const nuevoAdmin = new Administrador(req.body);
        
        // Al ejecutar .save(), el middleware pre('save') de tu modelo
        // se encargará de hashear la contraseña automáticamente ANTES de que se guarde.
        await nuevoAdmin.save();
        
        res.status(201).json({ msg: "Administrador creado exitosamente." });
    } catch (error) {
        console.error("Error al crear administrador:", error);
        res.status(500).json({ msg: "Error en el servidor al crear el administrador." });
    }
};
// Login de administrador
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }
    const admin = await Administrador.findOne({ email });
    if (!admin) {
        return res.status(404).json({ msg: "Usuario administrador no encontrado." });
    }
    if (!await admin.matchPassword(password)) {
        return res.status(401).json({ msg: "Contraseña incorrecta." });
    }
    const token = crearTokenJWT(admin._id, admin.rol);
    const { _id, nombre, rol } = admin;
    res.status(200).json({ token, _id, nombre, email: admin.email, rol });
};
// GET /api/admin/perfil -> Obtener el perfil del PROPIO administrador autenticado
const perfil = async (req, res) => {
    // La información ya fue verificada y adjuntada por el middleware verificarTokenJWT
    // req.usuario contiene los datos del admin que hace la petición
    const admin = await Administrador.findById(req.usuario._id).select('-password -token -__v');
    if (!admin) {
        return res.status(404).json({ msg: "Administrador no encontrado." });
    }
    res.status(200).json(admin);
};

// GET /api/admin/ -> Obtener la lista de TODOS los administradores
const obtenerAdministradores = async (req, res) => {
    try {
        // Busca todos los documentos y excluye campos sensibles
        const administradores = await Administrador.find().select('-password -token -__v');
        res.status(200).json(administradores);
    } catch (error) {
        console.error("Error al obtener administradores:", error);
        res.status(500).json({ msg: "Error en el servidor al obtener la lista de administradores." });
    }
};
// Actualizar el perfil del propio administrador
const actualizar = async (req, res) => {
    const { _id } = req.usuario; // Se obtiene del token JWT
    const { password, token, ...datosActualizar } = req.body;
    try {
        const adminActualizado = await Administrador.findByIdAndUpdate(_id, datosActualizar, { new: true }).select("-password -token -__v");
        res.status(200).json({ msg: "Perfil actualizado correctamente", admin: adminActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el perfil." });
    }
};

// Cambiar la contraseña del propio administrador
const cambiarPassword = async (req, res) => {
    const { _id } = req.usuario;
    const { passwordActual, passwordNuevo } = req.body;
    if (!passwordActual || !passwordNuevo) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }
    const admin = await Administrador.findById(_id);
    if (!await admin.matchPassword(passwordActual)) {
        return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
    }
    admin.password = await admin.encrypPassword(passwordNuevo);
    await admin.save();
    res.status(200).json({ msg: "Contraseña actualizada correctamente." });
};

// --- Recuperación de Contraseña ---
const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });
    const admin = await Administrador.findOne({ email });
    if (!admin) return res.status(404).json({ msg: "No existe un administrador con ese correo." });
    const token = admin.crearToken();
    admin.token = token;
    await sendMailToRecoveryPassword(email, token);
    await admin.save();
    res.status(200).json({ msg: "Se ha enviado un correo con las instrucciones." });
};

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    const admin = await Administrador.findOne({ token });
    if (!admin) return res.status(404).json({ msg: "Token no válido o expirado." });
    res.status(200).json({ msg: "Token válido." });
};

const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: "La nueva contraseña es obligatoria." });
    const admin = await Administrador.findOne({ token });
    if (!admin) return res.status(404).json({ msg: "Token no válido o expirado." });
    admin.password = await admin.encrypPassword(password);
    admin.token = null;
    await admin.save();
    res.status(200).json({ msg: "Contraseña actualizada correctamente." });
};

export {
    crearAdministrador,
    login,
    perfil,
    obtenerAdministradores,
    actualizar,
    cambiarPassword,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
};