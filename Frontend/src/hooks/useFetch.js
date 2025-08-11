import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
    // El 'showToastOnError' es un nuevo parámetro opcional
    const fetchDataBackend = async (url, data = null, method = "GET", showToastOnError = true) => {
        const loadingToast = toast.loading("Procesando solicitud...");
        try {
            const options = {
                method,
                url,
                // Obtenemos el token de localStorage para las peticiones autenticadas
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth-token"))?.state?.token || ''}`,
                },
                data,
            };
            const response = await axios(options);

            toast.dismiss(loadingToast);

            // Solo mostrar toast de éxito si el backend envía un mensaje 'msg'
            if (response?.data?.msg) {
                toast.success(response.data.msg);
            }
            
            return response.data; // Devuelve los datos en caso de éxito

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error capturado en useFetch:", error);

            // El nuevo parámetro nos permite suprimir el toast de error si no lo queremos
            if (showToastOnError) {
                toast.error(error.response?.data?.msg || "Ocurrió un error inesperado.");
            }

            // --- ¡EL CAMBIO MÁS IMPORTANTE! ---
            // Devolver 'null' en caso de error para una comprobación inequívoca.
            return null;
        }
    };

    return { fetchDataBackend };
}

export default useFetch;