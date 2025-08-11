import { create } from "zustand";
import axios from "axios";

// --- FUNCIONES DE AYUDA ---

// Obtiene los datos de autenticación (token y rol) del localStorage.
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

// Construye la URL correcta del endpoint de perfil basado en el rol del usuario.
const getProfileUrlByRole = (rol) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL;
    if (!baseUrl) return null;
    switch (rol) {
        case 'administrador':
            return `${baseUrl}/admin/perfil`;
        case 'vendedor':
            return `${baseUrl}/vendedores/perfil`;
        case 'cliente':
            return `${baseUrl}/clientes/perfil`;
        default:
            return null; // Si no hay rol, no hay URL.
    }
};

// Construye las cabeceras de autorización con el token.
const getAuthHeaders = () => {
    const { token } = getAuthData();
    if (!token) return {};
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- EL STORE DE ZUSTAND ---

const useProfileStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    profile: async () => {
        set({ isLoading: true }); // Asegura que isLoading sea true al iniciar la petición
        const { rol } = getAuthData();
        const url = getProfileUrlByRole(rol);

        if (!url) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            const respuesta = await axios.get(url, getAuthHeaders());
            set({ user: respuesta.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error("Error al obtener el perfil (token expirado o inválido):", error);
            localStorage.removeItem("auth-token");
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearUser: () => {
        localStorage.removeItem("auth-token");
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
}));

export default useProfileStore;