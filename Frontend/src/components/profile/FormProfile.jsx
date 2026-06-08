import { useEffect, useState } from "react";
import storeProfile from "../../context/storeProfile";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { validarEmailRealista, validarNombreReal, validarTelefono10 } from "../../utils/textValidators.js";

const styles = `
    :root {
        --profile-orange: #e8760a;
        --profile-orange-dark: #c4620a;
    }
    .prof-data-card {
        background:#fff;
        border-radius:1.25rem;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);
        overflow:hidden;
    }
    .prof-data-head {
        background:#1f2937;
        padding:1.5rem 2rem;
        color:#fff;
    }
    .prof-data-head h2 {
        font-size:1.15rem;
        font-weight:800;
        margin:0;
    }
    .prof-data-head p {
        color:#d1d5db;
        font-size:0.86rem;
        line-height:1.55;
        margin:0.45rem 0 0;
    }
    .prof-data-body { padding:1.5rem 2rem; }
    .prof-open-btn,
    .btn-prof-submit,
    .prof-modal-close {
        border:none;
        border-radius:0.625rem;
        font-weight:800;
        cursor:pointer;
        transition:background 0.18s, transform 0.15s;
    }
    .prof-open-btn,
    .btn-prof-submit {
        width:100%;
        padding:0.75rem 1rem;
        background:var(--profile-orange);
        color:#fff;
        box-shadow:0 3px 10px rgba(232,118,10,0.28);
    }
    .prof-open-btn:hover,
    .btn-prof-submit:hover { background:var(--profile-orange-dark); transform:translateY(-1px); }
    .prof-modal-overlay {
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.55);
        z-index:1000;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:1rem;
    }
    .prof-modal {
        width:min(560px, 96vw);
        max-height:92vh;
        overflow-y:auto;
        background:#fff;
        border-radius:1rem;
        box-shadow:0 24px 80px rgba(0,0,0,0.32);
    }
    .prof-modal-header {
        background:#1f2937;
        color:#fff;
        padding:1.25rem 1.5rem;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:1rem;
    }
    .prof-modal-header h3 {
        margin:0;
        font-size:1rem;
        font-weight:800;
    }
    .prof-modal-close {
        background:rgba(255,255,255,0.12);
        color:#fff;
        width:34px;
        height:34px;
    }
    .prof-form-body { padding:1.5rem; }
    .prof-field { margin-bottom:1rem; }
    .prof-label {
        display:block;
        font-size:0.78rem;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.06em;
        color:#6b7280;
        margin-bottom:0.4rem;
    }
    .prof-input {
        width:100%;
        padding:0.65rem 1rem;
        border:1.5px solid #e5e7eb;
        border-radius:0.625rem;
        font-size:0.9rem;
        color:#374151;
        background:#f9fafb;
        outline:none;
        box-sizing:border-box;
    }
    .prof-input:focus {
        border-color:var(--profile-orange);
        box-shadow:0 0 0 3px rgba(232,118,10,0.12);
        background:#fff;
    }
    .prof-error { font-size:0.78rem; color:#ef4444; margin-top:0.3rem; }
    .prof-divider { height:1px; background:#f3f4f6; margin:1.1rem 0; }
`;

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [open, setOpen] = useState(false);

    const updateUser = async (data) => {
        const payload = { ...data };
        if (user?.rol === "administrador") delete payload.email;
        await updateProfile(payload, user._id);
        setOpen(false);
    };
    const onInvalid = () => toast.error("Rellene todos los campos correctamente.");

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre || "",
                apellido: user?.apellido || "",
                direccion: user?.direccion || "",
                telefono: user?.telefono || "",
                email: user?.email || "",
            });
        }
    }, [user, reset, open]);

    return (
        <>
            <style>{styles}</style>
            <div className="prof-data-card">
                <div className="prof-data-head">
                    <h2>Cambiar datos</h2>
                    <p>Actualiza nombre, apellido, direccion y telefono del perfil.</p>
                </div>
                <div className="prof-data-body">
                    <button type="button" className="prof-open-btn" onClick={() => setOpen(true)}>
                        Cambiar datos
                    </button>
                </div>
            </div>

            {open && (
                <div className="prof-modal-overlay" onClick={() => setOpen(false)}>
                    <div className="prof-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="prof-modal-header">
                            <h3>Actualizar datos del perfil</h3>
                            <button type="button" className="prof-modal-close" onClick={() => setOpen(false)}>X</button>
                        </div>
                        <div className="prof-form-body">
                            <form onSubmit={handleSubmit(updateUser, onInvalid)} noValidate>
                                <div className="prof-field">
                                    <label className="prof-label">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan"
                                        className="prof-input"
                                        maxLength={12}
                                        {...register("nombre", {
                                            required: "El nombre es obligatorio",
                                            validate: value => validarNombreReal(value, 2)
                                        })}
                                    />
                                    {errors.nombre && <p className="prof-error">{errors.nombre.message}</p>}
                                </div>

                                <div className="prof-field">
                                    <label className="prof-label">Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Garcia"
                                        className="prof-input"
                                        maxLength={12}
                                        {...register("apellido", {
                                            required: "El apellido es obligatorio",
                                            validate: value => validarNombreReal(value, 2)
                                        })}
                                    />
                                    {errors.apellido && <p className="prof-error">{errors.apellido.message}</p>}
                                </div>

                                <div className="prof-divider" />

                                <div className="prof-field">
                                    <label className="prof-label">Direccion</label>
                                    <input
                                        type="text"
                                        placeholder="Calle, numero, ciudad"
                                        className="prof-input"
                                        {...register("direccion", { required: "La direccion es obligatoria" })}
                                    />
                                    {errors.direccion && <p className="prof-error">{errors.direccion.message}</p>}
                                </div>

                                <div className="prof-field">
                                    <label className="prof-label">Telefono</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej: 0987654321"
                                        className="prof-input"
                                        {...register("telefono", {
                                            required: "El telefono es obligatorio",
                                            setValueAs: value => String(value || '').replace(/\D/g, ''),
                                            validate: validarTelefono10,
                                        })}
                                    />
                                    {errors.telefono && <p className="prof-error">{errors.telefono.message}</p>}
                                </div>

                                {user?.rol !== "administrador" && (
                                    <div className="prof-field">
                                        <label className="prof-label">Correo electronico</label>
                                        <input
                                            type="email"
                                            placeholder="tucorreo@ejemplo.com"
                                            className="prof-input"
                                            {...register("email", {
                                                required: "El correo es obligatorio",
                                                setValueAs: value => String(value || '').trim().toLowerCase(),
                                                validate: validarEmailRealista
                                            })}
                                        />
                                        {errors.email && <p className="prof-error">{errors.email.message}</p>}
                                    </div>
                                )}

                                <button type="submit" className="btn-prof-submit">
                                    Guardar cambios
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormularioPerfil;
