import { Link } from 'react-router-dom';

const nfStyles = `
    :root { --orange-main:#e8760a; --orange-dark:#c4620a; --orange-light:#fde8ce; }
    .nf-root {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1f2937 0%, #111827 60%, #1a1a2e 100%);
        padding: 2rem 1rem;
        font-family: 'Inter', system-ui, sans-serif;
    }
    .nf-card {
        background: #fff;
        border-radius: 1.5rem;
        box-shadow: 0 32px 80px rgba(0,0,0,0.35);
        max-width: 520px;
        width: 100%;
        overflow: hidden;
        animation: nf-in 0.4s cubic-bezier(.4,0,.2,1);
    }
    @keyframes nf-in {
        from { opacity:0; transform:translateY(24px) scale(0.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
    }
    .nf-img-wrap {
        position: relative;
        height: 220px;
        overflow: hidden;
        background: #111827;
    }
    .nf-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.45;
        filter: grayscale(30%);
    }
    .nf-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to bottom, rgba(17,24,39,0.3), rgba(17,24,39,0.85));
    }
    .nf-code {
        font-size: 5.5rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -4px;
        line-height: 1;
        text-shadow: 0 4px 24px rgba(232,118,10,0.45);
    }
    .nf-body {
        padding: 2rem 2.5rem 2.5rem;
        text-align: center;
    }
    .nf-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: #111827;
        margin: 0 0 0.5rem;
    }
    .nf-sub {
        font-size: 0.925rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 2rem;
    }
    .nf-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    .nf-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 0.7rem 1.5rem;
        border-radius: 0.625rem;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 14px rgba(232,118,10,0.3);
    }
    .nf-btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); }
    .nf-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: #f3f4f6;
        color: #374151;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 0.7rem 1.5rem;
        border-radius: 0.625rem;
        text-decoration: none;
        border: 1.5px solid #e5e7eb;
        cursor: pointer;
        transition: background 0.18s;
    }
    .nf-btn-secondary:hover { background: #e5e7eb; }
    .nf-badge {
        display: inline-block;
        background: var(--orange-light);
        color: var(--orange-dark);
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        margin-bottom: 0.75rem;
    }
`;

export const NotFound = () => {
    return (
        <>
            <style>{nfStyles}</style>
            <div className="nf-root">
                <div className="nf-card">
                    <div className="nf-img-wrap">
                        <img
                            src="/images/forgot.jpg"
                            alt="Página no encontrada"
                            className="nf-img"
                        />
                        <div className="nf-overlay">
                            <span className="nf-code">404</span>
                        </div>
                    </div>
                    <div className="nf-body">
                        <span className="nf-badge">Error 404</span>
                        <h1 className="nf-title">Página no encontrada</h1>
                        <p className="nf-sub">
                            Lo sentimos, la página que buscas no existe o fue movida.<br/>
                            Verifica la URL o regresa al inicio.
                        </p>
                        <div className="nf-actions">
                            <Link to="/home" className="nf-btn-primary">
                                🏠 Ir al inicio
                            </Link>
                            <Link to="/dashboard" className="nf-btn-secondary">
                                📊 Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};



