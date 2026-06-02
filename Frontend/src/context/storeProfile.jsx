import { create } from "zustand";
import { toast } from 'react-toastify';

// --- FUNCIONES DE AYUDA (Helpers) ---

const getAuthData = () => {
    const storedAuth = localStorage.getItem("auth-token");
    if (!storedAuth) return { token: null, rol: null };
    try {
        const parsedAuth = JSON.parse(storedAuth);
        return {
            token: parsedAuth?.state?.token || null,
            rol: parsedAuth?.state?.rol || null,
        };
    } catch {
        return { token: null, rol: null };
    }
};

const getApiUrlByRole = (rol, action) => {
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api`;
    if (!baseUrl || !rol) return null;

    const apiBase = baseUrl;

    let path;
    switch (rol) {
        case 'administrador':
            path = action === 'password'
                ? '/admin/perfil/password'
                : action === 'verify-password'
                    ? '/admin/perfil/verificar-password'
                    : '/admin/perfil';
            break;
        case 'vendedor':
            path = action === 'password'
                ? '/vendedores/perfil/password'
                : action === 'verify-password'
                    ? '/vendedores/perfil/verificar-password'
                    : '/vendedores/perfil';
            break;
        case 'cliente':
            path = action === 'password'
                ? '/clientes/password'
                : action === 'verify-password'
                    ? '/clientes/verificar-password'
                    : '/clientes/perfil';
            break;
        default:
            return null;
    }
    return `${apiBase}${path}`;
};

const getAuthHeaders = () => {
    const { token } = getAuthData();
    if (!token) return {};
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- EL STORE DE ZUSTAND ---

const useProfileStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    profile: async () => {
        set({ isLoading: true });
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'profile');

        if (!url) {
            return set({ user: null, isAuthenticated: false, isLoading: false });
        }

        try {
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'GET',
                headers: headers.headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error("Error al obtener el perfil:", error);
            localStorage.removeItem("auth-token");
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearUser: () => {
        localStorage.removeItem("auth-token");
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    updateProfile: async (data) => {
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'profile');
        if (!url) return toast.error("No se pudo determinar la ruta del perfil.");

        try {
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers.headers,
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `HTTP ${response.status}`);
            }
            
            const respuestaData = await response.json();
            set({ user: { ...get().user, ...respuestaData.admin || respuestaData.vendedor || respuestaData.cliente } });
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast.error(error.message || "No se pudo actualizar el perfil.");
        }
    },

    updatePasswordProfile: async (data) => {
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'password');
        if (!url) return { error: "No se pudo determinar la ruta de la contraseña." };

        try {
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers.headers,
                body: JSON.stringify(data),
            });
            
            const respuestaData = await response.json();
            
            if (!response.ok) {
                throw new Error(respuestaData.msg || `HTTP ${response.status}`);
            }
            
            toast.success(respuestaData?.msg || "Contraseña actualizada con éxito.");
            return respuestaData;
        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
            toast.error(error.message || "No se pudo actualizar la contraseña.");
            return { error: error.message || "Error desconocido" };
        }
    },

    verifyCurrentPassword: async (passwordActual) => {
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'verify-password');
        if (!url) return { error: "No se pudo determinar la ruta de verificacion." };

        try {
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers: headers.headers,
                body: JSON.stringify({ passwordActual }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.msg || `HTTP ${response.status}`);
            }
            return data;
        } catch (error) {
            return { error: error.message || "No se pudo verificar la contrasena." };
        }
    }
}));

export default useProfileStore;
