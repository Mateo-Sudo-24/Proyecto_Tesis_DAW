import logoDog from '../assets/reset.webp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ✅ Asegura que se vean los Toasts
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ CORRECTO
import { useForm } from 'react-hook-form';

const Reset = () => {
    const { fetchDataBackend } = useFetch();
    const { token } = useParams();
    const navigate = useNavigate();
    const [tokenback, setTokenBack] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const changePassword = async (data) => {
        if (data.password !== data.confirmpassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/nuevopassword/${token}`;
            const response = await fetchDataBackend(url, data, 'POST');

            if (response?.msg) {
                toast.success(response.msg);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error("Hubo un error al cambiar la contraseña");
            }
        } catch (error) {
            toast.error("Error inesperado al cambiar la contraseña");
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/recuperarpassword/${token}`;
                const response = await fetchDataBackend(url, null, 'GET');
                if (response?.msg) {
                    toast.success(response.msg);
                    setTokenBack(true);
                } else {
                    toast.error("Token inválido o expirado");
                }
            } catch (error) {
                toast.error("Error al verificar el token");
            }
        };
        verifyToken();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <ToastContainer />
            <h1 className="text-3xl font-semibold mb-2 text-center text-gray-500">
                Bienvenido nuevamente
            </h1>
            <small className="text-gray-400 block my-4 text-sm">
                Por favor, ingrese los siguientes datos
            </small>
            <img
                className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600"
                src={logoDog}
                alt="Reset Password"
            />
            {tokenback && (
                <form className="w-80" onSubmit={handleSubmit(changePassword)}>
                    <div className="mb-1">
                        <label className="mb-2 block text-sm font-semibold">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("password", { required: "La contraseña es obligatoria" })}
                        />
                        {errors.password && <p className="text-red-800">{errors.password.message}</p>}

                        <label className="mb-2 block text-sm font-semibold">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("confirmpassword", { required: "La confirmación es obligatoria" })}
                        />
                        {errors.confirmpassword && <p className="text-red-800">{errors.confirmpassword.message}</p>}
                    </div>
                    <div className="mb-3">
                        <button className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white">
                            Enviar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;
