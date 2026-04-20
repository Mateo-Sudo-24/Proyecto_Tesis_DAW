import Administrador from "../models/Administrador.js";
import Vendedor from "../models/Vendedor.js";
import Cliente from "../models/Cliente.js";
import { crearTokenJWT } from "../middlewares/JWT.js";

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
    loginUnificado
};
