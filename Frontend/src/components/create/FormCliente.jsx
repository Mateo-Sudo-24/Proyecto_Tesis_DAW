import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

/**
 * ✅ FORMULARIO DE USUARIO
 * Crea o edita CLIENTE o VENDEDOR a través de un selector de tipo
 */
export const FormCliente = ({ clienteToUpdate }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(clienteToUpdate?.rol || "cliente");

    useEffect(() => {
        if (clienteToUpdate) {
            reset({
                nombre: clienteToUpdate?.nombre || "",
                apellido: clienteToUpdate?.apellido || "",
                email: clienteToUpdate?.email || "",
                direccion: clienteToUpdate?.direccion || "",
                telefono: clienteToUpdate?.telefono || "",
            });
            setTipoUsuario(clienteToUpdate?.rol || "cliente");
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

        // ✅ DETERMINAR ENDPOINT SEGÚN TIPO DE USUARIO
        let baseUrl = tipoUsuario === "cliente" ? "/clientes" : "/vendedores";
        let url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}`;
        let method = "POST";

        if (clienteToUpdate?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}/${clienteToUpdate._id}`;
            method = "PUT";
        }

        try {
            const response = await fetchDataBackend(url, data, method, headers);
            if (response) {
                const tipoNombre = tipoUsuario === "cliente" ? "Cliente" : "Vendedor";
                toast.success(
                    clienteToUpdate
                        ? `${tipoNombre} actualizado correctamente`
                        : `${tipoNombre} registrado correctamente`
                );
                setTimeout(() => {
                    navigate("/dashboard/listar");
                }, 1500);
            }
        } catch (error) {
            const tipoNombre = tipoUsuario === "cliente" ? "cliente" : "vendedor";
            toast.error(`Ocurrió un error al guardar el ${tipoNombre}.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all";
    const labelStyle = "mb-1 block text-sm font-semibold text-gray-700";
    const errorStyle = "text-sm text-red-600 mt-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <ToastContainer />
            <fieldset className="border border-gray-300 p-5 rounded-lg">
                <legend className="text-lg font-bold text-gray-800 px-2">
                    {clienteToUpdate
                        ? `Editar ${tipoUsuario === "cliente" ? "Cliente" : "Vendedor"}`
                        : `Registrar ${tipoUsuario === "cliente" ? "Cliente" : "Vendedor"}`}
                </legend>

                {/* ✅ SELECTOR DE TIPO DE USUARIO */}
                <div className="mb-5">
                    <label className={labelStyle}>Tipo de usuario *</label>
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                        className={inputStyle}
                    >
                        <option value="cliente">Cliente</option>
                        <option value="vendedor">Vendedor</option>
                    </select>
                </div>

                {/* Nombre */}
                <div className="mb-5">
                    <label className={labelStyle}>Nombre *</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className={inputStyle}
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombre && <p className={errorStyle}>{errors.nombre.message}</p>}
                </div>

                {/* Apellido (solo para vendedor) */}
                {tipoUsuario === "vendedor" && (
                    <div className="mb-5">
                        <label className={labelStyle}>Apellido *</label>
                        <input
                            type="text"
                            placeholder="Apellido"
                            className={inputStyle}
                            {...register("apellido", { required: "El apellido es obligatorio para vendedores" })}
                        />
                        {errors.apellido && <p className={errorStyle}>{errors.apellido.message}</p>}
                    </div>
                )}

                {/* Email */}
                <div className="mb-5">
                    <label className={labelStyle}>Correo electrónico *</label>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className={inputStyle}
                        {...register("email", { 
                            required: "El correo electrónico es obligatorio",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Correo inválido"
                            }
                        })}
                    />
                    {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                </div>

                {/* Dirección */}
                <div className="mb-5">
                    <label className={labelStyle}>Dirección *</label>
                    <input
                        type="text"
                        placeholder="Dirección"
                        className={inputStyle}
                        {...register("direccion", { required: "La dirección es obligatoria" })}
                    />
                    {errors.direccion && <p className={errorStyle}>{errors.direccion.message}</p>}
                </div>

                {/* Teléfono */}
                <div className="mb-5">
                    <label className={labelStyle}>Teléfono *</label>
                    <input
                        type="text"
                        placeholder="Teléfono"
                        className={inputStyle}
                        {...register("telefono", {
                            required: "El teléfono es obligatorio",
                            pattern: {
                                value: /^[0-9]{7,15}$/,
                                message: "Debe tener entre 7 y 15 dígitos"
                            }
                        })}
                    />
                    {errors.telefono && <p className={errorStyle}>{errors.telefono.message}</p>}
                </div>

                {/* Botones */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? "Guardando..." : (clienteToUpdate ? "Actualizar" : "Registrar")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/listar")}
                        className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition font-semibold"
                    >
                        Cancelar
                    </button>
                </div>
            </fieldset>
        </form>
    );
};
