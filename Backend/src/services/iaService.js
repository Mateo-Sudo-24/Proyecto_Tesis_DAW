// Servicio de IA para generación de avatares - Protegido en Backend
export const generateAvatar = async (prompt) => {
    const HF_API_KEY = process.env.VITE_HUGGINGFACE_API_KEY;
    const HF_API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

    if (!HF_API_KEY) {
        throw new Error('VITE_HUGGINGFACE_API_KEY no está configurado');
    }

    try {
        const response = await fetch(HF_API_URL, {
            headers: { Authorization: `Bearer ${HF_API_KEY}` },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    height: 512,
                    width: 512,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Error Hugging Face: ${response.statusText}`);
        }

        const blob = await response.blob();
        return await convertBlobToBase64(blob);
    } catch (error) {
        console.error("Error generando avatar:", error);
        throw error;
    }
};

export const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
