import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Obtiene el token de autenticación desde localStorage y prepara
 * los encabezados para las peticiones a la API.
 * @returns {object|null} Un objeto con los encabezados o null si no hay token.
 */
const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    if (!storedUser?.state?.token) {
        console.error("Token de autenticación no encontrado.");
        toast.error("Acceso denegado. Por favor, inicia sesión.");
        return null;
    }
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        },
    };
};

const useOrderStore = create((set, get) => ({
    // STATE: aquí se guarda el estado de las órdenes
    orders: [], // Lista de todas las órdenes del usuario
    currentOrder: null, // Para guardar los detalles de una orden específica
    loading: false, // Para saber cuándo se está realizando una petición
    error: null, // Para manejar errores

    // ACTIONS: funciones para interactuar con la API y modificar el estado

    /**
     * Registra una nueva orden en el backend.
     * @param {object} orderData - Los datos de la orden, incluyendo direccionEnvio y metodoPago.
     * @param {function} navigate - La función navigate de React Router para redirigir al usuario.
     */
    createOrder: async (orderData, navigate) => {
        set({ loading: true, error: null });
        const config = getAuthHeaders();
        if (!config) {
            return set({ loading: false });
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/ordenes`;
            const response = await axios.post(url, orderData, config);
            
            toast.success(response.data.msg || "¡Orden creada exitosamente!");

            // Una vez creada la orden, redirige al usuario al dashboard o a su lista de órdenes.
            if (navigate) {
                navigate("/dashboard");
            }

        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error al crear la orden.";
            toast.error(errorMessage);
            set({ error: errorMessage });
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Obtiene la lista de órdenes del usuario autenticado.
     */
    fetchOrders: async () => {
        set({ loading: true, error: null });
        const config = getAuthHeaders();
        if (!config) return set({ loading: false });

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/ordenes`;
            const response = await axios.get(url, config);
            set({ orders: response.data, loading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "No se pudieron cargar las órdenes.";
            toast.error(errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },

    /**
     * Obtiene los detalles de una orden específica por su ID.
     * @param {string} id - El ID de la orden a buscar.
     */
    fetchOrderById: async (id) => {
        set({ loading: true, error: null, currentOrder: null });
        const config = getAuthHeaders();
        if (!config) return set({ loading: false });

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/ordenes/${id}`;
            const response = await axios.get(url, config);
            set({ currentOrder: response.data, loading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.msg || "No se pudo cargar el detalle de la orden.";
            toast.error(errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },

    /**
     * Actualiza el estado de una orden (acción para vendedores/admins).
     * @param {string} id - El ID de la orden a actualizar.
     * @param {string} newStatus - El nuevo estado de la orden.
     */
    updateOrderStatus: async (id, newStatus) => {
        set({ loading: true });
        const config = getAuthHeaders();
        if (!config) return set({ loading: false });

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/ordenes/${id}`;
            const response = await axios.patch(url, { estado: newStatus }, config);
            
            // Actualiza la lista de órdenes en el estado para reflejar el cambio al instante.
            set(state => ({
                orders: state.orders.map(order => 
                    order._id === id ? { ...order, estado: newStatus } : order
                ),
            }));

            toast.success(response.data.msg || "Estado de la orden actualizado.");

        } catch (error) {
            const errorMessage = error.response?.data?.msg || "Error al actualizar la orden.";
            toast.error(errorMessage);
            set({ error: errorMessage });
        } finally {
            set({ loading: false });
        }
    },
}));

export default useOrderStore;