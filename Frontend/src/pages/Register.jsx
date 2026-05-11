import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer } from 'react-toastify';
import useFetch from '../hooks/useFetch';

export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();
    const navigate = useNavigate();

    const registro = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/registro`;
        const response = await fetchDataBackend(url, data, 'POST');
        if (response) {
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

            {/* Formulario - izquierda */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center overflow-y-auto">
                <div className="md:w-4/5 sm:w-full px-4 py-8">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Bienvenido</h1>
                    <small className="text-gray-400 block my-4 text-sm">Por favor ingresa tus datos</small>

                    <form onSubmit={handleSubmit(registro)}>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Nombre</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu nombre"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Apellido</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu apellido"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Direccion</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu direccion"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("direccion", { required: "La direccion es obligatoria" })}
                            />
                            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Telefono</label>
                            <input
                                type="tel"
                                placeholder="0999999999"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("telefono", {
                                    required: "El telefono es obligatorio",
                                    pattern: { value: /^[0-9]{10}$/, message: "El telefono debe tener 10 digitos" }
                                })}
                            />
                            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo electronico</label>
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("email", { required: "El correo electronico es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="mb-3 relative">
                            <label className="mb-2 block text-sm font-semibold">Contrasena</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500 pr-10"
                                    {...register("password", {
                                        required: "La contrasena es obligatoria",
                                        minLength: { value: 8, message: "Minimo 8 caracteres" }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="mb-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gray-500 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p>Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-gray-500 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900">Iniciar sesion</Link>
                    </div>
                </div>
            </div>

            {/* Imagen - derecha */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/registro.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden bg-amber-100"></div>
        </div>
    );
};


