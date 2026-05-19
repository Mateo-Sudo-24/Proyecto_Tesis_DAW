import storeProfile from "../../context/storeProfile"

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .cp-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.09);
        overflow: hidden;
    }
    .cp-header {
        background: #1f2937;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }
    .cp-avatar {
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
    .cp-header-name {
        color: #fff;
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0;
        text-align: center;
    }
    .cp-header-email {
        color: #9ca3af;
        font-size: 0.8rem;
        margin: 0;
        text-align: center;
    }
    .cp-body {
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0;
    }
    .cp-row {
        display: flex;
        align-items: baseline;
        padding: 0.6rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .cp-row:last-child { border-bottom: none; }
    .cp-row-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        width: 90px;
        flex-shrink: 0;
    }
    .cp-row-value {
        font-size: 0.9rem;
        color: #111827;
        font-weight: 500;
        margin: 0;
    }
    .cp-empty {
        font-size: 0.85rem;
        color: #d1d5db;
        font-style: italic;
    }
    .cp-toggle-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #e8760a;
        width: 100%;
        border-bottom: 1px solid #f3f4f6;
        transition: color 0.15s;
    }
    .cp-toggle-btn:hover { color: #c4620a; }
    .cp-toggle-chevron { font-size: 0.6rem; margin-left: auto; transition: transform 0.2s; }
    .cp-toggle-chevron.open { transform: rotate(180deg); }
    .cp-collapsible { overflow: hidden; transition: max-height 0.25s ease; max-height: 0; }
    .cp-collapsible.open { max-height: 150px; }
`;

export const CardProfile = () => {
    const { user } = storeProfile()
    const initial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'

    return (
        <>
            <style>{styles}</style>
            <div className="cp-card">
                <div className="cp-header">
                    <div className="cp-avatar">{initial}</div>
                    <p className="cp-header-name">{user?.nombre} {user?.apellido}</p>
                    <p className="cp-header-email">{user?.email}</p>
                </div>
                <div className="cp-body">
                    <div className="cp-row">
                        <span className="cp-row-label">Correo</span>
                        <p className="cp-row-value">{user?.email}</p>
                    </div>
                </div>
            </div>
        </>
    )
}