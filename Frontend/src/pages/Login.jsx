import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';
import loginImg from '../assets/login.jpg';
import PasswordInput from '../components/ui/PasswordInput';

const loginStyles = `
    /* ─── Layout ─── */
    .login-wrapper {
        display: flex;
        height: 100vh;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
        background: #f8f7f4;
    }

    /* ─── Panel imagen ─── */
    .login-image-panel {
        display: none;
        position: relative;
        flex: 1;
        background-size: cover;
        background-position: center;
    }
    @media (min-width: 768px) { .login-image-panel { display: block; } }

    .login-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            135deg,
            rgba(120, 53, 15, 0.75) 0%,
            rgba(180, 83, 9, 0.45) 50%,
            rgba(0,0,0,0.15) 100%
        );
    }

    .login-image-branding {
        position: absolute;
        bottom: 2.5rem;
        left: 2.5rem;
        color: #fff;
        z-index: 10;
    }
    .login-image-branding h2 {
        font-size: 2.8rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        line-height: 1;
    }
    .login-image-branding span { color: #fbbf24; }
    .login-image-branding p {
        margin-top: 0.5rem;
        color: #fde68a;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* ─── Panel formulario ─── */
    .login-form-panel {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        padding: 2rem 1.5rem;
        background: #fafaf9;
    }
    @media (min-width: 768px) { .login-form-panel { width: 50%; } }

    .login-card {
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

    /* ─── Encabezado ─── */
    .login-title {
        font-size: 2rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }
    .login-subtitle {
        font-size: 0.95rem;
        color: #6b7280;
        margin: 0 0 2.5rem;
    }

    /* ─── Grupos de campo ─── */
    .login-field {
        margin-bottom: 1.75rem;
    }
    .login-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.6rem;
        letter-spacing: 0.01em;
    }
    .login-input-wrapper {
        position: relative;
    }
    .login-input {
        width: 100%;
        box-sizing: border-box;
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        color: #111827;
        font-size: 1rem;
        border-radius: 0.875rem;
        padding: 1rem 3.25rem 1rem 1.25rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        line-height: 1.5;
    }
    .login-input:focus {
        background: #fff;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245,158,11,0.18);
    }
    .login-input.input-error {
        border-color: #f87171;
        background: #fff8f8;
    }
    .login-input.input-error:focus {
        box-shadow: 0 0 0 3.5px rgba(248,113,113,0.18);
    }
    .login-input.input-valid {
        border-color: #34d399;
    }
    .login-input.input-valid:focus {
        box-shadow: 0 0 0 3.5px rgba(52,211,153,0.18);
    }
    .login-input-icon {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        color: #9ca3af;
        pointer-events: none;
    }
    .login-input-icon.icon-valid { color: #34d399; }
    .login-error-msg {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        font-weight: 500;
    }

    /* ─── Link olvidaste contraseña ─── */
    .login-forgot {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.75rem;
    }
    .login-forgot a {
        font-size: 0.82rem;
        font-weight: 600;
        color: #b45309;
        text-decoration: none;
        transition: color 0.18s;
    }
    .login-forgot a:hover { color: #78350f; text-decoration: underline; }

    /* ─── Botón principal ─── */
    .login-btn-primary {
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
    .login-btn-primary:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(232,118,10,0.42);
    }
    .login-btn-primary:active:not(:disabled) { transform: scale(0.97); }
    .login-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Separador ─── */
    .login-divider {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 0.75rem;
        margin: 1.75rem 0;
    }
    .login-divider hr {
        border: none;
        border-top: 1.5px solid #e5e7eb;
    }
    .login-divider span {
        font-size: 0.78rem;
        color: #9ca3af;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    /* ─── Footer del card ─── */
    .login-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1.5px solid #f3f4f6;
    }
    .login-back-link {
        font-size: 0.875rem;
        color: #9ca3af;
        text-decoration: none;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        transition: color 0.18s;
    }
    .login-back-link:hover { color: #b45309; }

    /* ─── Botón registrarse ─── */
    .login-btn-register {
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
        letter-spacing: 0.01em;
    }
    .login-btn-register:hover {
        background: #374151;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .login-btn-register:active { transform: scale(0.97); }

    /* ─── Logo mobile ─── */
    .login-mobile-logo {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 900;
        color: #92400e;
        margin-bottom: 1.75rem;
        letter-spacing: -0.02em;
    }
    .login-mobile-logo span { color: #111827; }

    @media (min-width: 768px) { .login-mobile-logo { display: none; } }
`;

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();
    const emailValue = watch('email', '');
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const { setToken, setRol, profile } = storeAuth();

    const loginUser = async (data) => {
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        if (!baseUrl || baseUrl === 'undefined' || !baseUrl.includes('http')) {
            setIsLoading(false);
            toast.error("Error de configuracion: Backend URL no definida. Contacta soporte.");
            return;
        }

        const url = `${baseUrl}/auth/login`;

        try {
            const response = await fetchDataBackend(url, data, 'POST');

            if (response && response.token) {
                setToken(response.token);
                setRol(response.rol);
                localStorage.setItem("auth-token", JSON.stringify({ state: { token: response.token, rol: response.rol } }));

                if (profile) await profile();

                toast.success(`Bienvenido ${response.nombre}!`);
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.message || "Credencial incorrecta: correo o contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <style>{loginStyles}</style>

            {/* ── Panel imagen ── */}
            <div
                className="login-image-panel"
                style={{ backgroundImage: `url(${loginImg})` }}
            >
                <div className="login-image-overlay" />
                <div className="login-image-branding">
                    <h2>In<span>tex</span></h2>
                    <p>Software textil inteligente</p>
                </div>
            </div>

            {/* ── Panel formulario ── */}
            <div className="login-form-panel">
                <div className="login-card">

                    {/* Logo mobile */}
                    <p className="login-mobile-logo">
                        In<span>tex</span>
                    </p>

                    {/* Encabezado */}
                    <h1 className="login-title">Bienvenido de nuevo</h1>
                    <p className="login-subtitle">Por favor ingresa tus datos para continuar</p>

                    <form onSubmit={handleSubmit(loginUser)} noValidate>

                        {/* Email */}
                        <div className="login-field">
                            <label htmlFor="email" className="login-label">
                                Correo electrónico
                            </label>
                            <div className="login-input-wrapper">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@dominio.com"
                                    className={`login-input${errors.email ? ' input-error' : isValidEmail ? ' input-valid' : ''}`}
                                    {...register("email", {
                                        required: "El correo es obligatorio",
                                        setValueAs: value => String(value || '').trim().toLowerCase(),
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Ingresa un correo válido (ej: usuario@dominio.com)"
                                        }
                                    })}
                                />
                                {isValidEmail && !errors.email && (
                                    <span className="login-input-icon icon-valid">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.email && (
                                <p className="login-error-msg">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                Contraseña
                            </label>
                            <div className="login-input-wrapper">
                                <PasswordInput
                                    id="password"
                                    placeholder="••••••••"
                                    className={`login-input${errors.password ? ' input-error' : ''}`}
                                    {...register("password", { required: "La contraseña es obligatoria" })}
                                />
                            </div>
                            {errors.password && (
                                <p className="login-error-msg">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Olvidaste contraseña */}
                        <div className="login-forgot">
                            <Link to="/forgot">¿Olvidaste tu contraseña?</Link>
                        </div>

                        {/* Botón principal */}
                        <button type="submit" disabled={isLoading} className="login-btn-primary">
                            {isLoading ? 'Verificando…' : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="login-divider">
                        <hr /><span>O</span><hr />
                    </div>

                    {/* Footer del card */}
                    <div className="login-footer">
                        <Link to="/" className="login-back-link">
                            ← Regresar
                        </Link>
                        <Link to="/register" className="login-btn-register">
                            Registrarse
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
