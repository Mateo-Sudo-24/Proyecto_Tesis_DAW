import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import storeProfile from "../../context/storeProfile";
import PasswordInput from "../ui/PasswordInput";

const styles = `
    .email-card {
        background:#fff;
        border-radius:1.25rem;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);
        overflow:hidden;
    }
    .email-card-head {
        background:#1f2937;
        color:#fff;
        padding:1.5rem 2rem;
    }
    .email-card-head h2 {
        font-size:1.15rem;
        font-weight:800;
        margin:0;
    }
    .email-card-head p {
        color:#d1d5db;
        font-size:0.86rem;
        line-height:1.55;
        margin:0.45rem 0 0;
    }
    .email-card-body { padding:1.5rem 2rem; }
    .email-main-btn,
    .email-modal-btn {
        border:none;
        border-radius:0.625rem;
        font-weight:800;
        cursor:pointer;
        transition:background 0.18s, transform 0.15s;
    }
    .email-main-btn {
        width:100%;
        padding:0.75rem 1rem;
        background:#e8760a;
        color:#fff;
        box-shadow:0 3px 10px rgba(232,118,10,0.28);
    }
    .email-main-btn:hover { background:#c4620a; transform:translateY(-1px); }
    .email-modal-overlay {
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.55);
        z-index:1000;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:1rem;
    }
    .email-modal {
        width:min(480px, 96vw);
        max-height:92vh;
        overflow-y:auto;
        background:#fff;
        border-radius:1rem;
        box-shadow:0 24px 80px rgba(0,0,0,0.32);
    }
    .email-modal-head {
        background:#1f2937;
        color:#fff;
        padding:1.25rem 1.5rem;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:1rem;
    }
    .email-modal-head h3 {
        margin:0;
        font-size:1rem;
        font-weight:800;
    }
    .email-close {
        background:rgba(255,255,255,0.12);
        color:#fff;
        border:none;
        border-radius:0.625rem;
        width:34px;
        height:34px;
        cursor:pointer;
    }
    .email-form { padding:1.5rem; }
    .email-current {
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:0.75rem;
        padding:0.75rem 0.9rem;
        color:#374151;
        font-size:0.86rem;
        margin-bottom:1rem;
    }
    .email-field { margin-bottom:1rem; }
    .email-label {
        display:block;
        font-size:0.78rem;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.06em;
        color:#6b7280;
        margin-bottom:0.4rem;
    }
    .email-input {
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
    .email-input:focus {
        border-color:#e8760a;
        box-shadow:0 0 0 3px rgba(232,118,10,0.12);
        background:#fff;
    }
    .email-error { font-size:0.78rem; color:#ef4444; margin-top:0.3rem; }
    .email-actions { display:flex; gap:0.75rem; margin-top:1.25rem; }
    .email-modal-btn { flex:1; padding:0.7rem 1rem; }
    .email-modal-btn.primary { background:#e8760a; color:#fff; }
    .email-modal-btn.primary:hover { background:#c4620a; }
    .email-modal-btn.secondary { background:#f3f4f6; color:#374151; }
    .email-modal-btn.secondary:hover { background:#e5e7eb; }
`;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CardEmail = () => {
    const { user, updateProfile } = storeProfile();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

    const closeModal = () => {
        reset();
        setOpen(false);
    };

    const onSubmit = async (data) => {
        if (data.emailNuevo !== data.emailConfirmar) {
            toast.error("Los correos no coinciden.");
            return;
        }

        setLoading(true);
        await updateProfile({
            email: data.emailNuevo,
            passwordActual: data.passwordActual,
        });
        setLoading(false);
        closeModal();
    };

    return (
        <>
            <style>{styles}</style>
            <div className="email-card">
                <div className="email-card-head">
                    <h2>Cambiar correo</h2>
                    <p>Actualiza el correo de acceso verificando primero tu contraseña actual.</p>
                </div>
                <div className="email-card-body">
                    <button type="button" className="email-main-btn" onClick={() => setOpen(true)}>
                        Cambiar correo
                    </button>
                </div>
            </div>

            {open && (
                <div className="email-modal-overlay" onClick={closeModal}>
                    <div className="email-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="email-modal-head">
                            <h3>Cambiar correo electrónico</h3>
                            <button type="button" className="email-close" onClick={closeModal}>X</button>
                        </div>
                        <form className="email-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <div className="email-current">
                                Correo actual: <strong>{user?.email || "No disponible"}</strong>
                            </div>

                            <div className="email-field">
                                <label className="email-label">Contraseña actual</label>
                                <PasswordInput
                                    className="email-input"
                                    placeholder="Confirma tu contraseña"
                                    {...register("passwordActual", { required: "La contraseña actual es obligatoria." })}
                                />
                                {errors.passwordActual && <p className="email-error">{errors.passwordActual.message}</p>}
                            </div>

                            <div className="email-field">
                                <label className="email-label">Nuevo correo</label>
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="nuevo@ejemplo.com"
                                    {...register("emailNuevo", {
                                        required: "El correo es obligatorio.",
                                        pattern: { value: emailRegex, message: "Correo inválido." },
                                    })}
                                />
                                {errors.emailNuevo && <p className="email-error">{errors.emailNuevo.message}</p>}
                            </div>

                            <div className="email-field">
                                <label className="email-label">Confirmar correo</label>
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="Repite el nuevo correo"
                                    {...register("emailConfirmar", {
                                        required: "Confirma el correo.",
                                        validate: (value) => value === watch("emailNuevo") || "Los correos no coinciden.",
                                    })}
                                />
                                {errors.emailConfirmar && <p className="email-error">{errors.emailConfirmar.message}</p>}
                            </div>

                            <div className="email-actions">
                                <button type="submit" className="email-modal-btn primary" disabled={loading}>
                                    {loading ? "Guardando..." : "Actualizar correo"}
                                </button>
                                <button type="button" className="email-modal-btn secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardEmail;
