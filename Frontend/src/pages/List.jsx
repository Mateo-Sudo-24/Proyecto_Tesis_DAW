import { useState } from 'react'
import Table from "../components/list/Table"
import storeProfile from '../context/storeProfile'

const styles = `
    .list-page {
        max-width: 1100px;
        margin: 0 auto;
    }
    .list-page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
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
        margin: 0 0 1.5rem;
        border: none;
    }

    /* ── Tabs radio ── */
    .list-tabs {
        display: flex;
        background: #f3f4f6;
        border-radius: 0.875rem;
        padding: 0.25rem;
        gap: 0.25rem;
        align-self: flex-start;
    }
    .list-tab-btn {
        padding: 0.55rem 1.4rem;
        border-radius: 0.625rem;
        border: none;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        background: transparent;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;
    }
    .list-tab-btn:hover { color: #111827; }
    .list-tab-btn.active {
        background: #111827;
        color: #f59e0b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .list-tab-count {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        background: #e5e7eb;
        color: #6b7280;
    }
    .list-tab-btn.active .list-tab-count {
        background: #374151;
        color: #f59e0b;
    }

    @media (max-width: 640px) {
        .list-page-header { flex-direction: column; }
        .list-tabs { width: 100%; }
        .list-tab-btn { flex: 1; justify-content: center; padding: 0.55rem 0.75rem; font-size: 0.8rem; }
        .list-page-title { font-size: 1.2rem; }
    }
`;

const List = () => {
    const { user } = storeProfile()
    const isVendedor = user?.rol === 'vendedor'
    const [tipo, setTipo] = useState('clientes')

    return (
        <>
            <style>{styles}</style>
            <div className="list-page">
                <div className="list-page-header">
                    <div>
                        <h1 className="list-page-title">Usuarios registrados</h1>
                        <p className="list-page-sub">Gestiona clientes y vendedores desde este panel.</p>
                    </div>

                    {/* Tabs — solo admin ve ambas opciones */}
                    {!isVendedor && (
                        <div className="list-tabs" role="radiogroup" aria-label="Tipo de usuario">
                            <button
                                className={`list-tab-btn${tipo === 'clientes' ? ' active' : ''}`}
                                onClick={() => setTipo('clientes')}
                                role="radio"
                                aria-checked={tipo === 'clientes'}
                            >
                                👤 Clientes
                            </button>
                            <button
                                className={`list-tab-btn${tipo === 'vendedores' ? ' active' : ''}`}
                                onClick={() => setTipo('vendedores')}
                                role="radio"
                                aria-checked={tipo === 'vendedores'}
                            >
                                🏪 Vendedores
                            </button>
                        </div>
                    )}
                </div>

                <hr className="list-page-divider" />
                <Table tipo={isVendedor ? 'clientes' : tipo} />
            </div>
        </>
    )
}

export default List