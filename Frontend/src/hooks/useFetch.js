import { toast } from "react-toastify";
import { useState } from "react";

function useFetch() {
    /**
     * Hook personalizado para realizar peticiones al backend usando Fetch API nativa.
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

            // Construir opciones para Fetch API
            const options = {
                method,
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                },
            };

            // Manejar el cuerpo de la petición
            if (["POST", "PUT", "PATCH"].includes(method) && data) {
                if (data instanceof FormData) {
                    // Para FormData, NO establecer Content-Type (browser lo hace automáticamente)
                    options.body = data;
                } else {
                    // Para JSON
                    options.headers["Content-Type"] = "application/json";
                    options.body = JSON.stringify(data);
                }
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = responseData?.msg || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMsg);
            }

            if (responseData?.msg && method !== "GET") {
                toast.success(responseData.msg);
            }
            
            setIsLoading(false);
            return responseData;

        } catch (error) {
            const errorMsg = error.message || "Ocurrió un error inesperado.";
            
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