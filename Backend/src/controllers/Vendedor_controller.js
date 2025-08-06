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
//Actualizar la contraseña del vendedor autenticado (desde su perfil).

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
        const vendedor = await Vendedor.findById(_id);
        if (!vendedor) return res.status(404).json({ msg: "Vendedor no encontrado." });

        if (!await vendedor.matchPassword(passwordActual)) {
            return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
        }
        
        vendedor.password = await vendedor.encrypPassword(passwordNuevo);
        await vendedor.save();
        
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
        const vendedor = await Vendedor.findOne({ email });
        if (!vendedor) return res.status(404).json({ msg: "No existe un vendedor con ese correo." });

        const token = vendedor.crearToken();
        vendedor.token = token;
        
        await sendMailToRecoveryPassword(email, token);
        await vendedor.save();
        
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
        const vendedor = await Vendedor.findOne({ token });
        if (!vendedor) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
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
        const vendedor = await Vendedor.findOne({ token });
        if (!vendedor) return res.status(404).json({ msg: "El enlace no es válido o ya ha expirado." });
        
        vendedor.password = await vendedor.encrypPassword(password);
        vendedor.token = null; // Limpiar el token
        
        await vendedor.save();
        
        res.status(200).json({ msg: "¡Contraseña restablecida correctamente! Ya puedes iniciar sesión." });
    } catch (error) {
        console.error("Error al crear la nueva contraseña:", error);
        res.status(500).json({ msg: "Error en el servidor al guardar la nueva contraseña." });
    }
};


// ============================================================================
// ==      SECCIÓN DE GESTIÓN DE VENDEDORES (CRUD - Solo para ADMINS)      ==
// ============================================================================

const crearVendedor = async (req, res) => {
    const { email, nombre, apellido, rol } = req.body; // Nota: ya no se pide password
    if (!email || !nombre || !apellido) {
        return res.status(400).json({ msg: "Nombre, apellido y email son obligatorios" });
    }

    try {
        const existeVendedor = await Vendedor.findOne({ email });
        if (existeVendedor) return res.status(400).json({ msg: "El email ya se encuentra registrado" });

        // Se crea el vendedor SIN contraseña y con estado 'pendiente'
        const nuevoVendedor = new Vendedor({ email, nombre, apellido, rol, status: 'pendiente' });

        // Se crea un token de activación
        const token = nuevoVendedor.crearToken();
        nuevoVendedor.token = token;

        await nuevoVendedor.save();

        // Se envía el correo de invitación
        await sendMailToInviteUser(email, token);

        res.status(201).json({ msg: "Invitación enviada al nuevo vendedor. Debe revisar su correo para activar la cuenta." });

    } catch (error) {
        console.error("Error al crear vendedor:", error);
        res.status(500).json({ msg: "Error en el servidor al invitar al vendedor." });
    }
};
const configurarCuentaYPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ msg: "La contraseña es obligatoria." });
    }

    try {
        const vendedor = await Vendedor.findOne({ token });
        if (!vendedor) {
            return res.status(404).json({ msg: "El enlace de activación no es válido o ya ha sido utilizado." });
        }

        // Se establece la contraseña, se activa la cuenta y se limpia el token
        vendedor.password = await vendedor.encrypPassword(password);
        vendedor.status = 'activo';
        vendedor.token = null;
        
        await vendedor.save();

        res.status(200).json({ msg: "¡Cuenta activada! Ahora puedes iniciar sesión con tu nueva contraseña." });
    } catch (error) {
        console.error("Error al configurar la cuenta:", error);
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
    configurarCuentaYPassword
};