import jwt from "jsonwebtoken"
import  Administrador from "../models/Administrador.js"
import Cliente from '../models/Cliente.js'
import Vendedor from '../models/Vendedor.js'

const verificarTokenJWT = async (req, res, next) => {
    const { authorization } = req.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Acceso denegado: token no proporcionado o inválido" });
    }

    try {
        const token = authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let usuario;

        if (decoded.rol === "administrador") {
            usuario = await Administrador.findById(decoded.id).lean().select("-password -token");
        } else if (decoded.rol === "cliente") {
            usuario = await Cliente.findById(decoded.id).lean().select("-password -token");
        } else if (decoded.rol === "vendedor") {
            usuario = await Vendedor.findById(decoded.id).lean().select("-password -token");
        } else {
            // Si el rol en el token no es uno de los esperados
            return res.status(401).json({ msg: "Rol de usuario no válido en el token." });
        }

        if (!usuario) {
            return res.status(401).json({ msg: "Token no válido (el usuario no existe)." });
        }
        // Sin importar el rol, el usuario autenticado siempre se adjunta a 'req.usuario'.
        req.usuario = usuario;
        
        next();

    } catch (error) {
        return res.status(401).json({ msg: "Token inválido o expirado." });
    }
};


export { 
    crearTokenJWT,
    verificarTokenJWT 
}

