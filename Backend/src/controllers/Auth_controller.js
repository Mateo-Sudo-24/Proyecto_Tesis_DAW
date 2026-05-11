import Administrador from "../models/Administrador.js";
import Vendedor from "../models/Vendedor.js";
import Cliente from "../models/Cliente.js";
import { crearTokenJWT } from "../middlewares/JWT.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";

// ✅ LOGIN UNIFICADO - Intenta con todos los tipos de usuario
const loginUnificado = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ msg: "Email y contraseña son obligatorios" });
    }

    try {
        // 1️⃣ Intentar encontrar como Administrador
        let usuario = await Administrador.findOne({ email });
        if (usuario) {
            if (!await usuario.matchPassword(password)) {
                return res.status(401).json({ msg: "Contraseña incorrecta." });
            }
            const token = crearTokenJWT(usuario._id, usuario.rol);
            const { _id, nombre, rol } = usuario;
            return res.status(200).json({ token, _id, nombre, email: usuario.email, rol });
        }

        // 2️⃣ Intentar encontrar como Vendedor
        usuario = await Vendedor.findOne({ email });
        if (usuario) {
            if (!await usuario.matchPassword(password)) {
                return res.status(401).json({ msg: "Contraseña incorrecta." });
            }
            const token = crearTokenJWT(usuario._id, usuario.rol);
            const { _id, nombre, rol } = usuario;
            return res.status(200).json({ token, _id, nombre, email: usuario.email, rol });
        }

        // 3️⃣ Intentar encontrar como Cliente
        usuario = await Cliente.findOne({ email });
        if (usuario) {
            if (!await usuario.matchPassword(password)) {
                return res.status(401).json({ msg: "Contraseña incorrecta." });
            }
            const token = crearTokenJWT(usuario._id, usuario.rol);
            const { _id, nombre, rol } = usuario;
            return res.status(200).json({ token, _id, nombre, email: usuario.email, rol });
        }

        // 4️⃣ Usuario no encontrado
        return res.status(404).json({ msg: "Usuario no encontrado." });

    } catch (error) {
        console.error("❌ Error en login unificado:", error);
        res.status(500).json({ msg: "Error en el servidor al procesar el login." });
    }
};

export {
    loginUnificado,
    recuperarPasswordUnificado
};

// ✅ RECUPERAR PASSWORD UNIFICADO - Busca el email en todos los modelos
async function recuperarPasswordUnificado(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo electrónico es obligatorio." });

    try {
        let usuario =
            await Administrador.findOne({ email, proveedor: 'local' }) ||
            await Vendedor.findOne({ email, proveedor: 'local' }) ||
            await Cliente.findOne({ email, proveedor: 'local' });

        if (!usuario) {
            return res.status(404).json({ msg: "No existe una cuenta registrada con ese correo." });
        }

        const token = usuario.crearToken();
        await sendMailToRecoveryPassword(email, token);
        await usuario.save();

        res.status(200).json({ msg: "Se ha enviado un correo con las instrucciones para recuperar tu contraseña." });
    } catch (error) {
        console.error("❌ Error en recuperarPasswordUnificado:", error);
        res.status(500).json({ msg: "Error en el servidor durante la recuperación." });
    }
}
