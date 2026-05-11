import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ToastContainer, toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';
import loginImg from '../assets/login.jpg';

const loginStyles = `
    .login-btn-primary {
        width: 100%;
        display: block;
        text-align: center;
        padding: 1rem 1.5rem;
        background: #e8760a;
        color: #fff;
        font-weight: 800;
        font-size: 1.05rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(232,118,10,0.35);
        transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    }
    .login-btn-primary:hover:not(:disabled) {
        background: #c4620a;
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(232,118,10,0.4);
    }
    .login-btn-primary:active:not(:disabled) { transform: scale(0.97); }
    .login-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .login-btn-register {
        display: inline-block;
        padding: 0.85rem 2rem;
        background: #1f2937;
        color: #fde8ce;
        font-weight: 800;
        font-size: 1rem;
        border-radius: 0.75rem;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        transition: background 0.18s, transform 0.15s;
    }
    .login-btn-register:hover {
        background: #374151;
        transform: translateY(-1px);
    }
    .login-btn-register:active { transform: scale(0.97); }
`;

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();
    const { setToken, setRol, profile } = storeAuth();

    const loginUser = async (data) => {
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        if (!baseUrl || baseUrl === 'undefined' || !baseUrl.includes('http')) {
            setIsLoading(false);
            toast.error("Error de configuracion: Backend URL no definida. Contacta soporte.");
            return;
        }

        const url = `${baseUrl}/auth/login`;

        try {
            const response = await fetchDataBackend(url, data, 'POST');

            if (response && response.token) {
                setToken(response.token);
                setRol(response.rol);
                localStorage.setItem("auth-token", JSON.stringify({ state: { token: response.token, rol: response.rol } }));

                if (profile) await profile();

                toast.success(`Bienvenido ${response.nombre}!`);
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.message || "Credenciales invalidas o usuario no encontrado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen overflow-hidden">
            <style>{loginStyles}</style>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

            {/* ── Panel imagen ── */}
            <div
                className="hidden sm:block sm:w-1/2 h-full relative"
                style={{
                    backgroundImage: `url(${loginImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay degradado */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-amber-900/30 to-transparent" />

                {/* Branding sobre la imagen */}
                <div className="absolute bottom-10 left-8 text-white z-10">
                    <h2 className="text-4xl font-extrabold">
                        In<span className="text-amber-400">tex</span>
                    </h2>
                    <p className="text-amber-200 text-sm mt-1 font-medium tracking-wide">
                        Software textil inteligente
                    </p>
                </div>
            </div>

            {/* ── Panel formulario ── */}
            <div className="w-full sm:w-1/2 h-full bg-white flex justify-center items-center overflow-y-auto">
                <div className="w-full max-w-md px-8 py-10">

                    {/* Logo mobile */}
                    <p className="sm:hidden text-center text-2xl font-extrabold text-amber-800 mb-6">
                        Smart<span className="text-black">VET</span>
                    </p>

                    {/* Encabezado */}
                    <h1 className="text-3xl font-extrabold mb-1 text-gray-800 uppercase">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">Por favor ingresa tus datos para continuar</p>

                    <form onSubmit={handleSubmit(loginUser)} noValidate>

                        {/* Email */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                className="block w-full rounded-lg border border-gray-300 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200 py-2.5 px-3 text-gray-700 transition"
                                {...register("email", { required: "El correo es obligatorio" })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••••••••••"
                                    className="block w-full rounded-lg border border-gray-300 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200 py-2.5 px-3 text-gray-700 pr-11 transition"
                                    {...register("password", { required: "La contraseña es obligatoria" })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-amber-700 transition"
                                    aria-label="Mostrar u ocultar contraseña"
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
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Olvidaste contraseña (inline) */}
                        <div className="flex justify-end mb-5">
                            <Link to="/forgot" className="text-xs text-amber-700 hover:text-amber-900 hover:underline font-medium transition">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Botón principal */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="login-btn-primary"
                        >
                            {isLoading ? 'Verificando…' : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="my-6 grid grid-cols-3 items-center text-gray-300">
                        <hr className="border-gray-300" />
                        <p className="text-center text-sm text-gray-400 font-medium">O</p>
                        <hr className="border-gray-300" />
                    </div>


                    {/* Footer del form */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <Link to="/" className="text-sm text-gray-400 hover:text-amber-800 hover:underline transition">
                            ← Regresar
                        </Link>
                        <Link to="/register" className="login-btn-register">
                            Registrarse
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
