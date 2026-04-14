class OllamaService {
    constructor() {
        this.url = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api/chat';
        this.model = import.meta.env.VITE_OLLAMA_MODEL || 'miasesor-telas';
        this.timeout = 60000;
    }

    async consultar(mensajeUsuario, imagenBase64 = null, historial = []) {
        const userMessage = {
            role: 'user',
            content: mensajeUsuario,
        };

        if (imagenBase64) {
            userMessage.images = [imagenBase64];
        }

        const messages = [
            {
                role: 'system',
                content: `Eres un experto en telas y vendedor de una tienda online. Tu nombre es IntexAsesor.

Cuando un usuario suba una foto de una tela:
1. Analiza la tela en la imagen (ignora fondos, manos, etc.).
2. Tu PRIMERA respuesta DEBE SER ÚNICAMENTE un objeto JSON con este formato exacto:
{
  "tipoTela": "ej. algodón, lino, poliéster",
  "color": "ej. beige claro, azul marino",
  "textura": "ej. suave y lisa, rugosa",
  "patron": "ej. liso, a rayas, floral",
  "confianza": 0.85
}
3. Después del JSON, en un nuevo mensaje, saluda amigablemente y menciona los resultados del análisis.
4. Luego, sugiere qué productos de la tienda podrían gustarle al cliente basándote en el análisis.

Responde siempre en español, con un tono amigable y comercial.`
            },
            ...historial,
            userMessage
        ];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                    format: 'json'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Modelo '${this.model}' no encontrado en Ollama.`);
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data.message || !data.message.content) {
                throw new Error('Respuesta inválida del servidor.');
            }
            return data.message.content;
        } catch (error) {
            console.error("OllamaService error:", error.message);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: Ollama tardó demasiado en responder.');
            }
            throw error;
        }
    }
}

export default new OllamaService();