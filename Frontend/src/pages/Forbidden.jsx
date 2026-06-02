import { Link } from "react-router-dom";

const forbiddenStyles = `
    .forbidden-root { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: #f9fafb; }
    .forbidden-card { width: min(100%, 480px); background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 18px 45px rgba(17,24,39,0.1); padding: 2rem; text-align: center; }
    .forbidden-code { width: 72px; height: 72px; display: grid; place-items: center; margin: 0 auto 1.1rem; border-radius: 999px; background: #fff7ed; border: 1px solid #fed7aa; color: #e8760a; font-size: 1.45rem; font-weight: 900; }
    .forbidden-title { margin: 0; color: #111827; font-size: 1.55rem; font-weight: 900; }
    .forbidden-message { margin: 0.65rem 0 0; color: #6b7280; line-height: 1.6; font-weight: 700; }
    .forbidden-actions { margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.7rem; flex-wrap: wrap; }
    .forbidden-button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1rem; border-radius: 0.55rem; text-decoration: none; font-weight: 900; transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s; }
    .forbidden-button.primary { background: #e8760a; border: 1px solid #e8760a; color: #fff; }
    .forbidden-button.secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
    .forbidden-button:hover { transform: translateY(-1px); }
    .forbidden-button.primary:hover { background: #c4620a; border-color: #c4620a; }
    .forbidden-button.secondary:hover { border-color: #e8760a; color: #e8760a; }
`;

export const Forbidden = () => {
    return (
        <>
            <style>{forbiddenStyles}</style>
            <div className="forbidden-root">
                <div className="forbidden-card">
                    <div className="forbidden-code">403</div>
                    <h1 className="forbidden-title">Acceso denegado</h1>
                    <p className="forbidden-message">
                        Tu cuenta no tiene permisos para ver esta seccion. Puedes volver al inicio o entrar con otra cuenta.
                    </p>
                    <div className="forbidden-actions">
                        <Link to="/dashboard" className="forbidden-button primary">Ir al dashboard</Link>
                        <Link to="/login" className="forbidden-button secondary">Cambiar cuenta</Link>
                    </div>
                </div>
            </div>
        </>
    );
};
