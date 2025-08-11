import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
    /**
     * Hook personalizado para realizar peticiones al backend.
     * @param {string} url - La URL del endpoint.
     * @param {object} data - El cuerpo de la petición (para POST, PUT, etc.).
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE).
     * @param {boolean} suppressErrorToast - Si es 'true', no mostrará un toast en caso de error.
     * @returns {Promise<object|null>} Los datos de la respuesta en caso de éxito, o 'null' en caso de error.
     */
    const fetchDataBackend = async (url, data = null, method = "GET", suppressErrorToast = false) => {
        
        // No mostraremos un toast de carga aquí para dar más control al componente que lo llama.
        // El componente Login ya gestiona su propio estado 'isLoading'.
        
        try {
            // Obtener el token del localStorage para incluirlo en TODAS las peticiones.
            // El backend simplemente lo ignorará si la ruta es pública.
            const authToken = JSON.parse(localStorage.getItem("auth-token"))?.state?.token || '';

            const options = {
                method,
                url,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                data,
            };

            const response = await axios(options);
            
            // Mostrar un toast de éxito solo si el backend envía un mensaje explícito.
            // Esto evita toasts innecesarios en peticiones GET simples.
            if (response?.data?.msg) {
                toast.success(response.data.msg);
            }
            
            // En caso de éxito, devolver los datos de la respuesta.
            return response.data;

        } catch (error) {
            console.error("Error capturado en useFetch:", error.response?.data?.msg || error.message);
            
            // Mostrar un toast de error solo si no se ha pedido suprimirlo.
            if (!suppressErrorToast) {
                toast.error(error.response?.data?.msg || "Ocurrió un error inesperado.");
            }

            // --- ¡EL CAMBIO MÁS IMPORTANTE! ---
            // Devolver 'null' para que cualquier componente que use este hook
            // pueda verificar fácilmente si la petición falló.
            return null;
        }
    };

    return { fetchDataBackend };
}

export default useFetch;