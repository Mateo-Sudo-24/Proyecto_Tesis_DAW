import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useFetch from '../hooks/useFetch';

const registerStyles = `
    /* ─── Layout ─── */
    .reg-wrapper {
        display: flex;
        height: 100vh;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
        background: #f8f7f4;
    }

    /* ─── Panel formulario ─── */
    .reg-form-panel {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        padding: 1rem 1.5rem;
        background: #fafaf9;
    }
    @media (min-width: 768px) { .reg-form-panel { width: 50%; } }

    .reg-card {
        width: 100%;
        max-width: 460px;
        background: #ffffff;
        border-radius: 1.25rem;
        padding: 1.75rem 2.25rem;
        box-shadow:
            0 0 0 1px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04);
    }

    /* ─── Encabezado ─── */
    .reg-title {
        font-size: 1.6rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.02em;
        margin: 0 0 0.3rem;
    }
    .reg-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0 0 1.25rem;
    }

    /* ─── Fila de dos campos ─── */
    .reg-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.875rem;
        margin-bottom: 1rem;
    }

    /* ─── Grupos de campo ─── */
    .reg-field {
        margin-bottom: 1rem;
    }
    .reg-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.35rem;
        letter-spacing: 0.01em;
    }
    .reg-input-wrapper {
        position: relative;
    }
    .reg-input {
        width: 100%;
        box-sizing: border-box;
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        color: #111827;
        font-size: 0.9rem;
        border-radius: 0.75rem;
        padding: 0.65rem 3rem 0.65rem 1rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        line-height: 1.5;
    }
    .reg-input:focus {
        background: #fff;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245,158,11,0.18);
    }
    .reg-input.input-error {
        border-color: #f87171;
        background: #fff8f8;
    }
    .reg-input.input-error:focus {
        box-shadow: 0 0 0 3.5px rgba(248,113,113,0.18);
    }
    .reg-input-hint {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        font-size: 0.7rem;
        color: #9ca3af;
        font-weight: 600;
        pointer-events: none;
        white-space: nowrap;
    }
    .reg-toggle-btn {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: #9ca3af;
        display: flex;
        align-items: center;
        transition: color 0.18s;
        border-radius: 0.375rem;
    }
    .reg-toggle-btn:hover { color: #b45309; }
    .reg-error-msg {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.3rem;
        font-weight: 500;
    }

    /* ─── Botón principal ─── */
    .reg-btn-primary {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.8rem 1.5rem;
        background: linear-gradient(135deg, #f59e0b 0%, #e8760a 100%);
        color: #fff;
        font-weight: 800;
        font-size: 0.95rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(232,118,10,0.38);
        transition: transform 0.15s, box-shadow 0.18s, filter 0.18s;
        letter-spacing: 0.01em;
    }
    .reg-btn-primary:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(232,118,10,0.42);
    }
    .reg-btn-primary:active:not(:disabled) { transform: scale(0.97); }
    .reg-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Footer del card ─── */
    .reg-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1.5px solid #f3f4f6;
    }
    .reg-footer-text {
        font-size: 0.875rem;
        color: #9ca3af;
    }
    .reg-btn-login {
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
    .reg-btn-login:hover {
        background: #374151;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .reg-btn-login:active { transform: scale(0.97); }
    .reg-btn-login.disabled {
        opacity: 0.45;
        pointer-events: none;
        cursor: not-allowed;
    }

    /* ─── Panel imagen (derecha) ─── */
    .reg-image-panel {
        display: none;
        position: relative;
        flex: 1;
        background-image: url('/images/registro.jpg');
        background-size: cover;
        background-position: center;
        background-color: #fef3c7;
    }
    @media (min-width: 768px) { .reg-image-panel { display: block; } }

    .reg-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            225deg,
            rgba(120, 53, 15, 0.70) 0%,
            rgba(180, 83, 9, 0.40) 55%,
            rgba(0,0,0,0.10) 100%
        );
    }
    .reg-image-branding {
        position: absolute;
        bottom: 2.5rem;
        right: 2.5rem;
        color: #fff;
        z-index: 10;
        text-align: right;
    }
    .reg-image-branding h2 {
        font-size: 2.8rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        line-height: 1;
    }
    .reg-image-branding span { color: #fbbf24; }
    .reg-image-branding p {
        margin-top: 0.5rem;
        color: #fde68a;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
`;

const ErrorMsg = ({ msg }) => (
    <p className="reg-error-msg">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
    </p>
);

export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend, isLoading } = useFetch();
    const navigate = useNavigate();

    const registro = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/clientes/registro`;
        const response = await fetchDataBackend(url, data, 'POST');
        if (response) {
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        }
    };

    return (
        <div className="reg-wrapper">
            <style>{registerStyles}</style>

            {/* ── Panel formulario (izquierda) ── */}
            <div className="reg-form-panel">
                <div className="reg-card">

                    <h1 className="reg-title">Crear cuenta</h1>
                    <p className="reg-subtitle">Por favor ingresa tus datos para registrarte</p>

                    <form onSubmit={handleSubmit(registro)} noValidate>

                        {/* Nombre y Apellido en fila */}
                        <div className="reg-row">
                            <div>
                                <label htmlFor="nombre" className="reg-label">Nombre</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    placeholder="Juan"
                                    className={`reg-input${errors.nombre ? ' input-error' : ''}`}
                                    {...register("nombre", {
                                        required: "El nombre es obligatorio",
                                        pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras, sin símbolos" }
                                    })}
                                />
                                {errors.nombre && <ErrorMsg msg={errors.nombre.message} />}
                            </div>
                            <div>
                                <label htmlFor="apellido" className="reg-label">Apellido</label>
                                <input
                                    id="apellido"
                                    type="text"
                                    placeholder="Pérez"
                                    className={`reg-input${errors.apellido ? ' input-error' : ''}`}
                                    {...register("apellido", {
                                        required: "El apellido es obligatorio",
                                        pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras, sin símbolos" }
                                    })}
                                />
                                {errors.apellido && <ErrorMsg msg={errors.apellido.message} />}
                            </div>
                        </div>

                        {/* Dirección */}
                        <div className="reg-field">
                            <label htmlFor="direccion" className="reg-label">Dirección</label>
                            <input
                                id="direccion"
                                type="text"
                                placeholder="Av. Principal 123, Ciudad"
                                className={`reg-input${errors.direccion ? ' input-error' : ''}`}
                                {...register("direccion", {
                                    required: "La dirección es obligatoria",
                                    minLength: { value: 5, message: "Mínimo 5 caracteres" }
                                })}
                            />
                            {errors.direccion && <ErrorMsg msg={errors.direccion.message} />}
                        </div>

                        {/* Teléfono */}
                        <div className="reg-field">
                            <label htmlFor="telefono" className="reg-label">Teléfono</label>
                            <div className="reg-input-wrapper">
                                <input
                                    id="telefono"
                                    type="tel"
                                    maxLength={10}
                                    placeholder="0987654321"
                                    className={`reg-input${errors.telefono ? ' input-error' : ''}`}
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register("telefono", {
                                        required: "El teléfono es obligatorio",
                                        pattern: { value: /^[0-9]{10}$/, message: "Debe tener exactamente 10 dígitos" }
                                    })}
                                />
                                <span className="reg-input-hint">10 dígitos</span>
                            </div>
                            {errors.telefono && <ErrorMsg msg={errors.telefono.message} />}
                        </div>

                        {/* Email */}
                        <div className="reg-field">
                            <label htmlFor="email" className="reg-label">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="usuario@dominio.com"
                                className={`reg-input${errors.email ? ' input-error' : ''}`}
                                {...register("email", {
                                    required: "El correo es obligatorio",
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresa un correo válido (ej: usuario@dominio.com)" }
                                })}
                            />
                            {errors.email && <ErrorMsg msg={errors.email.message} />}
                        </div>

                        {/* Contraseña */}
                        <div className="reg-field">
                            <label htmlFor="password" className="reg-label">Contraseña</label>
                            <div className="reg-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    className={`reg-input${errors.password ? ' input-error' : ''}`}
                                    {...register("password", {
                                        required: "La contraseña es obligatoria",
                                        minLength: { value: 8, message: "Mínimo 8 caracteres" }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="reg-toggle-btn"
                                    aria-label="Mostrar u ocultar contraseña"
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <ErrorMsg msg={errors.password.message} />}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="reg-btn-primary"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" style={{width:'1.1rem',height:'1.1rem',marginRight:'0.4rem'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{opacity:0.25}} />
                                        <path fill="currentColor" style={{opacity:0.75}} d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Registrando...
                                </>
                            ) : 'Crear cuenta'}
                        </button>
                    </form>

                    {/* Footer del card */}
                    <div className="reg-footer">
                        <p className="reg-footer-text">¿Ya tienes una cuenta?</p>
                        <Link
                            to="/login"
                            className={`reg-btn-login${isLoading ? ' disabled' : ''}`}
                            onClick={isLoading ? (e) => e.preventDefault() : undefined}
                            tabIndex={isLoading ? -1 : 0}
                        >
                            Iniciar sesión
                        </Link>
                    </div>

                </div>
            </div>

            {/* ── Panel imagen (derecha) ── */}
            <div className="reg-image-panel">
                <div className="reg-image-overlay" />
                <div className="reg-image-branding">
                    <h2>In<span>tex</span></h2>
                    <p>Software textil inteligente</p>
                </div>
            </div>
        </div>
    );
};
