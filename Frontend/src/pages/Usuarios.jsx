import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/list/Table'
import FormCliente from '../components/create/FormCliente'
import storeProfile from '../context/storeProfile'

const styles = `
    .usu-page { width: 100%; }

    .usu-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }
    .usu-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .usu-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: #e8760a;
        border-radius: 2px;
        flex-shrink: 0;
    }
    .usu-sub {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    .usu-divider {
        height: 1px;
        background: linear-gradient(90deg, #e8760a 0%, #f3f4f6 60%);
        margin: 0 0 1.25rem;
        border: none;
    }
    .usu-header-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    /* ── Tabs ── */
    .usu-tabs {
        display: flex;
        background: #f3f4f6;
        border-radius: 0.875rem;
        padding: 0.25rem;
        gap: 0.25rem;
    }
    .usu-tab {
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
    .usu-tab:hover { color: #111827; }
    .usu-tab.active {
        background: #111827;
        color: #f59e0b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    /* ── Botón Crear ── */
    .usu-btn-crear {
        padding: 0.55rem 1.25rem;
        background: #e8760a;
        color: #fff;
        border: none;
        border-radius: 0.625rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.18s, transform 0.12s;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
        white-space: nowrap;
    }
    .usu-btn-crear:hover {
        background: #c4620a;
        transform: translateY(-1px);
    }

    /* ── Modal ── */
    .usu-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 1rem;
        overflow-y: auto;
    }
    .usu-modal {
        width: 100%;
        max-width: 640px;
        margin: auto;
        animation: usu-modal-in 0.18s ease;
    }
    .usu-modal .ux-form-wrapper { margin: 0 !important; }
    @keyframes usu-modal-in {
        from { opacity: 0; transform: scale(0.96) translateY(12px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
        .usu-header { flex-direction: column; }
        .usu-header-right { width: 100%; flex-wrap: wrap; }
        .usu-tabs { width: 100%; }
        .usu-tab { flex: 1; justify-content: center; padding: 0.55rem 0.5rem; font-size: 0.8rem; }
        .usu-btn-crear { width: 100%; justify-content: center; }
    }
`;

const Usuarios = () => {
    const navigate = useNavigate()
    const { user } = storeProfile()
    const isVendedor = user?.rol === 'vendedor'

    const [tipo, setTipo] = useState('clientes')
    const [formAbierto, setFormAbierto] = useState(false)
    const [tableKey, setTableKey] = useState(0)

    const tipoEfectivo = isVendedor ? 'clientes' : tipo

    const handleSuccess = useCallback(() => {
        setFormAbierto(false)
        setTableKey(k => k + 1)
    }, [])

    const cambiarTipo = (nuevoTipo) => {
        setTipo(nuevoTipo)
        setFormAbierto(false)
    }

    return (
        <>
            <style>{styles}</style>
            <div className="usu-page">

                {/* ── Encabezado ── */}
                <div className="usu-header">
                    <div>
                        <h1 className="usu-title">Usuarios</h1>
                        <p className="usu-sub">Gestiona clientes y vendedores registrados en el sistema.</p>
                    </div>

                    <div className="usu-header-right">
                        {/* Tabs admin */}
                        {!isVendedor && (
                            <div className="usu-tabs" role="radiogroup" aria-label="Tipo de usuario">
                                <button
                                    className={`usu-tab${tipo === 'clientes' ? ' active' : ''}`}
                                    onClick={() => cambiarTipo('clientes')}
                                    role="radio" aria-checked={tipo === 'clientes'}
                                >
                                    👤 Clientes
                                </button>
                                <button
                                    className={`usu-tab${tipo === 'vendedores' ? ' active' : ''}`}
                                    onClick={() => cambiarTipo('vendedores')}
                                    role="radio" aria-checked={tipo === 'vendedores'}
                                >
                                    🏪 Vendedores
                                </button>
                            </div>
                        )}

                        {/* Botón crear */}
                        <button
                            className="usu-btn-crear"
                            onClick={() => setFormAbierto(true)}
                        >
                            ➕ Crear {tipoEfectivo === 'clientes' ? 'cliente' : 'vendedor'}
                        </button>
                        {isVendedor && (
                            <button
                                className="usu-btn-crear"
                                onClick={() => navigate('/dashboard/tienda')}
                            >
                                🛒 Crear cliente con pedido
                            </button>
                        )}
                    </div>
                </div>

                <hr className="usu-divider" />

                {/* ── Modal ── */}
                {formAbierto && (
                    <div className="usu-modal-overlay" onClick={() => setFormAbierto(false)}>
                        <div className="usu-modal" onClick={e => e.stopPropagation()}>
                            <FormCliente
                                tipoInicial={tipoEfectivo === 'clientes' ? 'cliente' : 'vendedor'}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </div>
                )}

                {/* ── Tabla ── */}
                <Table key={tableKey} tipo={tipoEfectivo} />

            </div>
        </>
    )
}

export default Usuarios
