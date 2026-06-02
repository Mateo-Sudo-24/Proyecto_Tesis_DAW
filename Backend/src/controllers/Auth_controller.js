import Administrador from "../models/Administrador.js";
import Vendedor from "../models/Vendedor.js";
import Cliente from "../models/Cliente.js";
import { crearTokenJWT } from "../middlewares/JWT.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";

const normalizarEmail = (email = '') => String(email).toLowerCase().trim();

const buscarUsuarioPorEmail = async (email, { soloLocales = false } = {}) => {
    const emailNorm = normalizarEmail(email);
    const clienteQuery = soloLocales
        ? {
            email: emailNorm,
            $or: [
                { proveedor: 'local' },
                { proveedor: { $exists: false } },
                { proveedor: null },
            ],
        }
        : { email: emailNorm };

    const [admin, vendedor, cliente] = await Promise.all([
        Administrador.findOne({ email: emailNorm }),
        Vendedor.findOne({ email: emailNorm }),
        Cliente.findOne(clienteQuery),
    ]);
    return admin || vendedor || cliente;
};

const buscarUsuarioPorToken = async (token) => {
    const [admin, vendedor, cliente] = await Promise.all([
        Administrador.findOne({ token }),
        Vendedor.findOne({ token }),
        Cliente.findOne({ token, proveedor: 'local' }),
    ]);
    return admin || vendedor || cliente;
};

const responderLogin = (res, usuario) => {
    const token = crearTokenJWT(usuario._id, usuario.rol);
    const { _id, nombre, rol } = usuario;
    return res.status(200).json({ token, _id, nombre, email: usuario.email, rol });
};

const loginUnificado = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Email y contrasena son obligatorios." });
    }

    try {
        const usuario = await buscarUsuarioPorEmail(email);
        if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado." });

        if (usuario.rol === 'cliente' && usuario.proveedor && usuario.proveedor !== 'local') {
            return res.status(400).json({ msg: "Esta cuenta fue registrada con Google. Inicia sesion con Google." });
        }
        if (usuario.rol === 'cliente' && !usuario.confirmEmail) {
            return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesion." });
        }
        if (usuario.rol === 'vendedor' && usuario.status !== 'activo') {
            return res.status(403).json({ msg: "Tu cuenta no esta activa. Revisa el correo de invitacion." });
        }
        if (!await usuario.matchPassword(password)) {
            return res.status(401).json({ msg: "Contrasena incorrecta." });
        }

        return responderLogin(res, usuario);
    } catch (error) {
        console.error("Error en login unificado:", error);
        return res.status(500).json({ msg: "Error en el servidor al procesar el login." });
    }
};

const recuperarPasswordUnificado = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electronico es obligatorio." });

    try {
        const emailNormalizado = normalizarEmail(email);
        const usuario = await buscarUsuarioPorEmail(emailNormalizado, { soloLocales: true });
        if (!usuario) {
            return res.status(404).json({ msg: "No existe una cuenta local registrada con ese correo." });
        }

        const token = usuario.crearToken();
        await sendMailToRecoveryPassword(emailNormalizado, token);
        await usuario.save();

        return res.status(200).json({ msg: "Se ha enviado un correo con las instrucciones para recuperar tu contrasena." });
    } catch (error) {
        console.error("Error en recuperarPasswordUnificado:", error);
        return res.status(500).json({ msg: "Error en el servidor durante la recuperacion." });
    }
};

const comprobarTokenPasswordUnificado = async (req, res) => {
    const { token } = req.params;
    try {
        const usuario = await buscarUsuarioPorToken(token);
        if (!usuario) return res.status(404).json({ msg: "El enlace no es valido o ya ha expirado." });
        return res.status(200).json({ msg: "Token valido." });
    } catch (error) {
        return res.status(500).json({ msg: "Error al validar el token." });
    }
};

const crearNuevoPasswordUnificado = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
        return res.status(400).json({ msg: "La contrasena debe tener al menos 8 caracteres." });
    }

    try {
        const usuario = await buscarUsuarioPorToken(token);
        if (!usuario) return res.status(404).json({ msg: "El enlace no es valido o ya ha expirado." });

        usuario.password = password;
        usuario.token = null;
        await usuario.save();

        return res.status(200).json({ msg: "Contrasena restablecida correctamente. Ya puedes iniciar sesion." });
    } catch (error) {
        return res.status(500).json({ msg: "Error al guardar la nueva contrasena." });
    }
};

export {
    loginUnificado,
    recuperarPasswordUnificado,
    comprobarTokenPasswordUnificado,
    crearNuevoPasswordUnificado,
};
