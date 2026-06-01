import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import { CardProfileOwner } from '../components/profile/CardProfileOwner';
import FormProfile from '../components/profile/FormProfile';
import storeProfile from '../context/storeProfile';

const styles = `
    /* ── Título con barrita naranja ── */
    .prf-page-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.2rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .prf-page-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: #e8760a;
        border-radius: 2px;
        flex-shrink: 0;
    }
    .prf-page-sub {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    .prf-page-divider {
        height: 1px;
        background: linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin: 0 0 1.25rem;
        border: none;
    }
    /* ── Modal overlay ── */
    .prf-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
        padding: 1rem;
    }
    .prf-modal-box {
        background: #fff;
        border-radius: 1.25rem;
        padding: 2rem;
        width: 100%; max-width: 420px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .prf-modal-title {
        font-size: 1.1rem; font-weight: 800; color: #111827; margin: 0 0 0.25rem;
    }
    .prf-modal-sub {
        font-size: 0.82rem; color: #6b7280; margin: 0 0 1.25rem;
    }
    .prf-modal-field { margin-bottom: 1rem; }
    .prf-modal-label {
        display: block; font-size: 0.75rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 0.35rem;
    }
    .prf-modal-input {
        width: 100%; padding: 0.6rem 0.875rem;
        border: 1.5px solid #e5e7eb; border-radius: 0.625rem;
        font-size: 0.875rem; color: #374151; background: #f9fafb; outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        box-sizing: border-box;
    }
    .prf-modal-input:focus {
        border-color: #e8760a; box-shadow: 0 0 0 3px rgba(232,118,10,0.12); background: #fff;
    }
    .prf-modal-error { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
    .prf-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
    .prf-modal-btn-confirm {
        flex: 1; padding: 0.65rem; background: #e8760a; color: #fff;
        font-weight: 800; font-size: 0.875rem; border-radius: 0.625rem;
        border: none; cursor: pointer; transition: background 0.18s;
    }
    .prf-modal-btn-confirm:hover { background: #c4620a; }
    .prf-modal-btn-cancel {
        flex: 1; padding: 0.65rem; background: #f3f4f6; color: #374151;
        font-weight: 700; font-size: 0.875rem; border-radius: 0.625rem;
        border: none; cursor: pointer; transition: background 0.18s;
    }
    .prf-modal-btn-cancel:hover { background: #e5e7eb; }
    /* ── Botones de acción ── */
    .prf-action-bar {
        display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;
    }
    .prf-action-btn {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 0.55rem 1rem; border-radius: 0.625rem;
        font-size: 0.82rem; font-weight: 700; border: none; cursor: pointer;
        transition: background 0.18s, transform 0.12s;
    }
    .prf-action-btn:hover { transform: translateY(-1px); }
    .prf-action-btn.primary { background: #e8760a; color: #fff; }
    .prf-action-btn.primary:hover { background: #c4620a; }
    .prf-action-btn.secondary { background: #f3f4f6; color: #374151; }
    .prf-action-btn.secondary:hover { background: #e5e7eb; }



    .pwd-header, .prof-form-header {
        padding: 1rem 1.5rem !important;
    }
    .pwd-header h2, .prof-form-header h2 {
        font-size: 1rem !important;
        margin-bottom: 0.1rem !important;
    }
    .pwd-header p, .prof-form-header p { font-size: 0.78rem !important; }

    .pwd-body { padding: 1rem 1.5rem !important; }
    .pwd-field { margin-bottom: 0.7rem !important; }
    .pwd-warning {
        padding: 0.5rem 0.75rem !important;
        margin-bottom: 0.7rem !important;
        font-size: 0.78rem !important;
    }
    .pwd-input { padding: 0.5rem 0.875rem !important; font-size: 0.875rem !important; }
    .btn-pwd-submit {
        padding: 0.6rem 1rem !important;
        font-size: 0.875rem !important;
        margin-top: 0.5rem !important;
    }

    .prof-form-wrapper { max-width: 100% !important; margin: 0 !important; }
    .prof-form-body { padding: 1rem 1.5rem !important; }
    .prof-field { margin-bottom: 0.7rem !important; }
    .prof-input { padding: 0.5rem 0.875rem !important; font-size: 0.875rem !important; }
    .prof-divider { margin: 0.6rem 0 !important; }
    .btn-prof-submit {
        padding: 0.6rem 1rem !important;
        font-size: 0.875rem !important;
        margin-top: 0.5rem !important;
    }
`;

const ModalCambiarEmail = ({ onClose }) => {
    const { user, updateProfile } = storeProfile();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        if (data.emailNuevo !== data.emailConfirmar) {
            toast.error("Los correos no coinciden.");
            return;
        }
        setLoading(true);
        try {
            await updateProfile({ email: data.emailNuevo, passwordActual: data.passwordActual });
            toast.success("Correo actualizado correctamente.");
            onClose();
        } catch {
            // updateProfile already shows toast error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prf-modal-overlay" onClick={onClose}>
            <div className="prf-modal-box" onClick={e => e.stopPropagation()}>
                <h3 className="prf-modal-title">✉️ Cambiar correo electrónico</h3>
                <p className="prf-modal-sub">Correo actual: <strong>{user?.email}</strong></p>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="prf-modal-field">
                        <label className="prf-modal-label">Nuevo correo</label>
                        <input
                            type="email"
                            className="prf-modal-input"
                            placeholder="nuevo@ejemplo.com"
                            {...register("emailNuevo", {
                                required: "El correo es obligatorio.",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido." }
                            })}
                        />
                        {errors.emailNuevo && <p className="prf-modal-error">⚠ {errors.emailNuevo.message}</p>}
                    </div>
                    <div className="prf-modal-field">
                        <label className="prf-modal-label">Contraseña actual</label>
                        <input
                            type="password"
                            className="prf-modal-input"
                            placeholder="Confirma tu contraseña"
                            {...register("passwordActual", {
                                required: "La contraseña actual es obligatoria."
                            })}
                        />
                        {errors.passwordActual && <p className="prf-modal-error">⚠ {errors.passwordActual.message}</p>}
                    </div>
                    <div className="prf-modal-field">
                        <label className="prf-modal-label">Confirmar correo</label>
                        <input
                            type="email"
                            className="prf-modal-input"
                            placeholder="Repite el nuevo correo"
                            {...register("emailConfirmar", {
                                required: "Confirma el correo.",
                                validate: v => v === watch("emailNuevo") || "Los correos no coinciden."
                            })}
                        />
                        {errors.emailConfirmar && <p className="prf-modal-error">⚠ {errors.emailConfirmar.message}</p>}
                    </div>
                    <div className="prf-modal-actions">
                        <button type="submit" className="prf-modal-btn-confirm" disabled={loading}>
                            {loading ? "Guardando…" : "Actualizar correo"}
                        </button>
                        <button type="button" className="prf-modal-btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ModalCambiarEmail.propTypes = {
    onClose: PropTypes.func.isRequired,
};

const Profile = () => {
    const { user } = storeProfile();
    const [showEmailModal, setShowEmailModal] = useState(false);

    return (
        <>
            <style>{styles}</style>
            <div style={{ marginBottom: '1.25rem' }}>
                <h1 className='prf-page-title'>Perfil</h1>
                <p className='prf-page-sub'>Administra tu información personal y seguridad.</p>
            </div>
            <hr className='prf-page-divider' />

            {user && (user.rol === 'cliente' || user.rol === 'vendedor') ? (
                <>
                    <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                        <div className='w-full md:w-1/2'>
                            <CardProfileOwner />
                            <div className="prf-action-bar">
                                <button className="prf-action-btn primary" onClick={() => setShowEmailModal(true)}>
                                    ✉️ Cambiar correo
                                </button>
                            </div>
                        </div>
                        <div className='w-full md:w-1/2'>
                            <CardPassword />
                        </div>
                    </div>
                    {showEmailModal && <ModalCambiarEmail onClose={() => setShowEmailModal(false)} />}
                </>
            ) : user && user.rol === 'administrador' ? (
                <>
                    <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                        <div className='w-full md:w-1/2'>
                            <FormProfile />
                        </div>
                        <div className='w-full md:w-1/2' style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <CardProfile />
                            <CardPassword />
                        </div>
                    </div>
                    {showEmailModal && <ModalCambiarEmail onClose={() => setShowEmailModal(false)} />}
                </>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    No se pudo cargar el perfil del usuario.
                </div>
            )}
        </>
    );
};

export default Profile;
