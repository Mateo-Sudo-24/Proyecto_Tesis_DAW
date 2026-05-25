/**
 * Cloudinary frontend service.
 * Upload uses an unsigned preset — no API_SECRET exposed.
 * Secret operations go through the backend.
 */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a File to Cloudinary using an unsigned upload preset.
 * @param {File} file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (file) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Faltan variables de entorno: VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Error Cloudinary ${res.status}`);
    }
    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
};

export const editCloudinaryImage = async ({ file, url }) => {
    if (file) return uploadToCloudinary(file);
    if (url?.trim()) return { url: url.trim(), publicId: '' };
    return { url: '', publicId: '' };
};

export const deleteCloudinaryImage = async (productId, token) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl || !productId) return null;

    const res = await fetch(`${backendUrl}/productos/${productId}/imagen`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || `Error al eliminar imagen ${res.status}`);
    }
    return res.json();
};

/**
 * Create a temporary object URL for previewing a file before upload.
 * Remember to call revokePreviewUrl when done.
 * @param {File} file
 * @returns {string}
 */
export const getPreviewUrl = (file) => URL.createObjectURL(file);

/**
 * Release a previously created object URL.
 * @param {string} url
 */
export const revokePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
};

/**
 * Check whether a product name already exists in the backend.
 * Returns true if a duplicate is found.
 * @param {string} nombre
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const checkDuplicateProductName = async (nombre, token) => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(
            `${backendUrl}/productos?busqueda=${encodeURIComponent(nombre.trim())}&limite=100`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return false;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.productos ?? []);
        return list.some(
            (p) => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        );
    } catch {
        return false;
    }
};
