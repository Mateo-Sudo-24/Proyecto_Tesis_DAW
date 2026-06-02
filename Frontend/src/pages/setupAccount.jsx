// src/pages/SetupAccount.jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';
import PasswordInput from '../components/ui/PasswordInput';

const setupStyles = `
    /* ─── Layout ─── */
    .su-wrapper {
        display: flex;
        height: 100vh;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
        background: #f8f7f4;
    }

    /* ─── Panel imagen (derecha, solo desktop) ─── */
    .su-image-panel {
        display: none;
        position: relative;
        flex: 1;
        background-size: cover;
        background-position: center;
    }
    @media (min-width: 768px) { .su-image-panel { display: block; } }

    .su-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            135deg,
            rgba(120, 53, 15, 0.78) 0%,
            rgba(180, 83, 9, 0.48) 50%,
            rgba(0,0,0,0.15) 100%
        );
    }
    .su-image-branding {
        position: absolute;
        bottom: 2.5rem;
        left: 2.5rem;
        color: #fff;
        z-index: 10;
    }
    .su-image-branding h2 {
        font-size: 2.8rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        line-height: 1;
        margin: 0 0 0.5rem;
    }
    .su-image-branding span { color: #fbbf24; }
    .su-image-branding p {
        margin: 0;
        color: #fde68a;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* ─── Panel formulario ─── */
    .su-form-panel {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        padding: 2rem 1.5rem;
        background: #fafaf9;
    }
    @media (min-width: 768px) { .su-form-panel { width: 50%; } }

    /* ─── Card ─── */
    .su-card {
        width: 100%;
        max-width: 460px;
        background: #ffffff;
        border-radius: 1.5rem;
        padding: 3rem 2.75rem;
        box-shadow:
            0 0 0 1px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04);
    }
    @media (max-width: 480px) {
        .su-card { padding: 2rem 1.5rem; border-radius: 1.25rem; }
    }

    /* ─── Logo (móvil) ─── */
    .su-mobile-logo {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 900;
        color: #92400e;
        margin-bottom: 1.75rem;
        letter-spacing: -0.02em;
    }
    .su-mobile-logo span { color: #111827; }
    @media (min-width: 768px) { .su-mobile-logo { display: none; } }

    /* ─── Ícono superior ─── */
    .su-icon-wrap {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fde8ce, #fbbf24);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 14px rgba(232,118,10,0.22);
    }

    /* ─── Título ─── */
    .su-title {
        font-size: 2rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }
    .su-subtitle {
        font-size: 0.95rem;
        color: #6b7280;
        margin: 0 0 2.25rem;
        line-height: 1.55;
    }
    .su-subtitle strong { color: #b45309; font-weight: 700; }

    /* ─── Campos ─── */
    .su-field { margin-bottom: 1.5rem; }
    .su-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.6rem;
        letter-spacing: 0.01em;
    }
    .su-input-wrap { position: relative; }
    .su-input {
        width: 100%;
        box-sizing: border-box;
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        color: #111827;
        font-size: 1rem;
        border-radius: 0.875rem;
        padding: 0.95rem 3.25rem 0.95rem 1.25rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        font-family: inherit;
    }
    .su-input:focus {
        background: #fff;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245,158,11,0.18);
    }
    .su-input.su-error {
        border-color: #f87171;
        background: #fff8f8;
    }
    .su-input.su-error:focus { box-shadow: 0 0 0 3.5px rgba(248,113,113,0.18); }

    /* ─── Toggle contraseña ─── */
    .su-toggle-btn {
        position: absolute;
        top: 50%; right: 1rem;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: #9ca3af;
        font-size: 1.1rem;
        line-height: 1;
        transition: color 0.18s;
        border-radius: 0.375rem;
    }
    .su-toggle-btn:hover { color: #b45309; }

    /* ─── Mensaje de error ─── */
    .su-error-msg {
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.45rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    /* ─── Hint de requisitos ─── */
    .su-hint {
        font-size: 0.78rem;
        color: #9ca3af;
        margin-top: 0.4rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    /* ─── Botón principal ─── */
    .su-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1.05rem 1.5rem;
        background: linear-gradient(135deg, #f59e0b 0%, #e8760a 100%);
        color: #fff;
        font-weight: 800;
        font-size: 1.05rem;
        border-radius: 0.875rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(232,118,10,0.38);
        transition: transform 0.15s, box-shadow 0.18s, filter 0.18s;
        letter-spacing: 0.01em;
        margin-top: 0.5rem;
        font-family: inherit;
    }
    .su-btn:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(232,118,10,0.42);
    }
    .su-btn:active:not(:disabled) { transform: scale(0.97); }
    .su-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Spinner inline ─── */
    .su-spinner {
        width: 18px; height: 18px;
        border: 2.5px solid rgba(255,255,255,0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: su-spin 0.7s linear infinite;
        flex-shrink: 0;
    }
    @keyframes su-spin { to { transform: rotate(360deg); } }

    /* ─── Footer ─── */
    .su-footer {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1.5px solid #f3f4f6;
        text-align: center;
        font-size: 0.85rem;
        color: #9ca3af;
    }
    .su-footer a {
        color: #b45309;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.18s;
    }
    .su-footer a:hover { color: #78350f; text-decoration: underline; }

    @media (max-width: 640px) {
        .su-title { font-size: 1.65rem; }
        .su-subtitle { font-size: 0.88rem; margin-bottom: 1.75rem; }
        .su-form-panel { padding: 1.5rem 1rem; }
    }
`;

const SetupAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();
    const password = watch("password");

    const isCliente = location.pathname.includes('/clientes/setup-account/');
    const entityPath = isCliente ? 'clientes' : 'vendedores';
    const tipoLabel  = isCliente ? 'cliente' : 'vendedor';

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            return toast.error("Las contraseñas no coinciden.");
        }
        const url = `${import.meta.env.VITE_BACKEND_URL}/${entityPath}/setup-account/${token}`;
        const response = await fetchDataBackend(url, { password: data.password }, 'POST');
        if (response) {
            toast.success("¡Cuenta activada! Redirigiendo al login…");
            setTimeout(() => navigate('/login'), 2500);
        }
    };

    return (
        <>
            <style>{setupStyles}</style>

            <div className="su-wrapper">

                {/* ── Panel formulario ── */}
                <div className="su-form-panel">
                    <div className="su-card">

                        {/* Logo solo en móvil */}
                        <div className="su-mobile-logo">
                            <span>IN</span>TEX
                        </div>

                        {/* Ícono */}
                        <div className="su-icon-wrap">🔐</div>

                        <h1 className="su-title">Activa tu cuenta</h1>
                        <p className="su-subtitle">
                            Crea tu contraseña para acceder como <strong>{tipoLabel}</strong> a Intex Textiles.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* Nueva contraseña */}
                            <div className="su-field">
                                <label className="su-label">Nueva contraseña</label>
                                <div className="su-input-wrap">
                                    <PasswordInput
                                        placeholder="Mínimo 6 caracteres"
                                        className={`su-input${errors.password ? ' su-error' : ''}`}
                                        {...register("password", {
                                            required: "La contraseña es obligatoria",
                                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                        })}
                                    />
                                </div>
                                {errors.password
                                    ? <p className="su-error-msg">⚠ {errors.password.message}</p>
                                    : <p className="su-hint">🔒 Usa letras, números y símbolos</p>
                                }
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="su-field">
                                <label className="su-label">Confirmar contraseña</label>
                                <div className="su-input-wrap">
                                    <PasswordInput
                                        placeholder="Repite tu contraseña"
                                        className={`su-input${errors.confirmPassword ? ' su-error' : ''}`}
                                        {...register("confirmPassword", {
                                            required: "Confirma tu contraseña",
                                            validate: value => value === password || "Las contraseñas no coinciden"
                                        })}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="su-error-msg">⚠ {errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <button type="submit" className="su-btn" disabled={isLoading}>
                                {isLoading
                                    ? <><span className="su-spinner" /> Activando…</>
                                    : '🚀 Activar y guardar contraseña'
                                }
                            </button>
                        </form>

                        <div className="su-footer">
                            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                        </div>
                    </div>
                </div>

                {/* ── Panel imagen (desktop) ── */}
                <div
                    className="su-image-panel"
                    style={{ backgroundImage: "url('/images/dogregister.jpg')" }}
                >
                    <div className="su-image-overlay" />
                    <div className="su-image-branding">
                        <h2><span>IN</span>TEX</h2>
                        <p>Gestión textil inteligente</p>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SetupAccount;
