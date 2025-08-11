const API_URL ="https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY

async function generateAvatar(prompt) {
    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({"inputs": prompt}),
    })
    return await response.blob()
}

// Un blob (Binary Large OBject) es una forma de guardar archivos, 
// como imágenes o videos, en la memoria del navegador.


const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        // se usa un lector de archivos
        const reader = new FileReader()
        // cuando termine, se devuelve el resultado (base64)
        reader.onloadend = () => resolve(reader.result)
        // si hay error, se rechaza
        reader.onerror = reject
        // se convierte el blob a base64
        reader.readAsDataURL(blob)
    })
}

// Es una forma de representar imágenes como texto, para 
// que se puedan ponerlas directamente en el HTML sin subirlas a un servidor.
// https://www.base64-image.de/

export {
    generateAvatar,
    convertBlobToBase64
}