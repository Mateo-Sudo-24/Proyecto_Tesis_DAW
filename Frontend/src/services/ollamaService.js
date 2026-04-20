// DEPRECATED: Este servicio ya no se utiliza
// Usar chatbotBackendService.js con consultarGroqBackend() en su lugar

console.warn('OllamaService está deprecado. Usa consultarGroqBackend de chatbotBackendService.js');

class OllamaService {
    constructor() {
        console.warn('OllamaService está deprecado');
    }

    async consultar() {
        throw new Error('OllamaService está deprecado. Usa consultarGroqBackend en su lugar.');
    }
}

export default new OllamaService();