// Middleware para verificar que la petición viene de nuestro Botpress
export const verificarBotApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey && apiKey === process.env.BOTPRESS_API_KEY) {
        return next();
    }
    return res.status(401).json({ msg: "Acceso no autorizado." });
};