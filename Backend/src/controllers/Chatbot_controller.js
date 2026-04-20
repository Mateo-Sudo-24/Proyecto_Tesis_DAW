// Controlador de Chatbot - Maneja peticiones de IA (solo Groq)
import { consultarGroq } from '../services/groqService.js';
import { generateAvatar } from '../services/iaService.js';

// Consultar Groq (Público)
export const consultarGroqPublic = async (req, res) => {
    try {
        const { mensaje, imagenBase64, historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial);
        res.json({ respuesta });
    } catch (error) {
        console.error('Error en consultarGroqPublic:', error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar Groq (Autenticado)
export const consultarGroqAuth = async (req, res) => {
    try {
        const { mensaje, imagenBase64, historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial);
        res.json({ respuesta });
    } catch (error) {
        console.error('Error en consultarGroqAuth:', error);
        res.status(500).json({ error: error.message });
    }
};

// Generar Avatar (Público)
export const generarAvatarPublic = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt es requerido' });
        }

        const avatarBase64 = await generateAvatar(prompt);
        res.json({ avatarBase64 });
    } catch (error) {
        console.error('Error en generarAvatarPublic:', error);
        res.status(500).json({ error: error.message });
    }
};

// Generar Avatar (Autenticado)
export const generarAvatarAuth = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt es requerido' });
        }

        const avatarBase64 = await generateAvatar(prompt);
        res.json({ avatarBase64 });
    } catch (error) {
        console.error('Error en generarAvatarAuth:', error);
        res.status(500).json({ error: error.message });
    }
};
