import { useState } from "react"
import { useForm } from "react-hook-form"
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .pwd-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.09);
        overflow: hidden;
    }
    .pwd-header {
        background: #1f2937;
        padding: 1.5rem 2rem;
        color: #fff;
    }
    .pwd-header h2 {
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0 0 0.2rem;
    }
    .pwd-header p {
        font-size: 0.8rem;
        color: #9ca3af;
        margin: 0;
    }
    .pwd-body { padding: 1.75rem 2rem; }
    .pwd-field { margin-bottom: 1.1rem; }
    .pwd-label {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        margin-bottom: 0.4rem;
    }
    .pwd-input {
        width: 100%;
        padding: 0.65rem 1rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-size: 0.9rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        box-sizing: border-box;
    }
    .pwd-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
        background: #fff;
    }
    .pwd-input::placeholder { color: #c0c0c0; }
    .pwd-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.3rem; }
    .pwd-warning {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 0.625rem;
        padding: 0.75rem 1rem;
        font-size: 0.82rem;
        color: #92400e;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .pwd-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
    }
    .pwd-toggle-chevron {
        font-size: 0.65rem;
        color: #9ca3af;
        transition: transform 0.2s;
        flex-shrink: 0;
    }
    .pwd-toggle-chevron.open { transform: rotate(180deg); }
    .pwd-collapsible {
        overflow: hidden;
        transition: max-height 0.3s ease;
        max-height: 0;
    }
    .pwd-collapsible.open { max-height: 500px; }
    .btn-pwd-submit {
        width: 100%;
        padding: 0.75rem 1rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: none;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
    }
    .btn-pwd-submit:hover { background: var(--orange-dark); transform: translateY(-1px); }
`;

const CardPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { user, updatePasswordProfile } = storeProfile()
    const { clearToken } = storeAuth()
    const [open, setOpen] = useState(false)

    const isAdmin = user?.rol === 'administrador'

    const updatePassword = async (data) => {
        const response = await updatePasswordProfile(data, user._id)
        if (response) {
            clearToken()
        }
    }

    return (
        <>
            <style>{styles}</style>
            <div className="pwd-card">
                <div className="pwd-header">
                    {isAdmin ? (
                        <button
                            type="button"
                            className="pwd-toggle"
                            onClick={() => setOpen(o => !o)}
                        >
                            <div>
                                <h2>Cambiar contraseña</h2>
                                <p>Al guardar, se cerrará tu sesión automáticamente.</p>
                            </div>
                            <span className={`pwd-toggle-chevron${open ? ' open' : ''}`}>▼</span>
                        </button>
                    ) : (
                        <>
                            <h2>Cambiar contraseña</h2>
                            <p>Al guardar, se cerrará tu sesión automáticamente.</p>
                        </>
                    )}
                </div>
                <div className={isAdmin ? `pwd-collapsible${open ? ' open' : ''}` : undefined}>
                    <div className="pwd-body">
                        <div className="pwd-warning">
                            🔒 Por seguridad, deberás volver a iniciar sesión tras cambiar tu contraseña.
                        </div>
                        <form onSubmit={handleSubmit(updatePassword)} noValidate>
                            <div className="pwd-field">
                                <label className="pwd-label">Contraseña actual</label>
                                <input
                                    type="password"
                                    placeholder="Ingresa tu contraseña actual"
                                    className="pwd-input"
                                    {...register("passwordActual", { required: "La contraseña actual es obligatoria" })}
                                />
                                {errors.passwordActual && <p className="pwd-error">⚠ {errors.passwordActual.message}</p>}
                            </div>
                            <div className="pwd-field">
                                <label className="pwd-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    className="pwd-input"
                                    {...register("passwordNuevo", {
                                        required: "La nueva contraseña es obligatoria",
                                        minLength: { value: 8, message: "Mínimo 8 caracteres" }
                                    })}
                                />
                                {errors.passwordNuevo && <p className="pwd-error">⚠ {errors.passwordNuevo.message}</p>}
                            </div>
                            <button type="submit" className="btn-pwd-submit">
                                Cambiar contraseña
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CardPassword