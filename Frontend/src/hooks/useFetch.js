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
        
        try {
            const authToken = JSON.parse(localStorage.getItem("auth-token"))?.state?.token || '';

            // Construir options dinámicamente
            const options = {
                method,
                url,
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                },
            };

            // No establecer Content-Type para FormData (axios lo hace automáticamente)
            if (!(data instanceof FormData)) {
                options.headers["Content-Type"] = "application/json";
            }

            // Solo agrega 'data' si el método lo requiere y hay datos
            if (["POST", "PUT", "PATCH"].includes(method) && data) {
                options.data = data;
            }

            const response = await axios(options);
            
            if (response?.data?.msg) {
                toast.success(response.data.msg);
            }
            
            return response.data;

        } catch (error) {
            console.error("Error capturado en useFetch:", error.response?.data?.msg || error.message);
            
            if (!suppressErrorToast) {
                toast.error(error.response?.data?.msg || "Ocurrió un error inesperado.");
            }

            return null;
        }
    };

    return { fetchDataBackend };
}

export default useFetch;