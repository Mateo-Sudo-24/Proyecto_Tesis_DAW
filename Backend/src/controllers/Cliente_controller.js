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

const actualizarPassword = async (req, res) => { /* ...lógica similar a la de vendedor... */ };
const recuperarPassword = async (req, res) => { /* ...lógica similar a la de vendedor... */ };
const comprobarTokenPasword = async (req, res) => { /* ...lógica similar a la de vendedor... */ };
const crearNuevoPassword = async (req, res) => { /* ...lógica similar a la de vendedor... */ };

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