import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PasswordInput from '../components/ui/PasswordInput';

const resetStyles = `
    /* ─── Layout ─── */
    .reset-wrapper {
        display: flex;
        height: 100vh;
        overflow: hidden;
        font-family: 'Inter', system-ui, sans-serif;
        background: #f8f7f4;
        align-items: center;
        justify-content: center;
    }

    /* ─── Card ─── */
    .reset-card {
        width: 100%;
        max-width: 460px;
        background: #ffffff;
        border-radius: 1.5rem;
        padding: 3rem 2.75rem;
        box-shadow:
            0 0 0 1px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04);
        margin: 1.5rem;
    }

    /* ─── Logo / Ícono ─── */
    .reset-logo {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 900;
        color: #92400e;
        margin-bottom: 1.75rem;
        letter-spacing: -0.02em;
    }
    .reset-logo span { color: #111827; }

    .reset-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        background: #fef3c7;
        border: 3px solid #fcd34d;
        margin: 0 auto 1.75rem;
    }
    .reset-icon svg { color: #92400e; }

    /* ─── Encabezado ─── */
    .reset-title {
        font-size: 2rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
        text-align: center;
    }
    .reset-subtitle {
        font-size: 0.95rem;
        color: #6b7280;
        margin: 0 0 2.5rem;
        text-align: center;
    }

    /* ─── Token inválido ─── */
    .reset-invalid {
        text-align: center;
        padding: 2rem 0 1rem;
    }
    .reset-invalid p {
        color: #6b7280;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
    }

    /* ─── Grupos de campo ─── */
    .reset-field {
        margin-bottom: 1.75rem;
    }
    .reset-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.6rem;
        letter-spacing: 0.01em;
    }
    .reset-input-wrapper {
        position: relative;
    }
    .reset-input {
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
    .reset-input:focus {
        background: #fff;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245,158,11,0.18);
    }
    .reset-input.input-error {
        border-color: #f87171;
        background: #fff8f8;
    }
    .reset-input.input-error:focus {
        box-shadow: 0 0 0 3.5px rgba(248,113,113,0.18);
    }
    .reset-error-msg {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        font-weight: 500;
    }

    /* ─── Botón principal ─── */
    .reset-btn-primary {
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
    }
    .reset-btn-primary:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(232,118,10,0.42);
    }
    .reset-btn-primary:active:not(:disabled) { transform: scale(0.97); }
    .reset-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ─── Footer del card ─── */
    .reset-footer {
        display: flex;
        justify-content: center;
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 1.5px solid #f3f4f6;
    }
    .reset-back-link {
        font-size: 0.875rem;
        color: #9ca3af;
        text-decoration: none;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        transition: color 0.18s;
    }
    .reset-back-link:hover { color: #b45309; }
`;

const LockIcon = () => (
    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const Reset = () => {
    const { fetchDataBackend } = useFetch();
    const { token } = useParams();
    const navigate = useNavigate();
    const [tokenback, setTokenBack] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch("password");

    const changePassword = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        setIsLoading(true);
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/nuevo-password/${token}`;
            const response = await fetchDataBackend(url, { password: data.password }, 'POST');

            if (response?.msg) {
                toast.success(response.msg);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error("Hubo un error al cambiar la contraseña");
            }
        } catch (error) {
            toast.error("Error inesperado al cambiar la contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/recuperar-password/${token}`;
                const response = await fetchDataBackend(url, null, 'GET');
                if (response?.msg) {
                    toast.success(response.msg);
                    setTokenBack(true);
                } else {
                    toast.error("Token inválido o expirado");
                }
            } catch (error) {
                toast.error("Error al verificar el token");
            }
        };
        verifyToken();
    }, []);

    return (
        <div className="reset-wrapper">
            <style>{resetStyles}</style>

            <div className="reset-card">
                {/* Logo */}
                <p className="reset-logo">In<span>tex</span></p>

                {/* Ícono candado */}
                <div className="reset-icon">
                    <LockIcon />
                </div>

                {/* Encabezado */}
                <h1 className="reset-title">Nueva contraseña</h1>
                <p className="reset-subtitle">Ingresa y confirma tu nueva contraseña</p>

                {tokenback ? (
                    <form onSubmit={handleSubmit(changePassword)} noValidate>
                        {/* Nueva contraseña */}
                        <div className="reset-field">
                            <label htmlFor="password" className="reset-label">
                                Nueva contraseña
                            </label>
                            <div className="reset-input-wrapper">
                                <PasswordInput
                                    id="password"
                                    placeholder="••••••••"
                                    className={`reset-input${errors.password ? ' input-error' : ''}`}
                                    {...register("password", {
                                        required: "La contrasena es obligatoria",
                                        minLength: { value: 8, message: "Minimo 8 caracteres" }
                                    })}
                                />
                            </div>
                            {errors.password && (
                                <p className="reset-error-msg">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirmar contrasena */}
                        <div className="reset-field">
                            <label htmlFor="confirmPassword" className="reset-label">
                                Confirmar contrasena
                            </label>
                            <div className="reset-input-wrapper">
                                <PasswordInput
                                    id="confirmPassword"
                                    placeholder="Minimo 8 caracteres"
                                    className={`reset-input${errors.confirmPassword ? ' input-error' : ''}`}
                                    {...register("confirmPassword", {
                                        required: "La confirmacion es obligatoria",
                                        validate: value => value === password || "Las contrasenas no coinciden"
                                    })}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="reset-error-msg">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        {/* Botón */}
                        <button type="submit" disabled={isLoading} className="reset-btn-primary">
                            {isLoading ? 'Guardando…' : 'Cambiar contraseña'}
                        </button>
                    </form>
                ) : (
                    <div className="reset-invalid">
                        <p>Verificando el enlace de recuperación...</p>
                    </div>
                )}

                {/* Footer */}
                <div className="reset-footer">
                    <Link to="/login" className="reset-back-link">
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Reset;

