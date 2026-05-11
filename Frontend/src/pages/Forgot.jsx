import { useState } from 'react'
import { Link } from 'react-router'
import useFetch from '../hooks/useFetch'
import { useForm } from 'react-hook-form';
import { ToastContainer } from 'react-toastify'


export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { fetchDataBackend } = useFetch()
    const [tipoUsuario, setTipoUsuario] = useState('cliente')

    const endpoints = {
        administrador: '/admin/recuperar-password',
        cliente: '/clientes/recuperar-password',
        vendedor: '/vendedores/recuperar-password',
    }

    const sendMail = (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}${endpoints[tipoUsuario]}`
        fetchDataBackend(url, data, 'POST')
    }

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

            {/* Formulario - izquierda */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full px-4">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Olvidaste tu contrasena</h1>
                    <small className="text-gray-400 block my-4 text-sm">No te preocupes</small>

                    <form onSubmit={handleSubmit(sendMail)}>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Tipo de cuenta</label>
                            <select
                                value={tipoUsuario}
                                onChange={(e) => setTipoUsuario(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            >
                                <option value="cliente">Cliente</option>
                                <option value="vendedor">Vendedor</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </div>
                        <div className="mb-1">
                            <label className="mb-2 block text-sm font-semibold">Correo electronico</label>
                            <input
                                type="email"
                                placeholder="Ingresa un correo electronico valido"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("email", { required: "El correo electronico es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="mb-3">
                            <button
                                type="submit"
                                className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white"
                            >
                                Enviar correo
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 text-xs border-b-2 py-4">
                    </div>

                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p>Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">Iniciar sesion</Link>
                    </div>
                </div>
            </div>

            {/* Imagen - derecha */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/forgot.jpg')]
            bg-no-repeat bg-cover bg-center sm:block hidden bg-amber-100">
            </div>
        </div>
    )
}



