import { Link, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const confirmStyles = `
    /* Animaciones para la página de confirmación */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }

    /* Contenedor principal */
    .confirm-container {
        animation: fadeIn 0.6s ease-out;
    }

    /* Panel izquierdo con imagen */
    .confirm-image-panel {
        animation: slideInLeft 0.8s ease-out;
    }

    /* Icono de estado */
    .status-icon {
        animation: fadeIn 0.5s ease-out;
    }

    .status-icon.success {
        animation: fadeIn 0.5s ease-out, bounce 0.6s ease-out 0.3s;
    }

    .status-icon.error {
        animation: fadeIn 0.5s ease-out;
    }

    .status-icon.verifying {
        animation: fadeIn 0.5s ease-out, pulse-glow 2s ease-in-out infinite;
    }

    /* Contenido de texto */
    .confirm-content {
        animation: fadeIn 0.6s ease-out 0.2s both;
    }

    /* Botones */
    .confirm-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .confirm-button:hover {
        transform: translateY(-2px);
    }

    .confirm-button:active {
        transform: translateY(0);
    }

    /* Logo móvil */
    .mobile-logo {
        animation: fadeIn 0.4s ease-out;
    }

    /* Footer */
    .confirm-footer {
        animation: fadeIn 0.8s ease-out 0.4s both;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
        .confirm-container {
            animation: fadeIn 0.5s ease-out;
        }
    }

    /* Mejoras de accesibilidad */
    @media (prefers-reduced-motion: reduce) {
        .confirm-container,
        .confirm-image-panel,
        .status-icon,
        .confirm-content,
        .confirm-button,
        .mobile-logo,
        .confirm-footer {
            animation: none;
        }
    }
`;

export const Confirm = () => {
    const { token } = useParams();
    const location = useLocation();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verificando tu cuenta...');

    const getVerificationDetails = () => {
        return {
            url: `${import.meta.env.VITE_BACKEND_URL}/api/clientes/confirmar/${token}`,
            method: 'GET',
            role: 'usuario'
        };
    };

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token no proporcionado.');
                return;
            }

            const { url } = getVerificationDetails();

            try {
                const response = await fetch(url);
                const respuesta = await response.json();

                if (!response.ok) {
                    throw new Error(respuesta.msg || `Error ${response.status}`);
                }

                setMessage(respuesta.msg || '¡Cuenta confirmada exitosamente!');
                setStatus('success');
                toast.success(respuesta.msg || 'Cuenta confirmada!');
            } catch (error) {
                const errorMsg = error.message || 'Hubo un error al confirmar la cuenta.';
                setMessage(errorMsg);
                setStatus('error');
                toast.error(errorMsg);
            }
        };
        verifyToken();
    }, [token, location.pathname]);

    return (
        <>
            <style>{confirmStyles}</style>
            <div className="min-h-screen flex confirm-container">

            {/* Panel izquierdo - imagen */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden confirm-image-panel">
                <img
                    src="/images/registro.jpg"
                    alt="Confirmación"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 to-gray-900/70 flex flex-col items-center justify-center p-12">
                    <h1 className="text-white text-5xl font-bold tracking-widest mb-4">UNITEX</h1>
                    <p className="text-amber-200 text-lg text-center">Gestión textil inteligente para tu negocio</p>
                </div>
            </div>

            {/* Panel derecho - contenido */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-8 py-16">

                {/* Logo móvil */}
                <div className="lg:hidden mb-8 mobile-logo">
                    <span className="text-3xl font-bold text-amber-700 tracking-widest">UNITEX</span>
                </div>

                {/* Icono de estado */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-lg status-icon ${
                    status === 'success' ? 'bg-green-100 border-4 border-green-400 success' :
                    status === 'error'   ? 'bg-red-100 border-4 border-red-400 error' :
                                          'bg-amber-100 border-4 border-amber-400 verifying'
                }`}>
                    {status === 'success' && (
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {status === 'error' && (
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {status === 'verifying' && (
                        <svg className="w-12 h-12 text-amber-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                </div>

                {/* Contenido por estado */}
                <div className="w-full max-w-md text-center confirm-content">
                    {status === 'success' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">¡Verificación Exitosa!</h2>
                            <p className="text-gray-500 mb-8">{message}</p>
                            <Link
                                to="/login"
                                className="block w-full py-3 px-6 bg-amber-700 text-white font-semibold rounded-xl hover:bg-amber-800 transition-all duration-300 shadow-md hover:shadow-lg confirm-button"
                            >
                                Iniciar sesión
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Error de Verificación</h2>
                            <p className="text-gray-500 mb-8">{message}</p>
                            <Link
                                to="/register"
                                className="block w-full py-3 px-6 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg confirm-button"
                            >
                                Volver a registrarse
                            </Link>
                        </>
                    )}

                    {status === 'verifying' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Verificando...</h2>
                            <p className="text-gray-500">{message}</p>
                        </>
                    )}
                </div>

                <p className="mt-12 text-xs text-gray-400 confirm-footer">© {new Date().getFullYear()} Unitex. Todos los derechos reservados.</p>
            </div>
        </div>
        </>
    );
}
