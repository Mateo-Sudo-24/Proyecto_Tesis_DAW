import storeProfile from "../../context/storeProfile"

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .cpo-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.09);
        overflow: hidden;
    }
    .cpo-header {
        background: #1f2937;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }
    .cpo-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--orange-main);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 800;
        color: #fff;
        border: 3px solid var(--orange-border);
    }
    .cpo-badge {
        display: inline-block;
        background: var(--orange-light);
        color: var(--orange-dark);
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        border: 1px solid var(--orange-border);
    }
    .cpo-header-name {
        color: #fff;
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0;
        text-align: center;
    }
    .cpo-header-email {
        color: #9ca3af;
        font-size: 0.8rem;
        margin: 0;
        text-align: center;
    }
    .cpo-body {
        padding: 1.25rem 1.5rem;
    }
    .cpo-row {
        display: flex;
        align-items: baseline;
        padding: 0.6rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .cpo-row:last-child { border-bottom: none; }
    .cpo-row-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        width: 90px;
        flex-shrink: 0;
    }
    .cpo-row-value {
        font-size: 0.9rem;
        color: #111827;
        font-weight: 500;
        margin: 0;
    }
    .cpo-empty {
        font-size: 0.85rem;
        color: #d1d5db;
        font-style: italic;
    }
`;

export const CardProfileOwner = () => {
    const { user } = storeProfile()
    const initial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'V'
    const rol = user?.rol || 'vendedor'

    return (
        <>
            <style>{styles}</style>
            <div className="cpo-card">
                <div className="cpo-header">
                    <div className="cpo-avatar">{initial}</div>
                    <p className="cpo-header-name">{user?.nombre} {user?.apellido}</p>
                    <span className="cpo-badge">{rol}</span>
                    <p className="cpo-header-email">{user?.email}</p>
                </div>
                <div className="cpo-body">
                    <div className="cpo-row">
                        <span className="cpo-row-label">Nombre</span>
                        <p className="cpo-row-value">{user?.nombre || <span className="cpo-empty">Sin datos</span>}</p>
                    </div>
                    <div className="cpo-row">
                        <span className="cpo-row-label">Apellido</span>
                        <p className="cpo-row-value">{user?.apellido || <span className="cpo-empty">Sin datos</span>}</p>
                    </div>
                    <div className="cpo-row">
                        <span className="cpo-row-label">Dirección</span>
                        <p className="cpo-row-value">{user?.direccion || <span className="cpo-empty">Sin datos</span>}</p>
                    </div>
                    <div className="cpo-row">
                        <span className="cpo-row-label">Teléfono</span>
                        <p className="cpo-row-value">{user?.telefono || <span className="cpo-empty">Sin datos</span>}</p>
                    </div>
                    <div className="cpo-row">
                        <span className="cpo-row-label">Correo</span>
                        <p className="cpo-row-value">{user?.email}</p>
                    </div>
                </div>
            </div>
        </>
    )
}