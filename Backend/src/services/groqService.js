// Servicio de Groq API - Protegido en Backend
export const consultarGroq = async (mensaje, imagenBase64 = null, historial = []) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no está configurado en las variables de entorno');
    }

    try {
        const content = [];
        
        // Agregar texto
        content.push({
            type: "text",
            text: mensaje
        });

        // Agregar imagen si existe
        if (imagenBase64) {
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${imagenBase64}`
                }
            });
        }

        // Construir historial
        const messages = [
            ...historial.map(m => ({
                role: m.role,
                content: m.content
            })),
            {
                role: "user",
                content: content
            }
        ];

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: messages,
                temperature: 0.7,
                max_completion_tokens: 2048,
                top_p: 1,
                stream: false,
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error de Groq: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Error en groqService:", error);
        throw error;
    }
};
