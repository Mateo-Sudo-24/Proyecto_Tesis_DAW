import Vendedor from '../models/Vendedor.js';
import { sendMailToRecoveryPassword, sendMailToInviteUser } from "../config/nodemailer.js";
import { crearTokenJWT } from '../middlewares/JWT.js';
import mongoose from 'mongoose';

// ============================================================================
// ==          SECCIÓN DE AUTENTICACIÓN Y PERFIL (PARA VENDEDORES)         ==
// ============================================================================

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    const vendedor = await Vendedor.findOne({ email });
    if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });
    if (vendedor.status !== 'activo') return res.status(403).json({ msg: "Tu cuenta no está activa. Por favor, revisa tu correo de invitación." });
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
    const { password, rol, ...datosActualizar } = req.body;
    try {
        const vendedorActualizado = await Vendedor.findByIdAndUpdate(_id, datosActualizar, { new: true }).select("-password -token -__v");
        res.status(200).json({ msg: "Perfil actualizado correctamente.", vendedor: vendedorActualizado });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el perfil." });
    }
};

const actualizarPassword = async (req, res) => {
    const { _id } = req.usuario;
    const { passwordActual, passwordNuevo } = req.body;
    if (!passwordActual || !passwordNuevo || passwordNuevo.length < 6) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios y la nueva contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const vendedor = await Vendedor.findById(_id);
        if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });
        if (!await vendedor.matchPassword(passwordActual)) return res.status(401).json({ msg: "La contraseña actual es incorrecta." });

        vendedor.password = passwordNuevo;
        await vendedor.save();

        res.status(200).json({ msg: "Contraseña actualizada correctamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al actualizar la contraseña." });
    }
};

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });
    try {
        const vendedor = await Vendedor.findOne({ email });
        if (!vendedor) return res.status(404).json({ msg: "No existe un vendedor con ese correo." });
        const token = vendedor.crearToken();
        await sendMailToRecoveryPassword(email, token);
        await vendedor.save();
        res.status(200).json({ msg: "Se ha enviado un correo electrónico con las instrucciones." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor durante la recuperación." });
    }
};

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const vendedor = await Vendedor.findOne({ token });
        if (!vendedor) return res.status(404).json({ msg: "El enlace no es válido o ha expirado." });
        res.status(200).json({ msg: "Token válido." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al validar el token." });
    }
};

const crearNuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });
    }
    try {
        const vendedor = await Vendedor.findOne({ token });
        if (!vendedor) return res.status(404).json({ msg: "El enlace no es válido o ha expirado." });

        vendedor.password = password;
        vendedor.token = null;
        await vendedor.save();

        res.status(200).json({ msg: "¡Contraseña restablecida correctamente! Ya puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ msg: "Error al guardar la nueva contraseña." });
    }
};

// ============================================================================
// ==      SECCIÓN DE GESTIÓN DE VENDEDORES (CRUD - Solo para ADMINS)      ==
// ============================================================================

const crearVendedor = async (req, res) => {
    const { email, nombre, apellido, telefono, direccion, rol } = req.body;
    if (!email || !nombre || !apellido || !telefono || !direccion) return res.status(400).json({ msg: "Nombre, apellido, email, teléfono y dirección son obligatorios." });
    try {
        const existeVendedor = await Vendedor.findOne({ email });
        if (existeVendedor) return res.status(400).json({ msg: "El email ya se encuentra registrado." });

        const nuevoVendedor = new Vendedor({ email, nombre, apellido, telefono, direccion, rol, status: 'pendiente' });
        const token = nuevoVendedor.crearToken();
        await nuevoVendedor.save();
        await sendMailToInviteUser(email, token);
        res.status(201).json({ msg: "Invitación enviada al nuevo vendedor. Debe revisar su correo para activar la cuenta." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al invitar al vendedor." });
    }
};

const configurarCuentaYPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });
    }
    try {
        const vendedor = await Vendedor.findOne({ token, status: 'pendiente' });
        if (!vendedor) return res.status(404).json({ msg: "El enlace de activación no es válido o la cuenta ya ha sido activada." });

        vendedor.password = password;
        vendedor.status = 'activo';
        vendedor.token = null;
        await vendedor.save();

        res.status(200).json({ msg: "¡Cuenta activada! Ahora puedes iniciar sesión con tu nueva contraseña." });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al activar la cuenta." });
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
        res.status(200).json({ msg: "Vendedor actualizado exitosamente.", vendedor: vendedorActualizado });
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
    comprobarTokenPassword,
    crearNuevoPassword,
    // CRUD for Admins
    crearVendedor,
    obtenerVendedores,
    obtenerVendedorPorId,
    actualizarVendedor,
    eliminarVendedor,
    configurarCuentaYPassword
};