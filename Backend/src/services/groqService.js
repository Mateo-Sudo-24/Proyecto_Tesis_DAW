// Servicio de Groq API - Protegido en Backend
export const consultarGroq = async (mensaje, imagenBase64 = null, historial = []) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no está configurado en las variables de entorno');
    }

    try {
        const content = [];
        
        // Agregar imagen primero si existe (la API procesa mejor imagen→texto)
        if (imagenBase64) {
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${imagenBase64}`
                }
            });
        }

        // Agregar texto
        content.push({
            type: "text",
            text: mensaje
        });

        // Mensaje de sistema con contexto del asistente
        const systemMessage = {
            role: "system",
            content: `Eres Intex IA, el asistente virtual experto en telas y textiles de la empresa Intex Textiles. 
Cuando el usuario te salude o te pregunte quién eres, preséntate con tu nombre y explica que puedes:
- Analizar imágenes de telas y textiles con detalle (tipo de fibra, textura, usos recomendados, cuidados)
- Recomendar telas según el uso (ropa, tapicería, industria, etc.)
- Resolver dudas sobre materiales, composición y propiedades de los tejidos
- Ayudar con el catálogo y productos de Intex Textiles
Cuando recibas una imagen, analízala en detalle: identifica el tipo de tela, fibra probable, textura, usos recomendados y cuidados.
Responde siempre en español, con un tono profesional pero cercano.`
        };

        // Construir historial
        const messages = [
            systemMessage,
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
