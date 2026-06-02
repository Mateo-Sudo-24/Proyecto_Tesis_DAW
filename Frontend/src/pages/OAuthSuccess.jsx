import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import storeAuth from "../context/storeAuth";

const oauthStyles = `
    .oauth-page { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: #f9fafb; }
    .oauth-card { width: min(100%, 420px); background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 18px 45px rgba(17,24,39,0.1); padding: 2rem; text-align: center; }
    .oauth-logo { margin: 0 0 1rem; color: #111827; font-size: 1.9rem; font-weight: 900; letter-spacing: 0.08em; }
    .oauth-logo span { color: #e8760a; }
    .oauth-icon { width: 58px; height: 58px; margin: 0 auto 1.1rem; border-radius: 999px; display: grid; place-items: center; background: #fff7ed; border: 1px solid #fed7aa; }
    .oauth-spinner { width: 30px; height: 30px; border: 4px solid #fed7aa; border-top-color: #e8760a; border-radius: 999px; animation: oauth-spin 0.8s linear infinite; }
    .oauth-mark { color: #dc2626; font-size: 1.5rem; font-weight: 900; }
    .oauth-title { margin: 0; color: #111827; font-size: 1.35rem; font-weight: 900; }
    .oauth-text { margin: 0.55rem 0 0; color: #6b7280; line-height: 1.5; font-weight: 700; }
    .oauth-actions { margin-top: 1.4rem; display: flex; justify-content: center; }
    .oauth-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0.65rem 1rem; border-radius: 0.55rem; background: #e8760a; color: #fff; text-decoration: none; font-weight: 900; transition: background 0.18s, transform 0.18s; }
    .oauth-btn:hover { background: #c4620a; transform: translateY(-1px); }
    @keyframes oauth-spin { to { transform: rotate(360deg); } }
`;

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const setToken = storeAuth((state) => state.setToken);
    const setRol = storeAuth((state) => state.setRol);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token");

        if (!tokenParam) {
            setFailed(true);
            return;
        }

        try {
            const payload = JSON.parse(atob(tokenParam.split(".")[1]));
            const rol = payload.rol;

            setToken(tokenParam);
            setRol(rol);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Error al procesar el token:", error);
            setFailed(true);
        }
    }, [navigate, setRol, setToken]);

    return (
        <>
            <style>{oauthStyles}</style>
            <div className="oauth-page">
                <div className="oauth-card">
                    <h1 className="oauth-logo">IN<span>TEX</span></h1>
                    <div className="oauth-icon">
                        {failed ? <span className="oauth-mark">!</span> : <div className="oauth-spinner" />}
                    </div>
                    <h2 className="oauth-title">{failed ? "No se pudo iniciar sesion" : "Procesando autenticacion"}</h2>
                    <p className="oauth-text">
                        {failed
                            ? "El enlace de autenticacion no es valido o expiro."
                            : "Estamos validando tus credenciales. Seras redirigido en un momento."}
                    </p>
                    {failed && (
                        <div className="oauth-actions">
                            <Link className="oauth-btn" to="/login">Volver al login</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OAuthSuccess;
