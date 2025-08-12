// src/pages/SetupAccount.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';

const SetupAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();
    const password = watch("password"); // Para la confirmación de contraseña

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            return toast.error("Las contraseñas no coinciden.");
        }
        
        const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/setup-account/${token}`;
        const response = await fetchDataBackend(url, { password: data.password }, 'POST');

        if (response) {
            setTimeout(() => {
                navigate('/login'); // O a una página de login de staff
            }, 2500);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <ToastContainer />
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Active su Cuenta</h1>
                <p className="text-center text-gray-600 mb-6">Crea tu contraseña para empezar a usar Unitex.</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            className="w-full p-2 border rounded"
                            {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2">Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            className="w-full p-2 border rounded"
                            {...register("confirmPassword", { required: "Confirma tu contraseña", validate: value => value === password || "Las contraseñas no coinciden" })}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isLoading ? 'Activando...' : 'Activar y Guardar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupAccount;