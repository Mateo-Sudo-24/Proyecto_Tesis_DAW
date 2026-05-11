import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Reset = () => {
    const { fetchDataBackend } = useFetch();
    const { token } = useParams();
    const navigate = useNavigate();
    const [tokenback, setTokenBack] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const changePassword = async (data) => {
        if (data.password !== data.confirmpassword) {
            toast.error("Las contrasenas no coinciden");
            return;
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/nuevo-password/${token}`;
            const response = await fetchDataBackend(url, data, 'POST');

            if (response?.msg) {
                toast.success(response.msg);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error("Hubo un error al cambiar la contrasena");
            }
        } catch (error) {
            toast.error("Error inesperado al cambiar la contrasena");
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/recuperar-password/${token}`;
                const response = await fetchDataBackend(url, null, 'GET');
                if (response?.msg) {
                    toast.success(response.msg);
                    setTokenBack(true);
                } else {
                    toast.error("Token invalido o expirado");
                }
            } catch (error) {
                toast.error("Error al verificar el token");
            }
        };
        verifyToken();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

            <h1 className="text-3xl font-semibold mb-2 text-center text-gray-500">
                Bienvenido nuevamente
            </h1>
            <small className="text-gray-400 block my-4 text-sm">
                Por favor, ingrese los siguientes datos
            </small>

            <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mb-6 border-4 border-amber-300">
                <span className="text-amber-800 font-bold text-xl">IN</span>
            </div>

            {tokenback && (
                <form className="w-80" onSubmit={handleSubmit(changePassword)}>
                    <div className="mb-1">
                        <label className="mb-2 block text-sm font-semibold">
                            Nueva contrasena
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contrasena"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("password", { required: "La contrasena es obligatoria" })}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        <label className="mb-2 block text-sm font-semibold mt-4">
                            Confirmar contrasena
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contrasena"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("confirmpassword", { required: "La confirmacion es obligatoria" })}
                        />
                        {errors.confirmpassword && <p className="text-red-500 text-xs mt-1">{errors.confirmpassword.message}</p>}
                    </div>
                    <div className="mb-3">
                        <button
                            type="submit"
                            className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;
