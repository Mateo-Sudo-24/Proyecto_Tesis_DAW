import { Link, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Confirm = () => {
    const { token } = useParams();
    const location = useLocation();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verificando tu cuenta...');

    const getVerificationDetails = () => {
        const path = location.pathname;
        if (path.includes('/vendedores/setup-account/')) {
            return {
                url: `${import.meta.env.VITE_BACKEND_URL}/vendedores/setup-account/${token}`,
                method: 'POST',
                role: 'vendedor'
            };
        }
        return {
            url: `${import.meta.env.VITE_BACKEND_URL}/clientes/confirmar/${token}`,
            method: 'GET',
            role: 'cliente'
        };
    };

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token no proporcionado.');
                return;
            }

            const { url, method } = getVerificationDetails();

            try {
                let respuesta;
                if (method === 'GET') {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    respuesta = await response.json();
                } else if (method === 'POST') {
                    throw new Error("La activación de cuenta de vendedor requiere establecer una contraseña.");
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
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <ToastContainer />

            <div className="w-40 h-40 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 mb-8">
                <span className="text-amber-800 font-bold text-4xl">IN</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
                {status === 'success' && (
                    <>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-4">Verificacion Exitosa!</p>
                        <p className="md:text-lg lg:text-xl text-gray-600 mt-8">{message}</p>
                        <Link to="/login" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">Iniciar sesion</Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-4">Error de Verificacion</p>
                        <p className="md:text-lg lg:text-xl text-gray-600 mt-8">{message}</p>
                        <Link to="/register" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">Volver a Registrarse</Link>
                    </>
                )}

                {status === 'verifying' && (
                    <>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-4">Verificando...</p>
                        <p className="md:text-lg lg:text-xl text-gray-600 mt-8">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
}
