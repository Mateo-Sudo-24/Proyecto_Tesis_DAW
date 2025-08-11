import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

// Puedes pasar vendedorToUpdate como prop para modo edición
export const Form = ({ vendedorToUpdate }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-carga datos si es edición
    useEffect(() => {
        if (vendedorToUpdate) {
            reset({
                nombre: vendedorToUpdate?.nombre || "",
                apellido: vendedorToUpdate?.apellido || "",
                email: vendedorToUpdate?.email || "",
                direccion: vendedorToUpdate?.direccion || "",
                telefono: vendedorToUpdate?.telefono || "",
            });
        }
    }, [vendedorToUpdate, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        if (!storedUser?.state?.token) {
            toast.error("No estás autenticado. Por favor, inicia sesión de nuevo.");
            setIsSubmitting(false);
            return;
        }
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };

        let url = `${import.meta.env.VITE_BACKEND_URL}/vendedores`;
        let method = "POST";
        if (vendedorToUpdate?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${vendedorToUpdate._id}`;
            method = "PUT";
        }

        try {
            const response = await fetchDataBackend(url, data, method, headers);
            if (response) {
                toast.success(
                    vendedorToUpdate
                        ? "Vendedor actualizado correctamente"
                        : "Vendedor registrado correctamente"
                );
                setTimeout(() => {
                    navigate("/dashboard/listar");
                }, 1500);
            }
        } catch (error) {
            toast.error("Ocurrió un error al guardar el vendedor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ToastContainer />
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    {vendedorToUpdate ? "Editar Vendedor" : "Registrar Vendedor"}
                </legend>

                {/* Nombres */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Nombres</label>
                    <input
                        type="text"
                        placeholder="Ingresa los nombres del vendedor"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombre && <p className="text-red-800">{errors.nombre.message}</p>}
                </div>

                {/* Apellidos */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Apellidos</label>
                    <input
                        type="text"
                        placeholder="Ingresa los apellidos del vendedor"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("apellido", { required: "El apellido es obligatorio" })}
                    />
                    {errors.apellido && <p className="text-red-800">{errors.apellido.message}</p>}
                </div>

                {/* Correo electrónico */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("email", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                </div>

                {/* Dirección */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Dirección</label>
                    <input
                        type="text"
                        placeholder="Ingresa la dirección"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("direccion", { required: "La dirección es obligatoria" })}
                    />
                    {errors.direccion && <p className="text-red-800">{errors.direccion.message}</p>}
                </div>

                {/* Teléfono */}
                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Teléfono</label>
                    <input
                        type="text"
                        placeholder="Ingresa el teléfono"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("telefono", {
                            required: "El teléfono es obligatorio",
                            pattern: {
                                value: /^[0-9]{7,15}$/,
                                message: "El teléfono debe tener entre 7 y 15 dígitos"
                            }
                        })}
                    />
                    {errors.telefono && <p className="text-red-800">{errors.telefono.message}</p>}
                </div>
            </fieldset>

            <input
                type="submit"
                className="bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                hover:bg-gray-600 cursor-pointer transition-all"
                value={isSubmitting ? "Guardando..." : vendedorToUpdate ? "Actualizar Vendedor" : "Registrar Vendedor"}
                disabled={isSubmitting}
            />
        </form>
    );
};