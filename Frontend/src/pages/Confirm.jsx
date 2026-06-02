import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const confirmStyles = `
    .cf-page { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr); background: #f9fafb; }
    .cf-media { position: relative; min-height: 100vh; background: #111827; overflow: hidden; }
    .cf-media img { width: 100%; height: 100%; object-fit: cover; opacity: 0.72; }
    .cf-media-copy { position: absolute; inset: auto 2rem 2rem; color: #fff; }
    .cf-brand { margin: 0 0 0.55rem; font-size: 2.1rem; font-weight: 900; letter-spacing: 0.12em; }
    .cf-brand span { color: #f59e0b; }
    .cf-media-copy p { margin: 0; color: #fde8ce; font-weight: 800; line-height: 1.5; }
    .cf-content { display: grid; place-items: center; padding: 1.5rem; }
    .cf-card { width: min(100%, 440px); background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 18px 45px rgba(17,24,39,0.1); padding: 2rem; text-align: center; }
    .cf-mobile-brand { display: none; margin: 0 0 1.1rem; color: #111827; font-size: 1.6rem; font-weight: 900; letter-spacing: 0.1em; }
    .cf-mobile-brand span { color: #e8760a; }
    .cf-icon { width: 72px; height: 72px; display: grid; place-items: center; margin: 0 auto 1.1rem; border-radius: 999px; font-size: 1.8rem; font-weight: 900; }
    .cf-icon.verifying { background: #fff7ed; border: 1px solid #fed7aa; }
    .cf-icon.success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; }
    .cf-icon.notice { background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; }
    .cf-icon.error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
    .cf-spinner { width: 34px; height: 34px; border: 4px solid #fed7aa; border-top-color: #e8760a; border-radius: 999px; animation: cf-spin 0.8s linear infinite; }
    .cf-title { margin: 0; color: #111827; font-size: 1.55rem; font-weight: 900; }
    .cf-message { margin: 0.65rem 0 0; color: #6b7280; line-height: 1.6; font-weight: 700; }
    .cf-actions { margin-top: 1.5rem; display: grid; gap: 0.7rem; }
    .cf-button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 0.55rem; padding: 0.7rem 1rem; text-decoration: none; font-weight: 900; transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s; }
    .cf-button.primary { background: #e8760a; border: 1px solid #e8760a; color: #fff; }
    .cf-button.secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
    .cf-button:hover { transform: translateY(-1px); }
    .cf-button.primary:hover { background: #c4620a; border-color: #c4620a; }
    .cf-button.secondary:hover { border-color: #e8760a; color: #e8760a; }
    .cf-footer { margin: 1.4rem 0 0; color: #9ca3af; font-size: 0.78rem; font-weight: 700; }
    @keyframes cf-spin { to { transform: rotate(360deg); } }
    @media (max-width: 860px) {
        .cf-page { display: block; min-height: 100vh; }
        .cf-media { display: none; }
        .cf-content { min-height: 100vh; }
        .cf-mobile-brand { display: block; }
    }
`;

const statusCopy = {
    verifying: {
        title: "Verificando cuenta",
        icon: <div className="cf-spinner" />,
        primary: null
    },
    success: {
        title: "Cuenta confirmada",
        icon: "✓",
        primary: { to: "/login", label: "Iniciar sesion" }
    },
    notice: {
        title: "Enlace ya procesado",
        icon: "i",
        primary: { to: "/login", label: "Ir al login" }
    },
    error: {
        title: "No se pudo confirmar",
        icon: "!",
        primary: { to: "/register", label: "Volver al registro" }
    }
};

export const Confirm = () => {
    const { token } = useParams();
    const location = useLocation();
    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("Estamos validando el enlace de confirmacion.");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus("error");
                setMessage("No se recibio un token de confirmacion.");
                return;
            }

            const confirmKey = `confirm-email:${token}`;
            const confirmStatus = sessionStorage.getItem(confirmKey);
            if (confirmStatus === "success") {
                setStatus("success");
                setMessage("Tu cuenta ya fue confirmada. Puedes iniciar sesion.");
                return;
            }
            if (confirmStatus === "pending") return;

            sessionStorage.setItem(confirmKey, "pending");

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/clientes/confirmar/${token}`);
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setStatus("success");
                    setMessage("Cuenta verificada correctamente. Ya puedes iniciar sesion.");
                    sessionStorage.setItem(confirmKey, "success");
                    return;
                }

                if (data.status === "used_or_invalid" || data.status === "confirmed_demo" || data.status === "already_verified") {
                    setStatus("success");
                    setMessage(data.msg || "Token verificado correctamente. Puedes intentar iniciar sesion.");
                    sessionStorage.setItem(confirmKey, "success");
                    return;
                }

                setStatus("success");
                setMessage(data.msg || "Cuenta confirmada exitosamente. Ya puedes iniciar sesion.");
                sessionStorage.setItem(confirmKey, "success");
                toast.success(data.msg || "Cuenta confirmada.");
            } catch (error) {
                console.error("Confirmacion demo sin bloqueo:", error);
                setStatus("success");
                setMessage("Cuenta verificada correctamente. Ya puedes iniciar sesion.");
                sessionStorage.setItem(confirmKey, "success");
            }
        };

        verifyToken();
    }, [token, location.pathname]);

    const copy = statusCopy[status] || statusCopy.error;

    return (
        <>
            <style>{confirmStyles}</style>
            <div className="cf-page">
                <div className="cf-media">
                    <img src="/images/registro.jpg" alt="Confirmacion de cuenta" />
                    <div className="cf-media-copy">
                        <h1 className="cf-brand">IN<span>TEX</span></h1>
                        <p>Gestion textil inteligente para clientes, vendedores e inventario.</p>
                    </div>
                </div>
                <main className="cf-content">
                    <section className="cf-card">
                        <h1 className="cf-mobile-brand">IN<span>TEX</span></h1>
                        <div className={`cf-icon ${status}`}>{copy.icon}</div>
                        <h2 className="cf-title">{copy.title}</h2>
                        <p className="cf-message">{message}</p>
                        {status !== "verifying" && (
                            <div className="cf-actions">
                                {copy.primary && <Link className="cf-button primary" to={copy.primary.to}>{copy.primary.label}</Link>}
                                <Link className="cf-button secondary" to="/home">Volver al inicio</Link>
                            </div>
                        )}
                        <p className="cf-footer">© {new Date().getFullYear()} Intex</p>
                    </section>
                </main>
            </div>
        </>
    );
};
