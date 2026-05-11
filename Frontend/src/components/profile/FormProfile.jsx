import { useEffect } from "react"
import storeProfile from "../../context/storeProfile"
import { useForm } from "react-hook-form"

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .prof-form-wrapper {
        max-width: 560px;
        margin: 0 auto;
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    .prof-form-header {
        background: #1f2937;
        padding: 1.5rem 2rem;
        color: #fff;
    }
    .prof-form-header h2 {
        font-size: 1.2rem;
        font-weight: 800;
        margin: 0 0 0.2rem;
    }
    .prof-form-header p {
        font-size: 0.82rem;
        color: #9ca3af;
        margin: 0;
    }
    .prof-form-body { padding: 1.75rem 2rem; }
    .prof-field { margin-bottom: 1.1rem; }
    .prof-label {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        margin-bottom: 0.4rem;
    }
    .prof-input {
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
    .prof-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
        background: #fff;
    }
    .prof-input::placeholder { color: #c0c0c0; }
    .prof-error { font-size: 0.78rem; color: #ef4444; margin-top: 0.3rem; }
    .prof-divider { height: 1px; background: #f3f4f6; margin: 1.25rem 0; }
    .btn-prof-submit {
        width: 100%;
        padding: 0.75rem 1rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        border-radius: 0.625rem;
        border: none;
        cursor: pointer;
        margin-top: 1.25rem;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
    }
    .btn-prof-submit:hover { background: var(--orange-dark); transform: translateY(-1px); }
`;

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile()
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const updateUser = async (data) => {
        updateProfile(data, user._id)
    }

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre || "",
                apellido: user?.apellido || "",
                direccion: user?.direccion || "",
                telefono: user?.telefono || "",
                email: user?.email || "",
            })
        }
    }, [user, reset])

    return (
        <>
            <style>{styles}</style>
            <div className="prof-form-wrapper">
                <div className="prof-form-header">
                    <h2>Mi perfil</h2>
                    <p>Actualiza tu información personal cuando lo necesites.</p>
                </div>
                <div className="prof-form-body">
                    <form onSubmit={handleSubmit(updateUser)} noValidate>
                        {/* Nombre */}
                        <div className="prof-field">
                            <label className="prof-label">Nombre</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan"
                                className="prof-input"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="prof-error">⚠ {errors.nombre.message}</p>}
                        </div>

                        {/* Apellido */}
                        <div className="prof-field">
                            <label className="prof-label">Apellido</label>
                            <input
                                type="text"
                                placeholder="Ej: García"
                                className="prof-input"
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="prof-error">⚠ {errors.apellido.message}</p>}
                        </div>

                        <div className="prof-divider" />

                        {/* Dirección */}
                        <div className="prof-field">
                            <label className="prof-label">Dirección</label>
                            <input
                                type="text"
                                placeholder="Calle, número, ciudad"
                                className="prof-input"
                                {...register("direccion", { required: "La dirección es obligatoria" })}
                            />
                            {errors.direccion && <p className="prof-error">⚠ {errors.direccion.message}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="prof-field">
                            <label className="prof-label">Teléfono</label>
                            <input
                                type="tel"
                                placeholder="Ej: 0987654321"
                                className="prof-input"
                                {...register("telefono", {
                                    required: "El teléfono es obligatorio",
                                    pattern: {
                                        value: /^[0-9]{7,15}$/,
                                        message: "Debe tener entre 7 y 15 dígitos"
                                    }
                                })}
                            />
                            {errors.telefono && <p className="prof-error">⚠ {errors.telefono.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="prof-field">
                            <label className="prof-label">Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                className="prof-input"
                                {...register("email", { required: "El correo es obligatorio" })}
                            />
                            {errors.email && <p className="prof-error">⚠ {errors.email.message}</p>}
                        </div>

                        <button type="submit" className="btn-prof-submit">
                            Guardar cambios
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default FormularioPerfil;

