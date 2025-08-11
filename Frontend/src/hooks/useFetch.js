// useFetch.js
import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
    const fetchDataBackend = async (url, data = null, method = "GET", headers = {}) => {
        const loadingToast = toast.loading("Procesando solicitud...");
        try {
            const options = {
                method,
                url,
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                data,
            };
            const response = await axios(options);
            toast.dismiss(loadingToast); 
            toast.success(response?.data?.msg);
            return response?.data; // <-- Esto devuelve los datos
        } catch (error) {
            toast.dismiss(loadingToast); 
            console.error(error);
            toast.error(error.response?.data?.msg || "Error en la solicitud");

            // Devolver algo para evitar undefined
            return { error: true, status: error.response?.status, msg: error.response?.data?.msg };
        }
    };

    return { fetchDataBackend };
}

export default useFetch;
