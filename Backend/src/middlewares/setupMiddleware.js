import Administrador from '../models/Administrador.js';
import { verificarTokenJWT } from './JWT.js';
import { esAdmin } from './AuthtMiddleware.js';

// Este es un middleware "combinado"
export const protegerRutaCrearAdmin = async (req, res, next) => {
    try {
        // Contamos cuántos documentos de administrador hay en la base de datos.
        const adminCount = await Administrador.countDocuments();

        if (adminCount === 0) {
            // SI NO HAY ADMINS, la petición puede pasar. No se requiere token.
            // Esto permite crear el primer "super admin".
            console.log("No hay administradores. Permitiendo la creación del primer admin.");
            return next();
        } else {
            // SI YA HAY ADMINS, la ruta se vuelve privada.
            // Ejecutamos la cadena de middlewares de seguridad normal.
            console.log("Ya existen administradores. La ruta requiere autenticación de admin.");
            return verificarTokenJWT(req, res, () => esAdmin(req, res, next));
        }
    } catch (error) {
        return res.status(500).json({ msg: "Error del servidor al verificar administradores." });
    }
};