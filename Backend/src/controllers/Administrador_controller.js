import Administrador from "../models/Administrador.js";
import Cliente from "../models/Cliente.js";
import Vendedor from "../models/Vendedor.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from "../middlewares/JWT.js";
import { normalizarEmail, buscarDocumentoPorEmail } from "../utils/emailLookup.js";

const crearAdministrador = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;
        if (!email || !password || !nombre || !apellido) {
            return res.status(400).json({ msg: "Los campos nombre, apellido, email y password son obligatorios" });
        }
        const emailNormalizado = email.toLowerCase().trim();
        const [existeAdmin, existeCliente, existeVendedor] = await Promise.all([
            Administrador.findOne({ email: emailNormalizado }).lean(),
            Cliente.findOne({ email: emailNormalizado }).lean(),
            Vendedor.findOne({ email: emailNormalizado }).lean(),
        ]);
        if (existeAdmin || existeCliente || existeVendedor) {
            return res.status(400).json({ msg: "Este correo ya esta registrado en el sistema." });
        }
        
        // Se crea la instancia pasando los datos del body.
        // La contraseña se queda en TEXTO PLANO aquí.
        const nuevoAdmin = new Administrador({ ...req.body, email: emailNormalizado });
        
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
    const admin = await buscarDocumentoPorEmail(Administrador, email);
    if (!admin) {
        return res.status(404).json({ msg: "Credencial incorrecta: correo o contraseña." });
    }
    if (!await admin.matchPassword(password)) {
        return res.status(401).json({ msg: "Credencial incorrecta: correo o contraseña." });
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
    const { password, passwordActual, token, ...datosActualizar } = req.body;
    try {
        // Validar unicidad de email entre todos los roles
        if (datosActualizar.email) {
            const emailNuevo = datosActualizar.email.toLowerCase().trim();
            const adminActual = await Administrador.findById(_id);
            if (!passwordActual) {
                return res.status(400).json({ msg: "Ingresa tu contrasena actual para cambiar el correo." });
            }
            if (!adminActual || !await adminActual.matchPassword(passwordActual)) {
                return res.status(401).json({ msg: "La contrasena actual es incorrecta." });
            }
            const [Vendedor, Cliente] = await Promise.all([
                import('../models/Vendedor.js').then(m => m.default),
                import('../models/Cliente.js').then(m => m.default),
            ]);
            const [adminConf, vendConf, cliConf] = await Promise.all([
                Administrador.findOne({ email: emailNuevo, _id: { $ne: _id } }).lean(),
                Vendedor.findOne({ email: emailNuevo }).lean(),
                Cliente.findOne({ email: emailNuevo }).lean(),
            ]);
            if (adminConf || vendConf || cliConf) {
                const rolExistente = adminConf ? 'administrador' : vendConf ? 'vendedor' : 'cliente';
                return res.status(400).json({ msg: `Este correo ya está registrado como ${rolExistente}. Usa un correo distinto para este usuario.` });
            }
            datosActualizar.email = emailNuevo;
        }
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
    if (passwordNuevo.length < 8) { // Usando la validación de 8 caracteres
        return res.status(400).json({ msg: "La nueva contraseña debe tener al menos 8 caracteres." });
    }

    try {
        const admin = await Administrador.findById(_id);
        if (!admin) return res.status(404).json({ msg: "Administrador no encontrado." });

        if (!await admin.matchPassword(passwordActual)) {
            return res.status(401).json({ msg: "La contrasena actual es incorrecta." });
        }
        if (await admin.matchPassword(passwordNuevo)) {
            return res.status(400).json({ msg: "No puedes poner la misma contrasena." });
        }
        
        // --- ¡CORRECCIÓN! ---
        // Se asigna la nueva contraseña en TEXTO PLANO.
        admin.password = passwordNuevo;
        
        // Al guardar, el hook pre('save') se encargará de hashearla automáticamente.
        await admin.save();
        
        res.status(200).json({ msg: "Contrasena actualizada correctamente." });

    } catch (error) {
        console.error("Error al cambiar la contrasena:", error);
        res.status(500).json({ msg: "Error en el servidor al cambiar la contrasena." });
    }
};

const verificarPasswordActual = async (req, res) => {
    const { _id } = req.usuario;
    const { passwordActual } = req.body;
    if (!passwordActual) return res.status(400).json({ msg: "La contrasena actual es obligatoria." });
    try {
        const admin = await Administrador.findById(_id);
        if (!admin) return res.status(404).json({ msg: "Administrador no encontrado." });
        if (!await admin.matchPassword(passwordActual)) {
            return res.status(401).json({ msg: "La contrasena actual es incorrecta." });
        }
        return res.status(200).json({ ok: true, msg: "Contrasena verificada." });
    } catch (error) {
        return res.status(500).json({ msg: "Error al verificar la contrasena." });
    }
};

// --- Recuperación de Contraseña ---
const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });
    const admin = await buscarDocumentoPorEmail(Administrador, email);
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

// ...
const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ msg: "La nueva contraseña es obligatoria." });
    }
    if (password.length < 8) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 8 caracteres." });
    }

    try {
        const admin = await Administrador.findOne({ token });
        if (!admin) return res.status(404).json({ msg: "Token no válido o expirado." });
        
        // --- ¡CORRECCIÓN! ---
        // Se asigna la nueva contraseña en TEXTO PLANO.
        admin.password = password;
        admin.token = null;
        
        // Al guardar, el hook pre('save') se encargará de hashearla automáticamente.
        await admin.save();
        
        res.status(200).json({ msg: "Contraseña actualizada correctamente." });

    } catch (error) {
        console.error("Error al crear nueva contraseña:", error);
        res.status(500).json({ msg: "Error en el servidor al crear la nueva contraseña." });
    }
};

// Devuelve todos los clientes y vendedores verificados/activos para el chat
const obtenerUsuariosChat = async (req, res) => {
    try {
        const Cliente  = (await import('../models/Cliente.js')).default;
        const Vendedor = (await import('../models/Vendedor.js')).default;
        const miId = String(req.usuario?._id || req.usuario?.id || '');

        const [clientes, vendedores, admins] = await Promise.all([
            Cliente.find({ status: true, confirmEmail: true }).select('_id nombre apellido email').lean(),
            Vendedor.find({ status: 'activo' }).select('_id nombre apellido email').lean(),
            Administrador.find({}).select('_id nombre apellido email').lean(),
        ]);

        const lista = [
            ...admins.filter(u => String(u._id) !== miId).map(u => ({ id: String(u._id), nombre: `${u.nombre} ${u.apellido || ''}`.trim(), email: u.email, rol: 'administrador' })),
            ...vendedores.filter(u => String(u._id) !== miId).map(u => ({ id: String(u._id), nombre: `${u.nombre} ${u.apellido || ''}`.trim(), email: u.email, rol: 'vendedor' })),
            ...clientes.map(u  => ({ id: String(u._id), nombre: `${u.nombre} ${u.apellido || ''}`.trim(), email: u.email, rol: 'cliente' })),
        ];

        res.status(200).json(lista);
    } catch (error) {
        console.error('Error al obtener usuarios chat:', error);
        res.status(500).json({ msg: 'Error al obtener usuarios.' });
    }
};

export {
    crearAdministrador,
    login,
    perfil,
    obtenerAdministradores,
    actualizar,
    cambiarPassword,
    verificarPasswordActual,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    obtenerUsuariosChat,
};
