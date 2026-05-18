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
        display: flex;
    }
    /* ── Columna izquierda: avatar ── */
    .cpo-left {
        background: #1f2937;
        width: 190px;
        min-width: 170px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.25rem;
        gap: 0.65rem;
        flex-shrink: 0;
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
        flex-shrink: 0;
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
        font-size: 1rem;
        font-weight: 800;
        margin: 0;
        text-align: center;
        line-height: 1.3;
    }
    .cpo-header-email {
        color: #9ca3af;
        font-size: 0.75rem;
        margin: 0;
        text-align: center;
        word-break: break-all;
    }
    /* ── Columna derecha: datos ── */
    .cpo-right {
        flex: 1;
        padding: 1.5rem 1.75rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
    }
    .cpo-row {
        display: flex;
        align-items: baseline;
        padding: 0.55rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .cpo-row:last-child { border-bottom: none; }
    .cpo-row-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        width: 85px;
        flex-shrink: 0;
    }
    .cpo-row-value {
        font-size: 0.875rem;
        color: #111827;
        font-weight: 500;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .cpo-empty {
        font-size: 0.82rem;
        color: #d1d5db;
        font-style: italic;
    }
    @media (max-width: 560px) {
        .cpo-card { flex-direction: column; }
        .cpo-left { width: 100%; flex-direction: row; gap: 1rem; padding: 1.25rem; justify-content: flex-start; }
    }
`;

export const CardProfileOwner = () => {
    const { user } = storeProfile()
    const initial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'
    const rol = user?.rol || 'cliente'

    return (
        <>
            <style>{styles}</style>
            <div className="cpo-card">
                {/* ── Izquierda ── */}
                <div className="cpo-left">
                    <div className="cpo-avatar">{initial}</div>
                    <p className="cpo-header-name">{user?.nombre} {user?.apellido}</p>
                    <span className="cpo-badge">{rol}</span>
                    <p className="cpo-header-email">{user?.email}</p>
                </div>

                {/* ── Derecha ── */}
                <div className="cpo-right">
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