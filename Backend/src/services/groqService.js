// Servicio de Groq API - Protegido en Backend
const GROQ_MODELS = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
];

const isModelAvailabilityError = (message = '') =>
    /model|decommission|deprecated|unavailable|not found|does not exist/i.test(message);

export const consultarGroq = async (mensaje, imagenBase64 = null, historial = [], imagenesBase64 = []) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no está configurado en las variables de entorno');
    }

    try {
        const content = [];

        // Normalizar imágenes: soporta array o imagen única.
        const todasLasImagenes = imagenesBase64.length > 0
            ? imagenesBase64
            : (imagenBase64 ? [imagenBase64] : []);

        // Agregar imágenes primero; la API procesa mejor imagen -> texto.
        for (const b64 of todasLasImagenes) {
            content.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${b64}` },
            });
        }

        content.push({
            type: 'text',
            text: mensaje,
        });

        const systemMessage = {
            role: 'system',
            content: `Eres Intex IA, el asistente virtual experto en telas y textiles de la empresa Intex Textiles.
Cuando el usuario te salude o te pregunte quién eres, preséntate con tu nombre y explica que puedes:
- Analizar imágenes de telas y textiles con detalle (tipo de fibra, textura, usos recomendados, cuidados).
- Recomendar telas según el uso (ropa, tapicería, industria, etc.).
- Resolver dudas sobre materiales, composición y propiedades de los tejidos.
- Orientar sobre el catálogo y productos de Intex Textiles.
Cuando recibas una imagen, analízala en detalle: identifica el tipo de tela, fibra probable, textura, usos recomendados y cuidados.
Responde siempre en español, con tono profesional y cercano.
Sé conciso: usa máximo 5 viñetas cuando sea posible.
No inventes productos, precios, stock ni descuentos. Si no tienes datos confirmados, habla como orientación técnica y deja que el backend muestre productos verificados.`,
        };

        const messages = [
            systemMessage,
            ...historial.map(m => ({
                role: m.role,
                content: m.content,
            })),
            {
                role: 'user',
                content,
            },
        ];

        let lastError = null;

        for (const model of GROQ_MODELS) {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.7,
                    max_completion_tokens: 2048,
                    top_p: 1,
                    stream: false,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }

            const error = await response.json().catch(() => ({}));
            const message = error.error?.message || response.statusText;
            lastError = new Error(`Error de Groq (${model}): ${message}`);

            if (!isModelAvailabilityError(message)) {
                throw lastError;
            }
        }

        throw lastError || new Error('No se pudo completar la consulta con Groq.');
    } catch (error) {
        console.error('Error en groqService:', error);
        throw error;
    }
};
