import { create } from "zustand";
import axios from "axios";
import { toast } from 'react-toastify'; // Importa toast para usarlo en las nuevas acciones

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

// Modificamos esta función para que nos sirva para perfil Y cambio de contraseña
const getApiUrlByRole = (rol, action) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL;
    if (!baseUrl || !rol) return null;

    let path;
    switch (rol) {
        case 'administrador':
            path = action === 'password' ? '/admin/perfil/password' : '/admin/perfil';
            break;
        case 'vendedor':
            path = action === 'password' ? '/vendedores/perfil/password' : '/vendedores/perfil';
            break;
        case 'cliente':
            path = action === 'password' ? '/clientes/password' : '/clientes/perfil';
            break;
        default:
            return null;
    }
    return `${baseUrl}${path}`;
};

const getAuthHeaders = () => {
    const { token } = getAuthData();
    if (!token) return {};
    return {
        headers: {
            "Content-Type": "application/json", // Añadimos Content-Type aquí
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- EL STORE DE ZUSTAND ---

const useProfileStore = create((set, get) => ({ // Añadimos 'get' para poder leer el estado actual
    user: null,
    isAuthenticated: false,
    isLoading: true, // Lo cambiamos a true por defecto para la carga inicial

    profile: async () => {
        set({ isLoading: true });
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'profile');

        if (!url) {
            return set({ user: null, isAuthenticated: false, isLoading: false });
        }

        try {
            const respuesta = await axios.get(url, getAuthHeaders());
            set({ user: respuesta.data, isAuthenticated: true, isLoading: false });
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

    // --- ¡NUEVAS ACCIONES AÑADIDAS! ---

    /**
     * @param {object} data - Objeto con los campos del perfil a actualizar (nombre, apellido, etc.)
     */
    updateProfile: async (data) => {
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'profile');
        if (!url) return toast.error("No se pudo determinar la ruta del perfil.");

        try {
            // Se usa PUT para la actualización
            const respuesta = await axios.put(url, data, getAuthHeaders());
            
            // Actualizamos el estado 'user' con la nueva información del perfil
            // Usamos 'get().user' para fusionar los datos viejos con los nuevos
            set({ user: { ...get().user, ...respuesta.data.admin || respuesta.data.vendedor || respuesta.data.cliente } });
            
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast.error(error.response?.data?.msg || "No se pudo actualizar el perfil.");
        }
    },

    /**
     * @param {object} data - Objeto con { passwordActual, passwordNuevo }
     */
    updatePasswordProfile: async (data) => {
        const { rol } = getAuthData();
        const url = getApiUrlByRole(rol, 'password');
        if (!url) return { error: "No se pudo determinar la ruta de la contraseña." };

        try {
            const respuesta = await axios.put(url, data, getAuthHeaders());
            toast.success(respuesta?.data?.msg || "Contraseña actualizada con éxito.");
            return respuesta.data; // Devolvemos la respuesta para que el componente sepa que fue exitoso
        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
            toast.error(error.response?.data?.msg || "No se pudo actualizar la contraseña.");
            return { error: error.response?.data || "Error desconocido" }; // Devolvemos el error
        }
    }
}));

export default useProfileStore;