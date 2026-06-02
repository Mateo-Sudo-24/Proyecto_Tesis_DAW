import Cliente from "../models/Cliente.js";
import Administrador from "../models/Administrador.js";
import Vendedor from "../models/Vendedor.js";
import { sendMailToRegister, sendMailToRecoveryPassword, sendMailToInviteCliente } from "../config/nodemailer.js";
import crypto from 'crypto';
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';
import { normalizarEmail, buscarDocumentoPorEmail } from "../utils/emailLookup.js";

// ============================================================================
// ==        BLOQUE 1: RUTAS PÃšBLICAS (Registro y AutenticaciÃ³n)           ==
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
            console.error("âŒ Error SMTP al enviar correo de confirmaciÃ³n:", mailError);
            // El cliente ya se guardÃ³; informar que el correo fallÃ³ pero el registro sÃ­
            return res.status(200).json({
                msg: `Cuenta creada, pero no se pudo enviar el correo de confirmaciÃ³n. Error SMTP: ${mailError.message}`
            });
        }
        
        res.status(200).json({ msg: "Registro exitoso. Revisa tu correo para confirmar tu cuenta." });
    } catch (error) {
        console.error("âŒ Error en registro:", error);
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
            return res.status(404).json({ msg: "El enlace no es vÃ¡lido o la cuenta ya ha sido confirmada." });
        }

        cliente.token = null;
        cliente.confirmEmail = true;
        await cliente.save();
        
        res.status(200).json({ msg: "Â¡Cuenta confirmada exitosamente! Ya puedes iniciar sesiÃ³n." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al confirmar la cuenta." });
    }
};

/*Iniciar sesiÃ³n para un cliente.
POST /api/clientes/login*/
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }

    try {
        const cliente = await buscarDocumentoPorEmail(Cliente, email);
        if (!cliente) return res.status(404).json({ msg: "Usuario no encontrado." });
        if (cliente.proveedor && cliente.proveedor !== 'local') return res.status(400).json({ msg: "Esta cuenta fue registrada usando Google. Por favor, inicia sesiÃ³n con Google." });
        
        if (!await cliente.matchPassword(password)) {
            return res.status(401).json({ msg: "ContraseÃ±a incorrecta." });
        }
        if (!cliente.confirmEmail) {
            if (cliente.token) return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });
            cliente.confirmEmail = true;
            await cliente.save();
        }
        
        const token = crearTokenJWT(cliente._id, cliente.rol);
        const { _id, nombre, rol } = cliente;
        
        res.status(200).json({ token, _id, nombre, email: cliente.email, rol });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al iniciar sesiÃ³n." });
    }
};

// ============================================================================
// ==         BLOQUE 2: RUTAS PÃšBLICAS (RecuperaciÃ³n de ContraseÃ±a)        ==
// ============================================================================

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrÃ³nico es obligatorio." });

    try {
        const cliente = await buscarDocumentoPorEmail(Cliente, email, {
            $or: [
                { proveedor: 'local' },
                { proveedor: { $exists: false } },
                { proveedor: null },
            ],
        });
        if (!cliente) return res.status(404).json({ msg: "No existe una cuenta local con ese correo." });

        const token = cliente.crearToken();
        await sendMailToRecoveryPassword(email, token);
        await cliente.save();
        
        res.status(200).json({ msg: "Se ha enviado un correo con las instrucciones." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor durante la recuperaciÃ³n." });
    }
};

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es vÃ¡lido o ya ha expirado." });
        
        res.status(200).json({ msg: "Token vÃ¡lido." });
    } catch (error) {
        res.status(500).json({ msg: "Error al validar el token." });
    }
};

const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ msg: "La contraseÃ±a es obligatoria y debe tener al menos 8 caracteres." });
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es vÃ¡lido o ya ha expirado." });
        
        cliente.password = password;
        cliente.token = null;
        await cliente.save();
        
        res.status(200).json({ msg: "Â¡ContraseÃ±a restablecida correctamente! Ya puedes iniciar sesiÃ³n." });
    } catch (error) {
        res.status(500).json({ msg: "Error al guardar la nueva contraseÃ±a." });
    }
};

// ============================================================================
// ==          BLOQUE 3: RUTAS PRIVADAS (GestiÃ³n de Perfil Propio)         ==
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
                const rolExistente = adminConf ? 'administrador' : vendConf ? 'vendedor' : 'cliente';
                return res.status(400).json({ msg: `Este correo ya estÃ¡ registrado como ${rolExistente}. No se puede usar en otro rol.` });
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
    if (!passwordActual || !passwordNuevo || passwordNuevo.length < 8) return res.status(400).json({ msg: "Todos los campos son obligatorios y la nueva contraseÃ±a debe tener al menos 8 caracteres." });
    
    try {
        const cliente = await Cliente.findById(_id);
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
        if (!await cliente.matchPassword(passwordActual)) return res.status(401).json({ msg: "La contraseÃ±a actual es incorrecta." });
        
        cliente.password = passwordNuevo;
        await cliente.save();
        
        res.status(200).json({ msg: "ContraseÃ±a actualizada correctamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar la contraseÃ±a." });
    }
};

// ============================================================================
// ==         BLOQUE 4: RUTAS PRIVADAS (GestiÃ³n por Vendedor/Admin)        ==
// ============================================================================

// Flujo de invitaciÃ³n: el admin crea el cliente sin password.
// Se envÃ­a un correo para que el cliente active su cuenta y establezca su contraseÃ±a.
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
                return res.status(400).json({ msg: "Ya existe un cliente activo con ese correo electrÃ³nico." });
            }
            // Si estÃ¡ pendiente de activaciÃ³n, reenviar la invitaciÃ³n
            const token = existeCliente.crearToken();
            await existeCliente.save();
            await sendMailToInviteCliente(emailNormalizado, token);
            return res.status(200).json({ msg: "La invitaciÃ³n fue reenviada. El cliente debe revisar su correo para activar la cuenta." });
        }

        const nuevoCliente = new Cliente({
            email: emailNormalizado, nombre, telefono, direccion,
            confirmEmail: false,
            creadoPor: req.usuario._id,
            // ContraseÃ±a temporal aleatoria (serÃ¡ reemplazada cuando el cliente active su cuenta)
            password: crypto.randomBytes(32).toString('hex'),
        });
        const token = nuevoCliente.crearToken();
        await nuevoCliente.save();
        await sendMailToInviteCliente(emailNormalizado, token);
        res.status(201).json({ msg: "InvitaciÃ³n enviada al nuevo cliente. Debe revisar su correo para activar la cuenta." });
    } catch (error) {
        console.error('Error al crear cliente por admin:', error);
        res.status(500).json({ msg: "Error al crear el cliente." });
    }
};

// POST /api/clientes/setup-account/:token -> El cliente activa su cuenta y establece su contraseÃ±a
const configurarCuentaClienteYPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
        return res.status(400).json({ msg: "La contraseÃ±a debe tener al menos 8 caracteres." });
    }
    try {
        const cliente = await Cliente.findOne({ token, confirmEmail: false });
        if (!cliente) return res.status(404).json({ msg: "El enlace de activaciÃ³n no es vÃ¡lido o la cuenta ya ha sido activada." });

        cliente.password = password;
        cliente.confirmEmail = true;
        cliente.token = null;
        await cliente.save();

        res.status(200).json({ msg: "Â¡Cuenta activada! Ahora puedes iniciar sesiÃ³n con tu nueva contraseÃ±a." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al activar la cuenta." });
    }
};

// --- FUNCIÃ“N MODIFICADA ---
// GET /api/clientes -> Obtener todos los clientes (sin filtro de propiedad)
const obtenerClientes = async (req, res) => {
    try {
        // Se elimina la lÃ³gica 'if (req.usuario.rol === 'vendedor')'.
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

// --- FUNCIÃ“N MODIFICADA ---
// GET /api/clientes/:id -> Obtener un cliente por ID (sin filtro de propiedad)
const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no vÃ¡lido." });
    try {
        // Se elimina la lÃ³gica de verificaciÃ³n de propiedad.
        // Cualquier vendedor o admin puede ver a cualquier cliente.
        const cliente = await Cliente.findById(id).select("-password -token -__v");
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el cliente." });
    }
};

// --- FUNCIÃ“N MODIFICADA ---
// PUT /api/clientes/:id -> Actualizar un cliente por ID (sin filtro de propiedad)
const actualizarClientePorAdmin = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no vÃ¡lido." });
    try {
        // Se elimina la bÃºsqueda previa y la verificaciÃ³n de propiedad.
        // Se actualiza el documento directamente.
        const datosActualizar = { ...req.body };
        if (datosActualizar.email) {
            const emailNuevo = datosActualizar.email.toLowerCase().trim();
            const [cliConf, adminConf, vendConf] = await Promise.all([
                Cliente.findOne({ email: emailNuevo, _id: { $ne: id } }).lean(),
                Administrador.findOne({ email: emailNuevo }).lean(),
                Vendedor.findOne({ email: emailNuevo }).lean(),
            ]);
            if (cliConf || adminConf || vendConf) {
                const rolExistente = adminConf ? 'administrador' : vendConf ? 'vendedor' : 'cliente';
                return res.status(400).json({ msg: `Este correo ya estÃ¡ registrado como ${rolExistente}. No se puede usar en otro rol.` });
            }
            datosActualizar.email = emailNuevo;
        }
        const clienteActualizado = await Cliente.findByIdAndUpdate(id, datosActualizar, { new: true }).select("-password -token -__v");
        if (!clienteActualizado) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json({ msg: "Cliente actualizado exitosamente.", cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el cliente." });
    }
};

// --- FUNCIÃ“N MODIFICADA ---
// DELETE /api/clientes/:id -> Eliminar un cliente por ID (sin filtro de propiedad)
const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no vÃ¡lido." });
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
