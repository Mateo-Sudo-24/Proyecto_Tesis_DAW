import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .ux-form-wrapper {
        max-width: 600px;
        margin: 2.5rem auto;
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.09);
        overflow: hidden;
    }
    .ux-form-header {
        background: #1f2937;
        padding: 1.75rem 2rem 1.5rem;
        color: #fff;
    }
    .ux-form-header h2 {
        font-size: 1.35rem;
        font-weight: 800;
        margin: 0 0 0.25rem;
        letter-spacing: -0.5px;
    }
    .ux-form-header p {
        font-size: 0.85rem;
        color: #9ca3af;
        margin: 0;
    }
    .ux-form-body { padding: 2rem; }
    .ux-field { margin-bottom: 1.25rem; }
    .ux-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        margin-bottom: 0.45rem;
    }
    .ux-input {
        width: 100%;
        padding: 0.7rem 1rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-size: 0.9rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        box-sizing: border-box;
    }
    .ux-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
        background: #fff;
    }
    .ux-input::placeholder { color: #c0c0c0; }
    .ux-error {
        font-size: 0.78rem;
        color: #ef4444;
        margin-top: 0.3rem;
    }
    .ux-divider {
        height: 1px;
        background: #f3f4f6;
        margin: 1.25rem 0;
    }
    .ux-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.75rem;
    }
    .btn-ux-primary {
        flex: 1;
        padding: 0.75rem 1rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: none;
        cursor: pointer;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
    }
    .btn-ux-primary:hover:not(:disabled) { background: var(--orange-dark); transform: translateY(-1px); }
    .btn-ux-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-ux-secondary {
        flex: 1;
        padding: 0.75rem 1rem;
        background: #f3f4f6;
        color: #374151;
        font-weight: 700;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: 1.5px solid #e5e7eb;
        cursor: pointer;
        transition: background 0.18s;
    }
    .btn-ux-secondary:hover { background: #e5e7eb; }
`;

/**
 * Formulario exclusivo para ACTUALIZAR un vendedor existente.
 * Solo se usa desde Update.jsx con los datos del vendedor ya cargados.
 */
const FormVendedor = ({ vendedor }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (vendedor) {
            reset({
                nombre: vendedor.nombre || "",
                apellido: vendedor.apellido || "",
                email: vendedor.email || "",
                direccion: vendedor.direccion || "",
                telefono: vendedor.telefono || "",
            });
        }
    }, [vendedor, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${vendedor._id}`;
        try {
            const response = await fetchDataBackend(url, data, "PUT");
            if (response) {
                toast.success("Vendedor actualizado correctamente");
                setTimeout(() => navigate("/dashboard/listar"), 1500);
            }
        } catch (error) {
            toast.error(error.message || "Error al actualizar el vendedor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="ux-form-wrapper">
                <div className="ux-form-header">
                    <h2>Editar Vendedor</h2>
                    <p>Modifica los datos del vendedor y guarda los cambios.</p>
                </div>

                <div className="ux-form-body">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Nombre */}
                        <div className="ux-field">
                            <label className="ux-label">Nombre *</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan"
                                className="ux-input"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="ux-error">⚠ {errors.nombre.message}</p>}
                        </div>

                        {/* Apellido */}
                        <div className="ux-field">
                            <label className="ux-label">Apellido *</label>
                            <input
                                type="text"
                                placeholder="Ej: García"
                                className="ux-input"
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="ux-error">⚠ {errors.apellido.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="ux-field">
                            <label className="ux-label">Correo electrónico *</label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className="ux-input"
                                {...register("email", {
                                    required: "El correo es obligatorio",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Correo inválido"
                                    }
                                })}
                            />
                            {errors.email && <p className="ux-error">⚠ {errors.email.message}</p>}
                        </div>

                        <div className="ux-divider" />

                        {/* Dirección */}
                        <div className="ux-field">
                            <label className="ux-label">Dirección *</label>
                            <input
                                type="text"
                                placeholder="Calle, número, ciudad"
                                className="ux-input"
                                {...register("direccion", { required: "La dirección es obligatoria" })}
                            />
                            {errors.direccion && <p className="ux-error">⚠ {errors.direccion.message}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="ux-field">
                            <label className="ux-label">Teléfono *</label>
                            <input
                                type="tel"
                                placeholder="Ej: 0987654321"
                                className="ux-input"
                                {...register("telefono", {
                                    required: "El teléfono es obligatorio",
                                    pattern: {
                                        value: /^[0-9]{7,15}$/,
                                        message: "Debe tener entre 7 y 15 dígitos"
                                    }
                                })}
                            />
                            {errors.telefono && <p className="ux-error">⚠ {errors.telefono.message}</p>}
                        </div>

                        <div className="ux-actions">
                            <button type="submit" disabled={isSubmitting} className="btn-ux-primary">
                                {isSubmitting ? "Guardando..." : "Actualizar Vendedor"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/listar")}
                                className="btn-ux-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default FormVendedor;

