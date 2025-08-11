import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ToastContainer, toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();
    const { setToken, setRol, profile } = storeAuth(); // Asumiendo que tu store tiene estas acciones

    const loginUser = async (data) => {
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        const rolesToCheck = ['admin', 'vendedores', 'clientes'];
        let loginSuccess = false;

        for (const rol of rolesToCheck) {
            const url = `${baseUrl}/${rol}/login`;
            // El 'true' final es para que el hook suprima los toasts de error en los intentos fallidos
            const response = await fetchDataBackend(url, data, 'POST', true); 
            
            if (response) {
                // Si la respuesta es exitosa, guardar datos y salir del bucle
                setToken(response.token);
                setRol(response.rol);
                localStorage.setItem("auth-token", JSON.stringify({ state: { token: response.token, rol: response.rol } }));
                
                if (profile) await profile();
                
                navigate('/dashboard');
                loginSuccess = true;
                break;
            }
        }
        
        setIsLoading(false);

        if (!loginSuccess) {
            toast.error("Credenciales inválidas o usuario no encontrado.");
        }
    };

    const loginWithGoogle = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            
            {/* Imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/telaLogin.jpg')] 
            bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>

            {/* Contenedor de formulario */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full p-8">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Bienvenido(a) de nuevo</h1>
                    <small className="text-gray-400 block my-4 text-sm text-center">Por favor ingresa tus datos</small>

                    <form onSubmit={handleSubmit(loginUser)}>
                        {/* Correo electrónico */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input 
                                type="email" 
                                placeholder="Ingresa tu correo" 
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500" 
                                {...register("email", { required: "El correo es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-500 pr-10"
                                    {...register("password", { required: "La contraseña es obligatoria" })}
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

                        {/* Botón de iniciar sesión */}
                        <div className="my-4">
                             <button 
                                type="submit"
                                disabled={isLoading}
                                className="py-2 w-full block text-center bg-gray-500 text-slate-300 border rounded-xl 
                                           hover:scale-100 duration-300 hover:bg-gray-900 hover:text-white
                                           disabled:bg-gray-400 disabled:cursor-wait">
                                {isLoading ? 'Verificando...' : 'Iniciar sesión'}
                             </button>
                        </div>
                    </form>

                    {/* Separador con opción de "O" */}
                    <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
                        <hr className="border-gray-400" />
                        <p className="text-center text-sm">O</p>
                        <hr className="border-gray-400" />
                    </div>

                    {/* Botón de inicio de sesión con Google */}
                    <button onClick={loginWithGoogle} className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-105 duration-300 hover:bg-black hover:text-white">
                        <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google icon" />
                        Iniciar sesión con Google
                    </button>

                    {/* Olvidaste tu contraseña */}
                    <div className="mt-5 text-xs border-b-2 py-4 text-right">
                        <Link to="/forgot-password" className="underline text-sm text-gray-400 hover:text-gray-900">¿Olvidaste tu contraseña?</Link>
                    </div>

                    {/* Enlaces para volver o registrarse */}
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p className="text-gray-600">¿No tienes una cuenta?</p>
                        <Link to="/register" className="py-2 px-5 bg-orange-800 text-white border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-slate-300">Registrarse</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;