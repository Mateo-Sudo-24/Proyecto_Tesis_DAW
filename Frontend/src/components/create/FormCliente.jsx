/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import storeProfile from "../../context/storeProfile";

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
    .ux-form-body {
        padding: 2rem;
    }
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
    .ux-input, .ux-select {
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
    .ux-input:focus, .ux-select:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
        background: #fff;
    }
    .ux-input::placeholder { color: #c0c0c0; }
    .ux-error {
        font-size: 0.78rem;
        color: #ef4444;
        margin-top: 0.3rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }
    .ux-type-selector {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .ux-type-btn {
        flex: 1;
        padding: 0.65rem 1rem;
        border-radius: 0.625rem;
        border: 1.5px solid #e5e7eb;
        background: #f3f4f6;
        color: #6b7280;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.18s;
        text-align: center;
    }
    .ux-type-btn.active {
        background: #1f2937;
        color: #f59e0b;
        border-color: #1f2937;
    }
    .ux-divider {
        height: 1px;
        background: #f3f4f6;
        margin: 1.5rem 0;
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
    .btn-ux-primary:hover:not(:disabled) {
        background: var(--orange-dark);
        transform: translateY(-1px);
    }
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
 * FORMULARIO DE USUARIO
 * Crea o edita CLIENTE o VENDEDOR a través de un selector de tipo
 */
const FormCliente = ({ clienteToUpdate, onSuccess, tipoInicial }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { fetchDataBackend } = useFetch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = storeProfile();
    const soloClientes = user?.rol === 'vendedor';
    // Si es vendedor, siempre forzamos 'cliente' sin importar clienteToUpdate
    const [tipoUsuario, setTipoUsuario] = useState(
        soloClientes ? 'cliente' : (clienteToUpdate?.rol || tipoInicial || 'cliente')
    );

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
        // Si el usuario es vendedor, forzamos siempre el endpoint de clientes
        const tipo = soloClientes ? 'cliente' : tipoUsuario;
        let baseUrl = tipo === "cliente" ? "/clientes" : "/vendedores";
        let url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}`;
        let method = "POST";
        if (clienteToUpdate?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}${baseUrl}/${clienteToUpdate._id}`;
            method = "PUT";
        }
        try {
            const response = await fetchDataBackend(url, data, method);
            if (response) {
                const tipoNombre = tipo === "cliente" ? "Cliente" : "Vendedor";
                toast.success(clienteToUpdate ? `${tipoNombre} actualizado correctamente` : `Invitación enviada a ${data.email}`);
                setTimeout(() => { if (onSuccess) onSuccess(); else navigate("/dashboard/listar"); }, 1500);
            }
        } catch (error) {
            toast.error(error.message || "Ocurrió un error al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isEditing = !!clienteToUpdate;
    const tipoEfectivo = soloClientes ? 'cliente' : tipoUsuario;
    const tipoLabel = tipoEfectivo === "cliente" ? "Cliente" : "Vendedor";

    return (
        <>
            <style>{styles}</style>
            <div className="ux-form-wrapper">
                {/* Encabezado */}
                <div className="ux-form-header">
                    <h2>{isEditing ? `Editar ${tipoLabel}` : `Registrar ${tipoLabel}`}</h2>
                    <p>
                        {isEditing
                            ? "Modifica los datos del usuario y guarda los cambios."
                            : "Completa el formulario. Se enviará un correo de activación al usuario."}
                    </p>
                </div>

                <div className="ux-form-body">
                    {/* Selector de tipo: solo visible si no hay tipoInicial fijo y no estamos editando */}
                    {!isEditing && !tipoInicial && !soloClientes && (
                        <div className="ux-type-selector">
                            <button
                                type="button"
                                className={`ux-type-btn${tipoUsuario === "cliente" ? " active" : ""}`}
                                onClick={() => setTipoUsuario("cliente")}
                            >
                                👤 Cliente
                            </button>
                            <button
                                type="button"
                                className={`ux-type-btn${tipoUsuario === "vendedor" ? " active" : ""}`}
                                onClick={() => setTipoUsuario("vendedor")}
                            >
                                🏪 Vendedor
                            </button>
                        </div>
                    )}


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

                        {/* Apellido: siempre visible para vendedor; opcional para cliente */}
                        {(tipoUsuario === "vendedor" || isEditing) && (
                            <div className="ux-field">
                                <label className="ux-label">Apellido {tipoUsuario === "vendedor" ? "*" : ""}</label>
                                <input
                                    type="text"
                                    placeholder="Ej: García"
                                    className="ux-input"
                                    {...register("apellido", tipoUsuario === "vendedor"
                                        ? { required: "El apellido es obligatorio para vendedores" }
                                        : {}
                                    )}
                                />
                                {errors.apellido && <p className="ux-error">⚠ {errors.apellido.message}</p>}
                            </div>
                        )}

                        {/* Email */}
                        <div className="ux-field">
                            <label className="ux-label">Correo electrónico *</label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className="ux-input"
                                {...register("email", {
                                    required: "El correo electrónico es obligatorio",
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

                        {/* Acciones */}
                        <div className="ux-actions">
                            <button type="submit" disabled={isSubmitting} className="btn-ux-primary">
                                {isSubmitting
                                    ? "Guardando..."
                                    : isEditing
                                        ? `Actualizar ${tipoLabel}`
                                        : `Enviar invitación`}
                            </button>
                            <button
                                type="button"
                                onClick={() => { if (onSuccess) onSuccess(); else navigate("/dashboard/listar"); }}
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

export default FormCliente;
