import Table from "../components/list/Table"

const styles = `
    .list-page {
        max-width: 1000px;
        margin: 0 auto;
    }
    .list-page-header {
        margin-bottom: 1.75rem;
    }
    .list-page-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .list-page-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: #e8760a;
        border-radius: 2px;
    }
    .list-page-sub {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    .list-page-divider {
        height: 1px;
        background: linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin: 1rem 0 1.5rem;
        border: none;
    }
`;

const List = () => {
    return (
        <>
            <style>{styles}</style>
            <div className="list-page">
                <div className="list-page-header">
                    <h1 className="list-page-title">Usuarios registrados</h1>
                    <p className="list-page-sub">Gestiona clientes y vendedores desde este panel.</p>
                </div>
                <hr className="list-page-divider" />
                <Table />
            </div>
        </>
    )
}

export default List