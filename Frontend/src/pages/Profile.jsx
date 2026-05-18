import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import { CardProfileOwner } from '../components/profile/CardProfileOwner';
import FormProfile from '../components/profile/FormProfile';
import storeProfile from '../context/storeProfile';

const styles = `
    .profile-page {
        height: calc(100vh - 120px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        gap: 0.75rem;
    }
    .profile-title {
        font-size: 1.4rem;
        font-weight: 900;
        color: #6b7280;
        margin: 0;
        flex-shrink: 0;
    }
    .profile-body {
        flex: 1;
        display: flex;
        gap: 1.25rem;
        min-height: 0;
        overflow: hidden;
    }
    .profile-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-height: 0;
        overflow: hidden;
    }
    .profile-col > * {
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }
    /* Compactar cards internas */
    .cpo-header, .cp-header, .pwd-header, .prof-form-header {
        padding: 0.75rem 1.25rem !important;
    }
    .cpo-avatar, .cp-avatar {
        width: 48px !important;
        height: 48px !important;
        font-size: 1.3rem !important;
    }
    .cpo-header-name, .cp-header-name {
        font-size: 0.9rem !important;
    }
    .cpo-header-email, .cp-header-email {
        font-size: 0.72rem !important;
    }
    .cpo-body, .cp-body {
        padding: 0.5rem 1.25rem !important;
    }
    .cpo-row, .cp-row {
        padding: 0.35rem 0 !important;
    }
    .pwd-body, .prof-form-body {
        padding: 0.75rem 1.25rem !important;
    }
    .pwd-field, .prof-field {
        margin-bottom: 0.6rem !important;
    }
    .pwd-warning {
        padding: 0.45rem 0.75rem !important;
        margin-bottom: 0.6rem !important;
        font-size: 0.75rem !important;
    }
    .pwd-header h2, .prof-form-header h2 {
        font-size: 0.95rem !important;
        margin-bottom: 0.1rem !important;
    }
    .pwd-header p, .prof-form-header p {
        font-size: 0.72rem !important;
    }
    .pwd-label, .prof-label {
        font-size: 0.7rem !important;
        margin-bottom: 0.25rem !important;
    }
    .pwd-input, .prof-input {
        padding: 0.4rem 0.75rem !important;
        font-size: 0.82rem !important;
    }
    .btn-pwd-submit, .btn-prof-submit {
        padding: 0.5rem 1rem !important;
        font-size: 0.82rem !important;
        margin-top: 0.25rem !important;
    }
    .prof-divider {
        margin: 0.5rem 0 !important;
    }
    .prof-form-wrapper {
        max-width: 100% !important;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .prof-form-body {
        flex: 1;
        overflow: hidden;
    }
    .cpo-card, .cp-card, .pwd-card {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .cpo-body, .cp-body, .pwd-body {
        flex: 1;
        overflow: hidden;
    }
    @media (max-width: 768px) {
        .profile-page {
            height: auto;
            overflow: auto;
        }
        .profile-body {
            flex-direction: column;
            overflow: visible;
        }
    }
`;

const Profile = () => {
    const { user } = storeProfile();

    return (
        <>
            <style>{styles}</style>
            <div className="profile-page">
                <h1 className="profile-title">Perfil</h1>

                {user && (user.rol === 'cliente' || user.rol === 'vendedor') ? (
                    <div className="profile-body">
                        <div className="profile-col">
                            <CardProfileOwner />
                        </div>
                    </div>
                ) : user && user.rol === 'administrador' ? (
                    <div className="profile-body">
                        <div className="profile-col">
                            <FormProfile />
                        </div>
                        <div className="profile-col">
                            <CardProfile />
                            <CardPassword />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        No se pudo cargar el perfil del usuario.
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
