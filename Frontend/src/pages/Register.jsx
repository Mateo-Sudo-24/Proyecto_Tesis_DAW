import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer } from 'react-toastify';
import useFetch from '../hooks/useFetch';

// Se exporta como 'Register' para mantener la consistencia con tu código
export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend, isLoading } = useFetch(); // Asumimos que tu hook devuelve isLoading
    const navigate = useNavigate();

    // Función que se ejecuta al enviar el formulario
    const registro = async (data) => {
        // La URL apunta directamente al endpoint de registro de clientes
        const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/registro`;
        
        // Usamos nuestro hook para enviar la petición
        const response = await fetchDataBackend(url, data, 'POST');

        // Si el registro es exitoso (el hook no devolvió null), redirigimos al login
        if (response) {
            // Esperamos unos segundos para que el usuario pueda leer el toast de éxito
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        }
        // Si la petición falla, el hook 'useFetch' ya se encarga de mostrar el toast de error
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

            {/* Sección de formulario de registro */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center overflow-y-auto py-8">
                <div className="md:w-4/5 sm:w-full px-8">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Crea tu Cuenta</h1>
                    <small className="text-gray-400 block my-4 text-sm text-center">Por favor ingresa tus datos para unirte</small> 
                    
                    <form onSubmit={handleSubmit(registro)}>
                        {/* Campo para nombre */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Nombre</label>
                            <input 
                                type="text" 
                                placeholder="Ingresa tu nombre" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>

                        {/* Campo para apellido */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Apellido</label>
                            <input 
                                type="text" 
                                placeholder="Ingresa tu apellido" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="text-red-600 text-xs mt-1">{errors.apellido.message}</p>}
                        </div>

                        {/* Campo para dirección */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Dirección</label>
                            <input 
                                type="text" 
                                placeholder="Ingresa tu dirección de domicilio" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("direccion", { required: "La dirección es obligatoria" })}
                            />
                            {errors.direccion && <p className="text-red-600 text-xs mt-1">{errors.direccion.message}</p>}
                        </div>
                        
                        {/* Campo para celular */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Celular</label>
                            <input 
                                type="tel" // 'tel' es semánticamente mejor para números de teléfono
                                placeholder="Ingresa tu celular" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("telefono", { // Corregido a 'telefono' para coincidir con tu backend
                                    required: "El celular es obligatorio",
                                    pattern: { value: /^[0-9]{10}$/, message: "El celular debe tener 10 dígitos" }
                                })}
                            />
                            {errors.telefono && <p className="text-red-600 text-xs mt-1">{errors.telefono.message}</p>}
                        </div>

                        {/* Campo para correo electrónico */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input 
                                type="email" 
                                placeholder="Ingresa tu correo electrónico" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("email", { required: "El correo electrónico es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Campo para contraseña */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500 pr-10"
                                    {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" } })}
                                />
                                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Botón para enviar el formulario */}
                        <div className="mb-3">
                            <button 
                                type="submit"
                                disabled={isLoading} // Se deshabilita durante la carga
                                className="bg-gray-500 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white disabled:bg-gray-400 disabled:cursor-wait"
                            >
                                {isLoading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                    </form>

                    {/* Enlace para iniciar sesión si ya tiene una cuenta */}
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p className="text-gray-600">¿Ya posees una cuenta?</p>
                        <Link to="/login" className="block bg-orange-800 w-40 py-2 text-white rounded-2xl text-center sm:mx-0 hover:bg-orange-700">Iniciar sesión</Link>
                    </div>
                </div>
            </div>

            {/* Sección con imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/telaRegistro.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden"></div>
        </div>
    );
};

// Exportación por defecto
export default Register;