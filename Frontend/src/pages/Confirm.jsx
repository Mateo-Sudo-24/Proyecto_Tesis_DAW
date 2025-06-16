import logoDog from '../assets/imagen-check.webp'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const Confirm = () => {
    const { token } = useParams()

    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/confirmar/${token}`
            const respuesta = await axios.get(url)
            toast.success(respuesta?.data?.msg || 'Cuenta confirmada')
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Hubo un error al confirmar')
        }
    }

    useEffect(() => {
        verifyToken()
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <ToastContainer />
            <img className="object-cover h-80 w-80 border-4" src={logoDog} alt="image description" />
            <div className="flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-12">Muchas Gracias</p>
                <p className="md:text-lg lg:text-xl text-gray-600 mt-8">Ya puedes iniciar sesión</p>
                <Link to="/login" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">
                    Login
                </Link>
            </div>
        </div>
    )
}
