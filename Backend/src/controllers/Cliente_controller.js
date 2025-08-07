import Cliente from "../models/Cliente.js";
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';

// ============================================================================
// ==        BLOQUE 1: RUTAS PÚBLICAS (Registro y Autenticación)           ==
// ============================================================================

/*Registrar un nuevo cliente con email y contraseña.
POST /api/clientes/registro*/
const registro = async (req, res) => {
    const { email } = req.body;
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    try {
        const existeCliente = await Cliente.findOne({ email });
        if (existeCliente) {
            return res.status(400).json({ msg: "El email ya se encuentra registrado" });
        }       
        // Se crea la instancia con la contraseña en texto plano.
        const nuevoCliente = new Cliente(req.body);
        
        const token = nuevoCliente.crearToken();
        await sendMailToRegister(email, token);
        
        await nuevoCliente.save(); 
        
        res.status(200).json({ msg: "Registro exitoso. Revisa tu correo para confirmar tu cuenta." });
    } catch (error) {
        console.error("Error en el registro de cliente:", error);
        res.status(500).json({ msg: "Error en el servidor durante el registro." });
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
        console.error("Error al confirmar email:", error);
        res.status(500).json({ msg: "Error en el servidor al confirmar la cuenta." });
    }
};

/*Iniciar sesión para un cliente.
POST /api/clientes/login*/
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
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
        console.error("Error en el login:", error);
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

const comprobarTokenPasword = async (req, res) => {
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
        
        cliente.password = password; // Se asigna en texto plano
        cliente.token = null;
        await cliente.save(); // El modelo se encarga de hashear
        
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
    const { password, rol, ...datosActualizar } = req.body;
    try {
        const clienteActualizado = await Cliente.findByIdAndUpdate(_id, datosActualizar, { new: true }).select("-password -token -__v");
        res.status(200).json({ msg: "Perfil actualizado correctamente", cliente: clienteActualizado });
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
        
        cliente.password = passwordNuevo; // Se asigna en texto plano
        await cliente.save(); // El modelo se encarga de hashear
        
        res.status(200).json({ msg: "Contraseña actualizada correctamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar la contraseña." });
    }
};

// ============================================================================
// ==         BLOQUE 4: RUTAS PRIVADAS (Gestión por Administrador)         ==
// ============================================================================

const crearClientePorAdmin = async (req, res) => {
    const { email, password, nombre } = req.body;
    if (!email || !password || !nombre) return res.status(400).json({ msg: "Nombre, email y password son obligatorios" });

    try {
        const existeCliente = await Cliente.findOne({ email });
        if (existeCliente) return res.status(400).json({ msg: "El email ya se encuentra registrado" });
        
        const nuevoCliente = new Cliente(req.body);
        nuevoCliente.confirmEmail = true; // El admin crea usuarios ya confirmados
        await nuevoCliente.save(); // El modelo se encarga de hashear
        
        res.status(201).json({ msg: "Cliente creado por el administrador." });
    } catch (error) {
        res.status(500).json({ msg: "Error al crear el cliente." });
    }
};

const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find().select("-password -token -__v");
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los clientes." });
    }
};

const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
        const cliente = await Cliente.findById(id).select("-password -token -__v");
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el cliente." });
    }
};

const actualizarClientePorAdmin = async (req, res) => {
    const { id } = req.params;
    const { password, ...datosActualizar } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
        const clienteActualizado = await Cliente.findByIdAndUpdate(id, datosActualizar, { new: true }).select("-password -token -__v");
        if (!clienteActualizado) return res.status(404).json({ msg: "Cliente no encontrado." });
        res.status(200).json({ msg: "Cliente actualizado exitosamente", cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el cliente." });
    }
};

const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de cliente no válido." });
    try {
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
    // Bloque 1
    registro,
    confirmarEmail,
    login,
    // Bloque 2
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    // Bloque 3
    perfil,
    actualizarPerfil,
    actualizarPassword,
    // Bloque 4
    crearClientePorAdmin,
    obtenerClientes,
    obtenerClientePorId,
    actualizarClientePorAdmin,
    eliminarCliente,
};