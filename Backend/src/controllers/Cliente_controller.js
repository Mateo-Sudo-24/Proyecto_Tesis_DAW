import Cliente from "../models/Cliente.js";
import Administrador from "../models/Administrador.js";
import Vendedor from "../models/Vendedor.js";
import { sendMailToRegister, sendMailToRecoveryPassword, sendMailToInviteCliente } from "../config/nodemailer.js";
import crypto from 'crypto';
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';

// ============================================================================
// ==        BLOQUE 1: RUTAS PÚBLICAS (Registro y Autenticación)           ==
// ============================================================================

const registro = async (req, res) => {
    const { email } = req.body;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    try {
        const emailNormalizado = email.toLowerCase().trim();
        const [existeCliente, existeAdmin, existeVendedor] = await Promise.all([
            Cliente.findOne({ email: emailNormalizado }).lean(),
            Administrador.findOne({ email: emailNormalizado }).lean(),
            Vendedor.findOne({ email: emailNormalizado }).lean(),
        ]);
        if (existeCliente || existeAdmin || existeVendedor) return res.status(400).json({ msg: "Este correo ya esta registrado en el sistema." });
        
        const nuevoCliente = new Cliente({ ...req.body, email: emailNormalizado });
        const token = nuevoCliente.crearToken();

        // Guardar primero
        await nuevoCliente.save();

        // Enviar correo con await para capturar errores SMTP
        try {
            await sendMailToRegister(email, token);
        } catch (mailError) {
            console.error("❌ Error SMTP al enviar correo de confirmación:", mailError);
            // El cliente ya se guardó; informar que el correo falló pero el registro sí
            return res.status(200).json({
                msg: `Cuenta creada, pero no se pudo enviar el correo de confirmación. Error SMTP: ${mailError.message}`
            });
        }
        
        res.status(200).json({ msg: "Registro exitoso. Revisa tu correo para confirmar tu cuenta." });
    } catch (error) {
        console.error("❌ Error en registro:", error);
        const msg = error.code === 11000
            ? "El email ya se encuentra registrado."
            : error.message || "Error en el servidor durante el registro.";
        res.status(500).json({ msg });
    }
};

/*Confirmar la cuenta de un nuevo cliente usando un token.
 @route   GET /api/clientes/confirmar/:token */
const confirmarEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) {
            return res.status(404).json({ msg: "El enlace no es válido o la cuenta ya ha sido confirmada." });
        }

        cliente.token = null;
        cliente.confirmEmail = true;
        await cliente.save();
        
        res.status(200).json({ msg: "¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al confirmar la cuenta." });
    }
};

/*Iniciar sesión para un cliente.
POST /api/clientes/login*/
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(404).json({ msg: "Usuario no encontrado." });
        if (!cliente.confirmEmail) return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });
        if (cliente.proveedor !== 'local') return res.status(400).json({ msg: "Esta cuenta fue registrada usando Google. Por favor, inicia sesión con Google." });
        
        if (!await cliente.matchPassword(password)) {
            return res.status(401).json({ msg: "Contraseña incorrecta." });
        }
        
        const token = crearTokenJWT(cliente._id, cliente.rol);
        const { _id, nombre, rol } = cliente;
        
        res.status(200).json({ token, _id, nombre, email: cliente.email, rol });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al iniciar sesión." });
    }
};

// ============================================================================
// ==         BLOQUE 2: RUTAS PÚBLICAS (Recuperación de Contraseña)        ==
// ============================================================================

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });

    try {
        const cliente = await Cliente.findOne({ email, proveedor: 'local' });
        if (!cliente) return res.status(404).json({ msg: "No existe una cuenta local con ese correo." });

        const token = cliente.crearToken();
        await sendMailToRecoveryPassword(email, token);
        await cliente.save();
        
        res.status(200).json({ msg: "Se ha enviado un correo con las instrucciones." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor durante la recuperación." });
    }
};

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
        res.status(200).json({ msg: "Token válido." });
    } catch (error) {
        res.status(500).json({ msg: "Error al validar el token." });
    }
};

const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ msg: "La contraseña es obligatoria y debe tener al menos 6 caracteres." });
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
        cliente.password = password;
        cliente.token = null;
        await cliente.save();
        
        res.status(200).json({ msg: "¡Contraseña restablecida correctamente! Ya puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ msg: "Error al guardar la nueva contraseña." });
    }
};

// ============================================================================
// ==          BLOQUE 3: RUTAS PRIVADAS (Gestión de Perfil Propio)         ==
// ============================================================================

const perfil = async (req, res) => {
    const cliente = await Cliente.findById(req.usuario._id).select("-password -token -__v");
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
    res.status(200).json(cliente);
};

const actualizarPerfil = async (req, res) => {
    const { _id } = req.usuario;
    const { password, passwordActual, rol, ...datosActualizar } = req.body;
    try {
        // Validar unicidad de email entre todos los roles
        if (datosActualizar.email) {
            const emailNuevo = datosActualizar.email.toLowerCase().trim();
            const clienteActual = await Cliente.findById(_id);
            if (!passwordActual) {
                return res.status(400).json({ msg: "Ingresa tu contrasena actual para cambiar el correo." });
            }
            if (!clienteActual || !await clienteActual.matchPassword(passwordActual)) {
                return res.status(401).json({ msg: "La contrasena actual es incorrecta." });
            }
            const [Administrador, Vendedor] = await Promise.all([
                import('../models/Administrador.js').then(m => m.default),
                import('../models/Vendedor.js').then(m => m.default),
            ]);
            const [cliConf, adminConf, vendConf] = await Promise.all([
                Cliente.findOne({ email: emailNuevo, _id: { $ne: _id } }).lean(),
                Administrador.findOne({ email: emailNuevo }).lean(),
                Vendedor.findOne({ email: emailNuevo }).lean(),
            ]);
            if (cliConf || adminConf || vendConf) {
                return res.status(400).json({ msg: "Este correo ya está registrado en el sistema." });
            }
            datosActualizar.email = emailNuevo;
        }
        const clienteActualizado = await Cliente.findByIdAndUpdate(_id, datosActualizar, { new: true }).select("-password -token -__v");
        res.status(200).json({ msg: "Perfil actualizado correctamente.", cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el perfil." });
    }
};

const actualizarPassword = async (req, res) => {
    const { _id } = req.usuario;
    const { passwordActual, passwordNuevo } = req.body;
    if (!passwordActual || !passwordNuevo || passwordNuevo.length < 6) return res.status(400).json({ msg: "Todos los campos son obligatorios y la nueva contraseña debe tener al menos 6 caracteres." });
    
    try {
        const cliente = await Cliente.findById(_id);
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
        if (!await cliente.matchPassword(passwordActual)) return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
        
        cliente.password = passwordNuevo;
        await cliente.save();
        
        res.status(200).json({ msg: "Contraseña actualizada correctamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar la contraseña." });
    }
};

// ============================================================================
// ==         BLOQUE 4: RUTAS PRIVADAS (Gestión por Vendedor/Admin)        ==
// ============================================================================

// Flujo de invitación: el admin crea el cliente sin password.
// Se envía un correo para que el cliente active su cuenta y establezca su contraseña.
const crearClientePorAdmin = async (req, res) => {
    const { email, nombre, telefono, direccion } = req.body;
    if (!email || !nombre) return res.status(400).json({ msg: "Nombre y email son obligatorios." });
    try {
        const emailNormalizado = email.toLowerCase().trim();
        const [existeCliente, existeAdmin, existeVendedor] = await Promise.all([
            Cliente.findOne({ email: emailNormalizado }),
            Administrador.findOne({ email: emailNormalizado }).lean(),
            Vendedor.findOne({ email: emailNormalizado }).lean(),
        ]);
        if (existeAdmin || existeVendedor) {
            return res.status(400).json({ msg: "Este correo ya esta registrado en el sistema con otro rol." });
        }
        if (existeCliente) {
            if (existeCliente.confirmEmail) {
                return res.status(400).json({ msg: "Ya existe un cliente activo con ese correo electrónico." });
            }
            // Si está pendiente de activación, reenviar la invitación
            const token = existeCliente.crearToken();
            await existeCliente.save();
            await sendMailToInviteCliente(emailNormalizado, token);
            return res.status(200).json({ msg: "La invitación fue reenviada. El cliente debe revisar su correo para activar la cuenta." });
        }

        const nuevoCliente = new Cliente({
            email: emailNormalizado, nombre, telefono, direccion,
            confirmEmail: false,
            creadoPor: req.usuario._id,
            // Contraseña temporal aleatoria (será reemplazada cuando el cliente active su cuenta)
            password: crypto.randomBytes(32).toString('hex'),
        });
        const token = nuevoCliente.crearToken();
        await nuevoCliente.save();
        await sendMailToInviteCliente(emailNormalizado, token);
        res.status(201).json({ msg: "Invitación enviada al nuevo cliente. Debe revisar su correo para activar la cuenta." });
    } catch (error) {
        console.error('Error al crear cliente por admin:', error);
        res.status(500).json({ msg: "Error al crear el cliente." });
    }
};

// POST /api/clientes/setup-account/:token -> El cliente activa su cuenta y establece su contraseña
const configurarCuentaClienteYPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });
    }
    try {
        const cliente = await Cliente.findOne({ token, confirmEmail: false });
        if (!cliente) return res.status(404).json({ msg: "El enlace de activación no es válido o la cuenta ya ha sido activada." });

        cliente.password = password;
        cliente.confirmEmail = true;
        cliente.token = null;
        await cliente.save();

        res.status(200).json({ msg: "¡Cuenta activada! Ahora puedes iniciar sesión con tu nueva contraseña." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al activar la cuenta." });
    }
};

// --- FUNCIÓN MODIFICADA ---
// GET /api/clientes -> Obtener todos los clientes (sin filtro de propiedad)
const obtenerClientes = async (req, res) => {
    try {
        // Se elimina la lógica 'if (req.usuario.rol === 'vendedor')'.
        // Ahora siempre busca todos los clientes.
        const Orden = (await import('../models/Orden.js')).default;
        const [clientes, pedidosPorCliente] = await Promise.all([
            Cliente.find().select("-password -token -__v").lean(),
            Orden.aggregate([{ $group: { _id: '$cliente', pedidosCount: { $sum: 1 } } }])
        ]);
        const pedidosMap = new Map(pedidosPorCliente.map(p => [String(p._id), p.pedidosCount]));
        res.status(200).json(clientes.map(cliente => ({
            ...cliente,
            pedidosCount: pedidosMap.get(String(cliente._id)) || 0,
        })));
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los clientes." });
    }
};

// --- FUNCIÓN MODIFICADA ---
// GET /api/clientes/:id -> Obtener un cliente por ID (sin filtro de propiedad)
const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
        // Se elimina la lógica de verificación de propiedad.
        // Cualquier vendedor o admin puede ver a cualquier cliente.
        const cliente = await Cliente.findById(id).select("-password -token -__v");
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el cliente." });
    }
};

// --- FUNCIÓN MODIFICADA ---
// PUT /api/clientes/:id -> Actualizar un cliente por ID (sin filtro de propiedad)
const actualizarClientePorAdmin = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
        // Se elimina la búsqueda previa y la verificación de propiedad.
        // Se actualiza el documento directamente.
        const clienteActualizado = await Cliente.findByIdAndUpdate(id, req.body, { new: true }).select("-password -token -__v");
        if (!clienteActualizado) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json({ msg: "Cliente actualizado exitosamente.", cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el cliente." });
    }
};

// --- FUNCIÓN MODIFICADA ---
// DELETE /api/clientes/:id -> Eliminar un cliente por ID (sin filtro de propiedad)
const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
        const Orden = (await import('../models/Orden.js')).default;
        const tieneOrdenes = await Orden.exists({ cliente: id });
        if (tieneOrdenes) return res.status(400).json({ msg: "No se puede eliminar este cliente porque tiene pedidos registrados." });
        const clienteEliminado = await Cliente.findByIdAndDelete(id);
        if (!clienteEliminado) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json({ msg: "Cliente eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el cliente." });
    }
};

// ============================================================================
// ==                           EXPORTACIONES                            ==
// ============================================================================
export {
    registro,
    confirmarEmail,
    login,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    crearClientePorAdmin,
    configurarCuentaClienteYPassword,
    obtenerClientes,
    obtenerClientePorId,
    actualizarClientePorAdmin,
    eliminarCliente,
};
