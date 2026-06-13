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
        throw new Error('GROQ_API_KEY no est\u00e1 configurado en las variables de entorno');
    }

    try {
        const content = [];

        // Normalizar imagenes: soporta array o imagen unica.
        const todasLasImagenes = imagenesBase64.length > 0
            ? imagenesBase64
            : (imagenBase64 ? [imagenBase64] : []);

        // Agregar imagenes primero; la API procesa mejor imagen -> texto.
        for (const b64 of todasLasImagenes) {
            content.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${b64}` },
            });
        }

        if (todasLasImagenes.length > 0) {
            content.push({
                type: 'text',
                text: `${mensaje}

INSTRUCCI\u00d3N ESPECIAL PARA AN\u00c1LISIS DE IMAGEN:
1. Determina PRIMERO si la imagen muestra una tela, tejido o material textil.
2. Si S\u00cd es una tela: analiza tipo de fibra, color, textura, trama, usos recomendados y cuidados.
3. Si NO es una tela: responde exactamente as\u00ed: "No puedo identificar esto como una tela o textil. [descripci\u00f3n breve de lo que ves]. Si tienes una muestra de tela, puedo ayudarte a identificarla. Tambi\u00e9n puedo buscar telas similares si me describes el material que buscas."
4. NUNCA inventes que algo es una tela si no lo es.`,
            });
        } else {
            content.push({ type: 'text', text: mensaje });
        }

        const systemMessage = {
            role: 'system',
            content: `Eres Intex IA, el asistente virtual experto en telas de INTEX TEXTILES.

INFORMACI\u00d3N DE LA EMPRESA:
- Nombre: Intex Textiles
- Direcci\u00f3n: Av. De los Granados y R\u00edo Coca, Quito, Ecuador (CAVA CORP)
- Horario: Lunes a Viernes 8:00 am - 6:00 pm
- Tel\u00e9fono: 0998434399
- Email: intex@gmail.com
- Env\u00edos a domicilio disponibles
- Venta por metros y por rollos

CAPACIDADES:
- Analizar im\u00e1genes de telas (tipo de fibra, textura, usos, cuidados)
- Recomendar telas seg\u00fan uso (ropa, tapicer\u00eda, industria)
- Mostrar productos disponibles del cat\u00e1logo
- Informar precios por metro y por rollo
- Resolver dudas sobre materiales y composici\u00f3n textil

REGLAS DE COMPORTAMIENTO:
1. Cuando el usuario salude ("hola", "buenas", "buenos d\u00edas"), responde con un saludo c\u00e1lido, pres\u00e9ntate brevemente y pregunta en qu\u00e9 puedes ayudar. NO inventes productos.
2. Cuando pregunten por informaci\u00f3n de la tienda, proporciona los datos reales de arriba.
3. Cuando pregunten por productos, di que puedes ayudarlos a buscar por tipo de tela, color o uso, o que suban una foto.
4. Cuando recibas una imagen, analiza EXCLUSIVAMENTE si es una tela o textil.
5. Si la imagen NO es una tela, indica claramente que no puedes identificarla como tela y ofrece alternativas.
6. Responde SIEMPRE en espa\u00f1ol, tono profesional pero amigable.
7. Respuestas cortas y claras. M\u00e1ximo 3 p\u00e1rrafos sin imagen, m\u00e1s detallado con imagen.
8. NUNCA inventes precios, stocks ni productos que no existan en el cat\u00e1logo.`,
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

