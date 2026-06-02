import { useState } from "react";
import { useForm } from "react-hook-form";
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";
import ConfirmDialog from "../ui/ConfirmDialog";
import PasswordInput from "../ui/PasswordInput";

const styles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
    }
    .pwd-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.09);
        overflow: hidden;
    }
    .pwd-header { background: #1f2937; padding: 1.25rem 1.5rem; color: #fff; }
    .pwd-header h2 { font-size: 1rem; font-weight: 800; margin: 0 0 0.15rem; }
    .pwd-header p { font-size: 0.78rem; color: #9ca3af; margin: 0; }
    .pwd-body { padding: 1rem 1.5rem; }
    .pwd-info {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 0.625rem;
        padding: 0.65rem 0.85rem;
        font-size: 0.8rem;
        color: #92400e;
        margin-bottom: 0.9rem;
    }
    .btn-pwd-submit {
        width: 100%;
        padding: 0.7rem 1rem;
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
    .btn-pwd-submit:hover { background: var(--orange-dark); transform: translateY(-1px); }
    .pwd-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        padding: 1rem;
    }
    .pwd-modal {
        width: min(430px, 96vw);
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        overflow: hidden;
    }
    .pwd-modal-head { padding: 1rem 1.25rem; background: #1f2937; color: #fff; }
    .pwd-modal-title { margin: 0; font-size: 1rem; font-weight: 800; }
    .pwd-modal-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: #d1d5db; }
    .pwd-modal-body { padding: 1.25rem; }
    .pwd-stepper { display: flex; gap: 0.35rem; margin-bottom: 1rem; }
    .pwd-step { height: 4px; flex: 1; border-radius: 999px; background: #e5e7eb; }
    .pwd-step.active { background: var(--orange-main); }
    .pwd-field { margin-bottom: 1rem; }
    .pwd-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        margin-bottom: 0.35rem;
    }
    .pwd-input {
        width: 100%;
        padding: 0.6rem 0.875rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-size: 0.9rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
        box-sizing: border-box;
    }
    .pwd-input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 3px rgba(232,118,10,0.12); background: #fff; }
    .pwd-error { font-size: 0.76rem; color: #ef4444; margin-top: 0.25rem; }
    .pwd-modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding: 0 1.25rem 1.25rem; }
    .pwd-btn-light, .pwd-btn-main {
        padding: 0.6rem 1rem;
        border-radius: 0.6rem;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        border: none;
    }
    .pwd-btn-light { background: #f3f4f6; color: #374151; }
    .pwd-btn-main { background: var(--orange-main); color: #fff; }
`;

const CardPassword = () => {
    const { register, handleSubmit, formState: { errors }, watch, trigger, reset, getValues, setError, clearErrors } = useForm();
    const { user, updatePasswordProfile, verifyCurrentPassword } = storeProfile();
    const { clearToken } = storeAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [pendingData, setPendingData] = useState(null);
    const [checkingPassword, setCheckingPassword] = useState(false);

    const closeModal = () => {
        setModalOpen(false);
        setStep(1);
        setPendingData(null);
        reset();
    };

    const nextFromPassword = async () => {
        const ok = await trigger('passwordActual');
        if (!ok) return;
        setCheckingPassword(true);
        const response = await verifyCurrentPassword(getValues('passwordActual'));
        setCheckingPassword(false);
        if (response?.error) {
            setError('passwordActual', { type: 'server', message: response.error });
            return;
        }
        clearErrors('passwordActual');
        setStep(2);
    };

    const nextFromNewPassword = async () => {
        const ok = await trigger(['passwordNuevo', 'confirmPassword']);
        if (!ok) return;
        setPendingData(getValues());
        setStep(3);
    };

    const updatePassword = async () => {
        if (!pendingData) return;
        const { confirmPassword, ...payload } = pendingData;
        void confirmPassword;
        const response = await updatePasswordProfile(payload, user?._id);
        if (response && !response.error) {
            closeModal();
            clearToken();
        }
    };

    return (
        <>
            <style>{styles}</style>
            <ConfirmDialog
                open={!!pendingData && step === 3}
                title="¿Cambiar contraseña?"
                message="Se cerrará tu sesión después de actualizar la contraseña."
                confirmLabel="Cambiar"
                variant="warning"
                onConfirm={updatePassword}
                onCancel={() => { setPendingData(null); setStep(2); }}
            />
            <div className="pwd-card">
                <div className="pwd-header">
                    <h2>Cambiar contraseña</h2>
                    <p>Abre un proceso seguro para actualizar tu acceso.</p>
                </div>
                <div className="pwd-body">
                    <div className="pwd-info">Por seguridad, primero se valida tu contraseña actual.</div>
                    <button type="button" className="btn-pwd-submit" onClick={() => setModalOpen(true)}>
                        Cambiar contraseña
                    </button>
                </div>
            </div>

            {modalOpen && step !== 3 && (
                <div className="pwd-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="pwd-modal">
                        <div className="pwd-modal-head">
                            <h3 className="pwd-modal-title">Cambio de contraseña</h3>
                            <p className="pwd-modal-sub">Paso {step} de 3</p>
                        </div>
                        <form onSubmit={handleSubmit(() => {})} noValidate>
                            <div className="pwd-modal-body">
                                <div className="pwd-stepper">
                                    <span className={`pwd-step${step >= 1 ? ' active' : ''}`} />
                                    <span className={`pwd-step${step >= 2 ? ' active' : ''}`} />
                                    <span className={`pwd-step${step >= 3 ? ' active' : ''}`} />
                                </div>

                                {step === 1 && (
                                    <div className="pwd-field">
                                        <label className="pwd-label">Contraseña actual</label>
                                        <PasswordInput
                                            placeholder="Ingresa tu contraseña actual"
                                            className="pwd-input"
                                            {...register("passwordActual", { required: "La contraseña actual es obligatoria" })}
                                        />
                                        {errors.passwordActual && <p className="pwd-error">{errors.passwordActual.message}</p>}
                                    </div>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="pwd-field">
                                            <label className="pwd-label">Nueva contraseña</label>
                                            <PasswordInput
                                                placeholder="Mínimo 8 caracteres"
                                                className="pwd-input"
                                                {...register("passwordNuevo", {
                                                    required: "La nueva contraseña es obligatoria",
                                                    minLength: { value: 8, message: "Minimo 8 caracteres" },
                                                    validate: value => value !== watch("passwordActual") || "No puedes poner la misma contrasena"
                                                })}
                                            />
                                            {errors.passwordNuevo && <p className="pwd-error">{errors.passwordNuevo.message}</p>}
                                        </div>
                                        <div className="pwd-field">
                                            <label className="pwd-label">Confirmar nueva contraseña</label>
                                            <PasswordInput
                                                placeholder="Repite la nueva contraseña"
                                                className="pwd-input"
                                                {...register("confirmPassword", {
                                                    required: "Confirma la nueva contraseña",
                                                    validate: v => v === watch("passwordNuevo") || "Las contraseñas no coinciden"
                                                })}
                                            />
                                            {errors.confirmPassword && <p className="pwd-error">{errors.confirmPassword.message}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="pwd-modal-actions">
                                <button type="button" className="pwd-btn-light" onClick={step === 1 ? closeModal : () => setStep(1)}>
                                    {step === 1 ? 'Cancelar' : 'Atrás'}
                                </button>
                                <button type="button" className="pwd-btn-main" onClick={step === 1 ? nextFromPassword : nextFromNewPassword} disabled={checkingPassword}>
                                    {checkingPassword ? 'Verificando...' : 'Continuar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardPassword;
