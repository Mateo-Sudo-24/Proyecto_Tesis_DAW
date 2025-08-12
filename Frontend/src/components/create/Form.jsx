import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

export const Form = ({ usuarioToUpdate }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(usuarioToUpdate?.rol || "vendedor");

    useEffect(() => {
        if (usuarioToUpdate) {
            reset({
                nombre: usuarioToUpdate?.nombre || "",
                apellido: usuarioToUpdate?.apellido || "",
                email: usuarioToUpdate?.email || "",
                direccion: usuarioToUpdate?.direccion || "",
                telefono: usuarioToUpdate?.telefono || "",
            });
            setTipoUsuario(usuarioToUpdate?.rol || "vendedor");
        }
    }, [usuarioToUpdate, reset]);

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

        let baseUrl = tipoUsuario === "cliente" ? "/clientes" : "/vendedores";
        let url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}`;
        let method = "POST";

        if (usuarioToUpdate?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}/${usuarioToUpdate._id}`;
            method = "PUT";
        }

        try {
            const response = await fetchDataBackend(url, { ...data, rol: tipoUsuario }, method, headers);
            if (response) {
                toast.success(
                    usuarioToUpdate
                        ? `${tipoUsuario} actualizado correctamente`
                        : `${tipoUsuario} registrado correctamente`
                );
                setTimeout(() => {
                    navigate("/dashboard/listar");
                }, 1500);
            }
        } catch (error) {
            toast.error("Ocurrió un error al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all";
    const labelStyle = "mb-1 block text-sm font-semibold text-gray-700";
    const errorStyle = "text-sm text-red-600 mt-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <ToastContainer />
            <fieldset className="border border-gray-300 p-5 rounded-lg">
                <legend className="text-lg font-bold text-gray-800 px-2">
                    {usuarioToUpdate
                        ? `Editar ${tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)}`
                        : `Registrar ${tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)}`}
                </legend>

                <div className="mb-5">
                    <label className={labelStyle}>Tipo de usuario</label>
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                        className={inputStyle}
                    >
                        <option value="vendedor">Vendedor</option>
                        <option value="cliente">Cliente</option>
                    </select>
                </div>

                <div className="mb-5">
                    <label className={labelStyle}>Nombre</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className={inputStyle}
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombre && <p className={errorStyle}>{errors.nombre.message}</p>}
                </div>

                {tipoUsuario === "vendedor" && (
                    <div className="mb-5">
                        <label className={labelStyle}>Apellido</label>
                        <input
                            type="text"
                            placeholder="Apellido"
                            className={inputStyle}
                            {...register("apellido", { required: "El apellido es obligatorio" })}
                        />
                        {errors.apellido && <p className={errorStyle}>{errors.apellido.message}</p>}
                    </div>
                )}

                <div className="mb-5">
                    <label className={labelStyle}>Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className={inputStyle}
                        {...register("email", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                </div>

                <div className="mb-5">
                    <label className={labelStyle}>Dirección</label>
                    <input
                        type="text"
                        placeholder="Dirección"
                        className={inputStyle}
                        {...register("direccion", { required: "La dirección es obligatoria" })}
                    />
                    {errors.direccion && <p className={errorStyle}>{errors.direccion.message}</p>}
                </div>

                <div className="mb-5">
                    <label className={labelStyle}>Teléfono</label>
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
            </fieldset>

            <button
                type="submit"
                className={`w-full py-2 mt-6 font-bold rounded-lg text-white transition-all 
                ${isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Guardando..." : usuarioToUpdate ? "Actualizar" : "Registrar"}
            </button>
        </form>
    );
};
