import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";


const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        },
    };
};


const storeProfile = create((set) => ({
        
        user: null,
        clearUser: () => set({ user: null }),
        profile: async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/admin/perfil`;
                const respuesta = await axios.get(url, getAuthHeaders())
                set({ user: respuesta.data })
            } catch (error) {
                console.error(error)
            }
        },
        updateProfile:async(data,id)=>{
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/admin/perfil`
                const respuesta = await axios.put(url, data,getAuthHeaders())
                set({ user: respuesta.data })
                toast.success("Perfil actualizado correctamente")
            } catch (error) {
                console.log(error)
                toast.error(error.response?.data?.msg)
            }
        },
        updatePasswordProfile:async(data,id)=>{
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/admin/perfil/password`
                const respuesta = await axios.put(url, data,getAuthHeaders())
                toast.success(respuesta?.data?.msg)
                return respuesta
            } catch (error) {
                console.log(error)
                toast.error(error.response?.data?.msg)
            }
        }
    })
)

export default storeProfile;
