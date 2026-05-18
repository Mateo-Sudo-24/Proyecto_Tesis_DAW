// Controlador de Chatbot - Maneja peticiones de IA (solo Groq)
import { consultarGroq } from '../services/groqService.js';

// Consultar Groq (Público)
export const consultarGroqPublic = async (req, res) => {
    try {
        const { mensaje, imagenBase64, imagenesBase64 = [], historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial, imagenesBase64);
        res.json({ respuesta });
    } catch (error) {
        console.error('Error en consultarGroqPublic:', error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar Groq (Autenticado)
export const consultarGroqAuth = async (req, res) => {
    try {
        const { mensaje, imagenBase64, imagenesBase64 = [], historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial, imagenesBase64);
        res.json({ respuesta });
    } catch (error) {
        console.error('Error en consultarGroqAuth:', error);
        res.status(500).json({ error: error.message });
    }
};
