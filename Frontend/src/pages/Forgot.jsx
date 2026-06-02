import { Link } from 'react-router'
import useFetch from '../hooks/useFetch'
import { useForm } from 'react-hook-form';
import forgotImg from '../assets/login.jpg';

const forgotStyles = `
    .forgot-wrapper {
        display: flex;
        height: 100vh;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
        background: #f8f7f4;
    }

    /* ─── Panel imagen ─── */
    .forgot-image-panel {
        display: none;
        position: relative;
        flex: 1;
        background-size: cover;
        background-position: center;
    }
    @media (min-width: 768px) { .forgot-image-panel { display: block; } }

    .forgot-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            135deg,
            rgba(120, 53, 15, 0.75) 0%,
            rgba(180, 83, 9, 0.45) 50%,
            rgba(0,0,0,0.15) 100%
        );
    }
    .forgot-image-branding {
        position: absolute;
        bottom: 2.5rem;
        left: 2.5rem;
        color: #fff;
        z-index: 10;
    }
    .forgot-image-branding h2 {
        font-size: 2.8rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        line-height: 1;
    }
    .forgot-image-branding span { color: #fbbf24; }
    .forgot-image-branding p {
        margin-top: 0.5rem;
        color: #fde68a;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* ─── Panel formulario ─── */
    .forgot-form-panel {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        padding: 2rem 1.5rem;
        background: #fafaf9;
    }
    @media (min-width: 768px) { .forgot-form-panel { width: 50%; } }

    .forgot-card {
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

    /* ─── Icono superior ─── */
    .forgot-icon-wrap {
        width: 3.5rem;
        height: 3.5rem;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 12px rgba(245,158,11,0.25);
    }

    .forgot-title {
        font-size: 2rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }
    .forgot-subtitle {
        font-size: 0.95rem;
        color: #6b7280;
        margin: 0 0 2.25rem;
        line-height: 1.6;
    }

    .forgot-field { margin-bottom: 1.75rem; }
    .forgot-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.6rem;
        letter-spacing: 0.01em;
    }
    .forgot-input-wrapper { position: relative; }
    .forgot-input {
        width: 100%;
        box-sizing: border-box;
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        color: #111827;
        font-size: 1rem;
        border-radius: 0.875rem;
        padding: 1rem 1.25rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        line-height: 1.5;
    }
    .forgot-input:focus {
        background: #fff;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245,158,11,0.18);
    }
    .forgot-input.input-error {
        border-color: #f87171;
        background: #fff8f8;
    }
    .forgot-input.input-error:focus {
        box-shadow: 0 0 0 3.5px rgba(248,113,113,0.18);
    }
    .forgot-error-msg {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        font-weight: 500;
    }

    .forgot-btn-primary {
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
    }
    .forgot-btn-primary:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(232,118,10,0.42);
    }
    .forgot-btn-primary:active:not(:disabled) { transform: scale(0.97); }
    .forgot-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .forgot-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 1.5px solid #f3f4f6;
    }
    .forgot-back-link {
        font-size: 0.875rem;
        color: #9ca3af;
        text-decoration: none;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        transition: color 0.18s;
    }
    .forgot-back-link:hover { color: #b45309; }
    .forgot-btn-login {
        display: inline-flex;
        align-items: center;
        padding: 0.75rem 1.75rem;
        background: #1f2937;
        color: #fde8ce;
        font-weight: 700;
        font-size: 0.95rem;
        border-radius: 0.875rem;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.14);
        transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    }
    .forgot-btn-login:hover {
        background: #374151;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .forgot-btn-login:active { transform: scale(0.97); }
`;

export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();

    const sendMail = (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/recuperar-password`;
        fetchDataBackend(url, data, 'POST');
    };

    return (
        <div className="forgot-wrapper">
            <style>{forgotStyles}</style>

            {/* ── Panel imagen ── */}
            <div
                className="forgot-image-panel"
                style={{ backgroundImage: `url(${forgotImg})` }}
            >
                <div className="forgot-image-overlay" />
                <div className="forgot-image-branding">
                    <h2>In<span>tex</span></h2>
                    <p>Software textil inteligente</p>
                </div>
            </div>

            {/* ── Panel formulario ── */}
            <div className="forgot-form-panel">
                <div className="forgot-card">

                    {/* Icono */}
                    <div className="forgot-icon-wrap">
                        <svg width="28" height="28" fill="none" stroke="#b45309" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h1 className="forgot-title">¿Olvidaste tu contraseña?</h1>
                    <p className="forgot-subtitle">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>

                    <form onSubmit={handleSubmit(sendMail)} noValidate>
                        <div className="forgot-field">
                            <label htmlFor="email" className="forgot-label">Correo electrónico</label>
                            <div className="forgot-input-wrapper">
                                <input
                                    id="email"
                                    type="email"
                                    className={`forgot-input${errors.email ? ' input-error' : ''}`}
                                    {...register("email", {
                                        required: "El correo es obligatorio",
                                        setValueAs: value => String(value || '').trim().toLowerCase(),
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Ingresa un correo válido (ej: usuario@dominio.com)"
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="forgot-error-msg">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading} className="forgot-btn-primary">
                            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>

                    <div className="forgot-footer">
                        <Link to="/" className="forgot-back-link">← Regresar</Link>
                        <Link to="/login" className="forgot-btn-login">Iniciar sesión</Link>
                    </div>

                </div>
            </div>
        </div>
    );
};




