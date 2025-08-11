import logoConfirm from '../assets/imagen-check.webp';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Confirm = () => {
    const { token } = useParams();
    const location = useLocation();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verificando tu cuenta...');

    // Determina el endpoint y método según el rol
    const getVerificationDetails = () => {
        const path = location.pathname;
        if (path.includes('/vendedores/setup-account/')) {
            return {
                url: `${import.meta.env.VITE_BACKEND_URL}/vendedores/setup-account/${token}`,
                method: 'POST', // Para vendedores normalmente se requiere POST con password, pero aquí solo mostramos error
                role: 'vendedor'
            };
        }
        // Por defecto, cliente
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
                    respuesta = await axios.get(url);
                } else if (method === 'POST') {
                    // Para vendedores, normalmente se requiere un formulario de password.
                    // Aquí solo mostramos un mensaje informativo.
                    throw new Error("La activación de cuenta de vendedor requiere establecer una contraseña.");
                }
                setMessage(respuesta.data.msg || '¡Cuenta confirmada exitosamente!');
                setStatus('success');
                toast.success(respuesta.data.msg || '¡Cuenta confirmada!');
            } catch (error) {
                const errorMsg =
                    error.response?.data?.msg ||
                    error.message ||
                    'Hubo un error al confirmar la cuenta.';
                setMessage(errorMsg);
                setStatus('error');
                toast.error(errorMsg);
            }
        };
        verifyToken();
    }, [token, location.pathname]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
            <ToastContainer />
            <img className="object-cover h-60 w-60 rounded-full shadow-lg mb-8" src={logoConfirm} alt="Estado de Confirmación" />

            {status === 'success' && (
                <>
                    <h1 className="text-3xl font-bold text-green-600">¡Verificación Exitosa!</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                    <Link to="/login" className="mt-8 p-3 w-48 bg-gray-800 text-white rounded-xl hover:scale-105 duration-300">
                        Ir a Iniciar Sesión
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="text-3xl font-bold text-red-600">Error de Verificación</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                    <Link to="/register" className="mt-8 p-3 w-48 bg-orange-800 text-white rounded-xl hover:scale-105 duration-300">
                        Volver a Registrarse
                    </Link>
                </>
            )}

            {status === 'verifying' && (
                <>
                    <h1 className="text-3xl font-bold text-blue-600">Verificando...</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                </>
            )}
        </div>
    );
};