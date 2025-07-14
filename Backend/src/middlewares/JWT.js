import jwt from "jsonwebtoken"
import  Administrador from "../models/Administrador.js"
import Cliente from '../models/Cliente.js'
import Vendedor from '../models/Vendedor.js'

const crearTokenJWT = (id, rol) => {

    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const verificarTokenJWT = async (req, res, next) => {

		const { authorization } = req.headers
		
    if (!authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado o inválido" })

    try {
        const token = authorization.split(" ")[1];
        const { id, rol } = jwt.verify(token,process.env.JWT_SECRET)
        if (rol === "administrador") {
            req.administradorBDD = await Administrador.findById(id).lean().select("-password")
            next()
        }
        if (rol === "cliente") {
            req.clienteBDD = await Cliente.findById(id).lean().select("-password")
            next()
        }
        if (rol === "vendedor") {
            req.vendedorBDD = await Vendedor.findById(id).lean().select("-password")
            next()
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
}


export { 
    crearTokenJWT,
    verificarTokenJWT 
}

