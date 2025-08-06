import Cliente from "../models/Cliente.js";
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';

// ============================================================================
// ==          SECCIÓN DE REGISTRO Y AUTENTICACIÓN (PARA CLIENTES)         ==
// ============================================================================

const registro = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    const verificarEmailBDD = await Cliente.findOne({ email });
    if (verificarEmailBDD) return res.status(400).json({ msg: "El email ya se encuentra registrado" });
    const nuevoCliente = new Cliente(req.body);
    nuevoCliente.password = await nuevoCliente.encrypPassword(password);
    const token = nuevoCliente.crearToken();
    await sendMailToRegister(email, token);
    await nuevoCliente.save();
    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" });
};

const confirmarEmail = async (req, res) => {
    const { token } = req.params;
    const clienteBDD = await Cliente.findOne({ token });
    if (!clienteBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada o el token es inválido" });
    clienteBDD.token = null;
    clienteBDD.confirmEmail = true;
    await clienteBDD.save();
    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    const cliente = await Cliente.findOne({ email });
    if (!cliente) return res.status(404).json({ msg: "Usuario no encontrado." });
    if (!cliente.confirmEmail) return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });
    if (cliente.proveedor !== 'local' || !await cliente.matchPassword(password)) return res.status(401).json({ msg: "Contraseña incorrecta." });
    const token = crearTokenJWT(cliente._id, cliente.rol);
    const { _id, nombre, rol } = cliente;
    res.status(200).json({ token, _id, nombre, email: cliente.email, rol });
};

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
    const { _id } = req.usuario; // ID del token JWT
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }
    if (passwordNuevo.length < 6) {
        return res.status(400).json({ msg: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const cliente = await Cliente.findById(_id);
        if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado." });

        // Verificar que la contraseña actual es correcta
        if (!await cliente.matchPassword(passwordActual)) {
            return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
        }
        
        // Encriptar y guardar la nueva contraseña
        cliente.password = await cliente.encrypPassword(passwordNuevo);
        await cliente.save();
        
        res.status(200).json({ msg: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        res.status(500).json({ msg: "Error en el servidor al actualizar la contraseña." });
    }
};

//(Paso 1) Solicitar el restablecimiento de contraseña por olvido.

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(404).json({ msg: "No existe un cliente con ese correo." });

        const token = cliente.crearToken();
        cliente.token = token;
        
        await sendMailToRecoveryPassword(email, token); // Llama a tu función de nodemailer
        await cliente.save();
        
        res.status(200).json({ msg: "Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña." });
    } catch (error) {
        console.error("Error en la recuperación de contraseña:", error);
        res.status(500).json({ msg: "Error en el servidor durante la recuperación." });
    }
};

//(Paso 2) Comprobar la validez del token de recuperación.

const comprobarTokenPasword = async (req, res) => {
    const { token } = req.params;
    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
        res.status(200).json({ msg: "Token válido. Ahora puedes establecer tu nueva contraseña." });
    } catch (error) {
        console.error("Error al comprobar el token:", error);
        res.status(500).json({ msg: "Error en el servidor al validar el token." });
    }
};

//(Paso 3) Establecer la nueva contraseña usando el token.

const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ msg: "La nueva contraseña es obligatoria." });
    if (password.length < 6) return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });

    try {
        const cliente = await Cliente.findOne({ token });
        if (!cliente) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
        cliente.password = await cliente.encrypPassword(password);
        cliente.token = null; // Limpiar el token para que no se pueda reutilizar
        
        await cliente.save();
        
        res.status(200).json({ msg: "¡Contraseña restablecida correctamente! Ya puedes iniciar sesión." });
    } catch (error) {
        console.error("Error al crear la nueva contraseña:", error);
        res.status(500).json({ msg: "Error en el servidor al guardar la nueva contraseña." });
    }
};

// ============================================================================
// ==      SECCIÓN DE GESTIÓN DE CLIENTES (CRUD - Solo para ADMINS)        ==
// ============================================================================

const crearClientePorAdmin = async (req, res) => {
    const { email, password, nombre } = req.body;
    if (!email || !password || !nombre) return res.status(400).json({ msg: "Nombre, email y password son obligatorios" });
    try {
        const existeCliente = await Cliente.findOne({ email });
        if (existeCliente) return res.status(400).json({ msg: "El email ya se encuentra registrado" });
        const nuevoCliente = new Cliente(req.body);
        nuevoCliente.password = await nuevoCliente.encrypPassword(password);
        nuevoCliente.confirmEmail = true; // El admin crea usuarios ya confirmados
        await nuevoCliente.save();
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
        // Opcional: Podrías eliminar también su carrito de compras si existe.
        res.status(200).json({ msg: "Cliente eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el cliente." });
    }
};


export {
    // Para Clientes
    registro,
    confirmarEmail,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    // PARA ADMINISTRADORES
    crearClientePorAdmin,
    obtenerClientes,
    obtenerClientePorId,
    actualizarClientePorAdmin,
    eliminarCliente,
};