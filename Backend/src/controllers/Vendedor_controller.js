import Vendedor from '../models/Vendedor.js';
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';

// ============================================================================
// ==          SECCIÓN DE AUTENTICACIÓN Y PERFIL (PARA VENDEDORES)         ==
// ============================================================================

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    const vendedor = await Vendedor.findOne({ email }).select("-status -__v -token");
    if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });
    if (!await vendedor.matchPassword(password)) return res.status(401).json({ msg: "Contraseña incorrecta." });
    const token = crearTokenJWT(vendedor._id, vendedor.rol);
    const { _id, nombre, rol } = vendedor;
    res.status(200).json({ token, _id, nombre, email: vendedor.email, rol });
};

const perfil = async (req, res) => {
    const vendedor = await Vendedor.findById(req.usuario._id).select("-password -token -__v");
    if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });
    res.status(200).json(vendedor);
};

const actualizarPerfil = async (req, res) => {
    const { _id } = req.usuario;
    const { password, rol, ...datosActualizar } = req.body; // Un vendedor no puede cambiar su rol
    try {
        const vendedorActualizado = await Vendedor.findByIdAndUpdate(_id, datosActualizar, { new: true }).select("-password -token -__v");
        res.status(200).json({ msg: "Perfil actualizado correctamente", vendedor: vendedorActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el perfil." });
    }
};

const actualizarPassword = async (req, res) => {
    const { _id } = req.usuario;
    const { passwordActual, passwordNuevo } = req.body;
    if (!passwordActual || !passwordNuevo) return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    const vendedor = await Vendedor.findById(_id);
    if (!await vendedor.matchPassword(passwordActual)) return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
    vendedor.password = await vendedor.encrypPassword(passwordNuevo);
    await vendedor.save();
    res.status(200).json({ msg: "Contraseña actualizada correctamente." });
};

const recuperarPassword = async (req, res) => { /* ...tu código de recuperación aquí... */ };
const comprobarTokenPasword = async (req, res) => { /* ...tu código de comprobación de token aquí... */ };
const crearNuevoPassword = async (req, res) => { /* ...tu código de creación de nuevo password aquí... */ };

// ============================================================================
// ==      SECCIÓN DE GESTIÓN DE VENDEDORES (CRUD - Solo para ADMINS)      ==
// ============================================================================

const crearVendedor = async (req, res) => {
    const { email, password, nombre, apellido } = req.body;
    if (!email || !password || !nombre || !apellido) return res.status(400).json({ msg: "Los campos nombre, apellido, email y password son obligatorios" });
    try {
        const existeVendedor = await Vendedor.findOne({ email });
        if (existeVendedor) return res.status(400).json({ msg: "El email ya se encuentra registrado" });
        const nuevoVendedor = new Vendedor(req.body);
        nuevoVendedor.password = await nuevoVendedor.encrypPassword(password);
        await nuevoVendedor.save();
        res.status(201).json({ msg: "Vendedor registrado exitosamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al crear el vendedor." });
    }
};

const obtenerVendedores = async (req, res) => {
    try {
        const vendedores = await Vendedor.find().select("-password -token -__v");
        res.status(200).json(vendedores);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los vendedores." });
    }
};

const obtenerVendedorPorId = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de vendedor no válido." });
    try {
        const vendedor = await Vendedor.findById(id).select("-password -token -__v");
        if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });
        res.status(200).json(vendedor);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el vendedor." });
    }
};

const actualizarVendedor = async (req, res) => {
    const { id } = req.params;
    const { password, ...datosActualizar } = req.body; // No se actualiza el password desde aquí
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de vendedor no válido." });
    try {
        const vendedorActualizado = await Vendedor.findByIdAndUpdate(id, datosActualizar, { new: true }).select("-password -token -__v");
        if (!vendedorActualizado) return res.status(404).json({ msg: "Vendedor no encontrado." });
        res.status(200).json({ msg: "Vendedor actualizado exitosamente", vendedor: vendedorActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el vendedor." });
    }
};

const eliminarVendedor = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de vendedor no válido." });
    try {
        const vendedorEliminado = await Vendedor.findByIdAndDelete(id);
        if (!vendedorEliminado) return res.status(404).json({ msg: "Vendedor no encontrado." });
        res.status(200).json({ msg: "Vendedor eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el vendedor." });
    }
};

export {
    // Auth & Profile
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    // CRUD for Admins
    crearVendedor,
    obtenerVendedores,
    obtenerVendedorPorId,
    actualizarVendedor,
    eliminarVendedor,
};