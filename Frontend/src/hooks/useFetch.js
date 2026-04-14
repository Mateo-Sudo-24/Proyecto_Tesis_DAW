import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

function useFetch() {
    /**
     * Hook personalizado para realizar peticiones al backend.
     * @param {string} url - La URL del endpoint.
     * @param {object} data - El cuerpo de la petición (para POST, PUT, etc.).
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE).
     * @param {boolean} suppressErrorToast - Si es 'true', no mostrará un toast en caso de error.
     * @returns {Promise<object|null>} Los datos de la respuesta en caso de éxito, o 'null' en caso de error.
     */
    const [isLoading, setIsLoading] = useState(false);

    const fetchDataBackend = async (url, data = null, method = "GET", suppressErrorToast = false) => {
        
        try {
            setIsLoading(true);
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
            
            setIsLoading(false);
            return response.data;

        } catch (error) {
            console.error("❌ Error completo:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error message:", error.message);
            console.error("❌ Error code:", error.code);
            
            // Intentar obtener el mensaje de error
            const errorMsg = error.response?.data?.msg || error.message || "Ocurrió un error inesperado.";
            
            if (!suppressErrorToast) {
                toast.error(errorMsg);
            }

            setIsLoading(false);
            return null;
        }
    };

    return { fetchDataBackend, isLoading };
}

export default useFetch;