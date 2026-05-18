import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import { CardProfileOwner } from '../components/profile/CardProfileOwner';
import FormProfile from '../components/profile/FormProfile';
import storeProfile from '../context/storeProfile';

const styles = `
    /* ── Título con barrita naranja ── */
    .prf-page-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.2rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .prf-page-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: #e8760a;
        border-radius: 2px;
        flex-shrink: 0;
    }
    .prf-page-sub {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    .prf-page-divider {
        height: 1px;
        background: linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin: 0 0 1.25rem;
        border: none;
    }

    /* ── Compactar cards internas (moderado) ── */
    .cpo-header, .cp-header {
        padding: 1rem 1.25rem !important;
        gap: 0.5rem !important;
    }
    .cpo-avatar, .cp-avatar {
        width: 56px !important;
        height: 56px !important;
        font-size: 1.5rem !important;
    }
    .cpo-header-name, .cp-header-name { font-size: 0.95rem !important; }
    .cpo-header-email, .cp-header-email { font-size: 0.75rem !important; }
    .cpo-body { padding: 0.75rem 1.25rem !important; }
    .cpo-row, .cp-row { padding: 0.4rem 0 !important; }
    .cp-body { padding: 0.75rem 1.25rem !important; }

    .pwd-header, .prof-form-header {
        padding: 1rem 1.5rem !important;
    }
    .pwd-header h2, .prof-form-header h2 {
        font-size: 1rem !important;
        margin-bottom: 0.1rem !important;
    }
    .pwd-header p, .prof-form-header p { font-size: 0.78rem !important; }

    .pwd-body { padding: 1rem 1.5rem !important; }
    .pwd-field { margin-bottom: 0.7rem !important; }
    .pwd-warning {
        padding: 0.5rem 0.75rem !important;
        margin-bottom: 0.7rem !important;
        font-size: 0.78rem !important;
    }
    .pwd-input { padding: 0.5rem 0.875rem !important; font-size: 0.875rem !important; }
    .btn-pwd-submit {
        padding: 0.6rem 1rem !important;
        font-size: 0.875rem !important;
        margin-top: 0.5rem !important;
    }

    .prof-form-wrapper { max-width: 100% !important; margin: 0 !important; }
    .prof-form-body { padding: 1rem 1.5rem !important; }
    .prof-field { margin-bottom: 0.7rem !important; }
    .prof-input { padding: 0.5rem 0.875rem !important; font-size: 0.875rem !important; }
    .prof-divider { margin: 0.6rem 0 !important; }
    .btn-prof-submit {
        padding: 0.6rem 1rem !important;
        font-size: 0.875rem !important;
        margin-top: 0.5rem !important;
    }
`;

const Profile = () => {
    const { user } = storeProfile();

    return (
        <>
            <style>{styles}</style>
            <div style={{ marginBottom: '1.25rem' }}>
                <h1 className='prf-page-title'>Perfil</h1>
                <p className='prf-page-sub'>Administra tu información personal y seguridad.</p>
            </div>
            <hr className='prf-page-divider' />

            {user && (user.rol === 'cliente' || user.rol === 'vendedor') ? (
                <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                    <div className='w-full md:w-1/2'>
                        <CardProfileOwner />
                    </div>
                </div>
            ) : user && user.rol === 'administrador' ? (
                <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                    <div className='w-full md:w-1/2'>
                        <FormProfile />
                    </div>
                    <div className='w-full md:w-1/2' style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <CardProfile />
                        <CardPassword />
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    No se pudo cargar el perfil del usuario.
                </div>
            )}
        </>
    );
};

export default Profile;
