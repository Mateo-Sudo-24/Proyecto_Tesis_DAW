// Frontend Service - Llamadas al Backend Chatbot
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Consultar Groq a través del Backend
export const consultarGroqBackend = async (mensaje, imagenBase64 = null, historial = [], imagenesBase64 = []) => {
    try {
        const response = await fetch(`${BACKEND_URL}/chatbot/groq`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mensaje,
                imagenBase64,
                imagenesBase64,
                historial
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.respuesta;
    } catch (error) {
        console.error('Error consultando Groq desde Backend:', error);
        throw error;
    }
};
