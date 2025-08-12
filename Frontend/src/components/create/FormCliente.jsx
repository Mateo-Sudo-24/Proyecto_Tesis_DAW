import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

export const FormCliente = ({ clienteToUpdate }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (clienteToUpdate) {
            reset({
                nombre: clienteToUpdate?.nombre || "",
                email: clienteToUpdate?.email || "",
                direccion: clienteToUpdate?.direccion || "",
                telefono: clienteToUpdate?.telefono || "",
            });
        }
    }, [clienteToUpdate, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        if (!storedUser?.state?.token) {
            toast.error("No estás autenticado.");
            setIsSubmitting(false);
            return;
        }
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };

        let url = `${import.meta.env.VITE_BACKEND_URL}/clientes`;
        let method = "POST";
        if (clienteToUpdate?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}/clientes/${clienteToUpdate._id}`;
            method = "PUT";
        }

        try {
            const response = await fetchDataBackend(url, data, method, headers);
            if (response) {
                toast.success(
                    clienteToUpdate
                        ? "Cliente actualizado correctamente"
                        : "Cliente registrado correctamente"
                );
                setTimeout(() => {
                    navigate("/dashboard/listar-clientes");
                }, 1500);
            }
        } catch (error) {
            toast.error("Ocurrió un error al guardar el cliente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ToastContainer />
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    {clienteToUpdate ? "Editar Cliente" : "Registrar Cliente"}
                </legend>

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Nombre</label>
                    <input
                        type="text"
                        placeholder="Nombre del cliente"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombre && <p className="text-red-800">{errors.nombre.message}</p>}
                </div>

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Correo del cliente"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("email", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                </div>

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Dirección</label>
                    <input
                        type="text"
                        placeholder="Dirección del cliente"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("direccion", { required: "La dirección es obligatoria" })}
                    />
                    {errors.direccion && <p className="text-red-800">{errors.direccion.message}</p>}
                </div>

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold">Teléfono</label>
                    <input
                        type="text"
                        placeholder="Teléfono del cliente"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("telefono", {
                            required: "El teléfono es obligatorio",
                            pattern: {
                                value: /^[0-9]{7,15}$/,
                                message: "Debe tener entre 7 y 15 dígitos"
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
                value={isSubmitting ? "Guardando..." : clienteToUpdate ? "Actualizar Cliente" : "Registrar Cliente"}
                disabled={isSubmitting}
            />
        </form>
    );
};
