// Middleware para verificar si el usuario tiene el rol de 'administrador'
export const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'administrador') {
        return next();
    }
    return res.status(403).json({ msg: "Acceso denegado. Se requiere rol de Administrador." });
};

// Middleware para verificar si el usuario tiene al menos el rol de 'vendedor'
export const esVendedor = (req, res, next) => {
    if (req.usuario && (req.usuario.rol === 'vendedor' || req.usuario.rol === 'administrador')) {
        return next();
    }
    return res.status(403).json({ msg: "Acceso denegado. Se requiere rol de Vendedor." });
};