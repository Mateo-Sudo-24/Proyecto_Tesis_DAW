// src/pages/SetupAccount.jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';

const SetupAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();
    const password = watch("password");

    // Detectar si la ruta es para clientes o vendedores
    const isCliente = location.pathname.includes('/clientes/setup-account/');
    const entityPath = isCliente ? 'clientes' : 'vendedores';

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            return toast.error("Las contrasenas no coinciden.");
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/${entityPath}/setup-account/${token}`;
        const response = await fetchDataBackend(url, { password: data.password }, 'POST');

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
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full px-4">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Activa tu cuenta</h1>
                    <small className="text-gray-400 block my-4 text-sm">Crea tu contrasena para comenzar a usar Intex.</small>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Nueva contrasena</label>
                            <input
                                type="password"
                                placeholder="Minimo 6 caracteres"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("password", { required: "La contrasena es obligatoria", minLength: { value: 6, message: "Minimo 6 caracteres" } })}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Confirmar contrasena</label>
                            <input
                                type="password"
                                placeholder="Repite tu contrasena"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("confirmPassword", { required: "Confirma tu contrasena", validate: value => value === password || "Las contrasenas no coinciden" })}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Activando...' : 'Activar y guardar contrasena'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Imagen - derecha */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/dogregister.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden bg-amber-100"></div>
        </div>
    );
};

export default SetupAccount;
