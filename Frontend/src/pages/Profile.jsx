import CardPassword from "../components/profile/CardPassword";
import CardEmail from "../components/profile/CardEmail";
import { CardProfile } from "../components/profile/CardProfile";
import { CardProfileOwner } from "../components/profile/CardProfileOwner";
import FormProfile from "../components/profile/FormProfile";
import storeProfile from "../context/storeProfile";

const styles = `
    .prf-page-title {
        font-size:1.5rem;
        font-weight:900;
        color:#111827;
        margin:0 0 0.2rem;
        display:flex;
        align-items:center;
        gap:0.6rem;
    }
    .prf-page-title::before {
        content:'';
        display:inline-block;
        width:4px;
        height:1.4rem;
        background:#e8760a;
        border-radius:2px;
        flex-shrink:0;
    }
    .prf-page-sub {
        font-size:0.875rem;
        color:#6b7280;
        margin:0;
    }
    .prf-page-divider {
        height:1px;
        background:linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin:0 0 1.25rem;
        border:none;
    }
    .prf-grid {
        display:grid;
        grid-template-columns:1fr;
        gap:1.25rem;
    }
    @media (min-width: 900px) {
        .prf-grid { grid-template-columns:1fr 1fr; align-items:start; }
    }
    .prf-stack {
        display:flex;
        flex-direction:column;
        gap:1.25rem;
    }
    @media (max-width: 899px) {
        .prf-admin-grid { display:flex; flex-direction:column; }
        .prf-admin-grid .prf-stack { display:contents; }
        .prf-admin-main { order: 1; }
        .prf-admin-form { order: 2; }
        .prf-admin-email { order: 3; }
        .prf-admin-password { order: 4; }
    }
`;

const Profile = () => {
    const { user } = storeProfile();

    if (!user) {
        return (
            <>
                <style>{styles}</style>
                <div className="text-center py-12 text-gray-400">
                    No se pudo cargar el perfil del usuario.
                </div>
            </>
        );
    }

    const isOwner = user.rol === "cliente" || user.rol === "vendedor";
    const isAdmin = user.rol === "administrador";

    return (
        <>
            <style>{styles}</style>
            <div style={{ marginBottom: "1.25rem" }}>
                <h1 className="prf-page-title">Perfil</h1>
                <p className="prf-page-sub">Administra tu información personal, correo y seguridad.</p>
            </div>
            <hr className="prf-page-divider" />

            {isOwner && (
                <div className="prf-grid">
                    <div className="prf-stack">
                        <CardProfileOwner />
                        <CardEmail />
                    </div>
                    <div className="prf-stack">
                        <CardPassword />
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className="prf-grid prf-admin-grid">
                    <div className="prf-stack">
                        <div className="prf-admin-form"><FormProfile /></div>
                        <div className="prf-admin-email"><CardEmail /></div>
                    </div>
                    <div className="prf-stack">
                        <div className="prf-admin-main"><CardProfile /></div>
                        <div className="prf-admin-password"><CardPassword /></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
