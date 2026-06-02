const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const consultarGroqBackendCompleto = async (mensaje, imagenBase64 = null, historial = [], imagenesBase64 = []) => {
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
                historial,
            }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error consultando Groq desde Backend:', error);
        throw error;
    }
};

export const consultarGroqBackend = async (mensaje, imagenBase64 = null, historial = [], imagenesBase64 = []) => {
    const data = await consultarGroqBackendCompleto(mensaje, imagenBase64, historial, imagenesBase64);
    return data.respuesta;
};
