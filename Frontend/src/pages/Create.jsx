import FormCliente from '../components/create/FormCliente';
import storeProfile from '../context/storeProfile';

const styles = `
    .create-page {
        max-width: 700px;
        margin: 0 auto;
    }
    .create-page-header {
        margin-bottom: 0.25rem;
    }
    .create-page-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .create-page-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: #e8760a;
        border-radius: 2px;
        flex-shrink: 0;
    }
    .create-page-sub {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    .create-page-divider {
        height: 1px;
        background: linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin: 1rem 0 0;
        border: none;
    }
`;

const Create = () => {
    const { user } = storeProfile();
    const soloClientes = user?.rol === 'vendedor';
    return (
        <>
            <style>{styles}</style>
            <div className="create-page">
                <div className="create-page-header">
                    <h1 className="create-page-title">Crear usuario</h1>
                    <p className="create-page-sub">
                        {soloClientes
                            ? 'Invita un nuevo cliente al sistema.'
                            : 'Invita un nuevo cliente o vendedor al sistema.'}
                    </p>
                </div>
                <hr className="create-page-divider" />
                <FormCliente />
            </div>
        </>
    );
}

export default Create;
