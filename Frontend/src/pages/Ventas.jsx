import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const pageStyles = `
:root { --orange-main:#e8760a; --orange-dark:#c4620a; --orange-light:#fde8ce; }

.vt-page { max-width: 1100px; margin: 0 auto; }

/* Header */
.vt-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
.vt-title { font-size:1.5rem; font-weight:900; color:#111827; margin:0 0 0.2rem; display:flex; align-items:center; gap:0.55rem; }
.vt-title::before { content:''; display:inline-block; width:4px; height:1.4rem; background:var(--orange-main); border-radius:2px; flex-shrink:0; }
.vt-sub { font-size:0.85rem; color:#6b7280; margin:0; }

/* RAG Grid */
.vt-rag-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

/* Cuadro superior izquierdo — Ingresos */
.vt-rag-ingresos {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-radius: 1rem;
    padding: 1.75rem;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
}
.vt-rag-ingresos-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin: 0 0 0.5rem;
}
.vt-rag-ingresos-valor {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #f59e0b;
    line-height: 1;
    margin: 0;
}
.vt-rag-ingresos-sub {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0.5rem 0 0;
}
.vt-rag-ingresos-stats {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}
.vt-rag-stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}
.vt-rag-stat-val {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
}
.vt-rag-stat-lbl {
    font-size: 0.68rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Cuadro superior derecho — Gráfico pastel */
.vt-rag-chart {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    min-height: 200px;
    display: flex;
    flex-direction: column;
}
.vt-rag-chart-title {
    font-size: 0.82rem;
    font-weight: 800;
    color: #374151;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Fila inferior — Contadores de estado */
.vt-rag-estados {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.875rem;
}
.vt-estado-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.875rem;
    padding: 1.1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: box-shadow 0.15s, transform 0.15s;
}
.vt-estado-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); transform: translateY(-1px); }
.vt-estado-icon {
    width: 44px; height: 44px;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
}
.vt-estado-info { min-width: 0; }
.vt-estado-val {
    font-size: 1.6rem;
    font-weight: 900;
    color: #111827;
    line-height: 1;
    margin: 0 0 0.2rem;
}
.vt-estado-lbl {
    font-size: 0.72rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    white-space: nowrap;
}

/* Colores por estado */
.icon-pendiente   { background: #fef3c7; }
.icon-en-curso    { background: #dbeafe; }
.icon-entregado   { background: #d1fae5; }
.icon-cancelado   { background: #fee2e2; }

/* Filtros */
.vt-filters { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; margin-bottom:1.25rem; }
.vt-refresh-btn { padding:0.55rem 0.9rem; border-radius:0.625rem; border:none; background:var(--orange-main); color:#fff; font-size:0.85rem; font-weight:800; cursor:pointer; }
.vt-refresh-btn:hover { background:var(--orange-dark); }
.vt-select { padding:0.55rem 0.9rem; border:1.5px solid #e5e7eb; border-radius:0.625rem; font-size:0.875rem; color:#374151; background:#fff; outline:none; cursor:pointer; }
.vt-select:focus { border-color:var(--orange-main); }

/* Tabla */
.vt-table-wrap { background:#fff; border:1px solid #e5e7eb; border-radius:1rem; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,0.06); }
.vt-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
.vt-table thead tr { background:#111827; }
.vt-table thead th { padding:0.875rem 1.25rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#9ca3af; }
.vt-table tbody tr { border-bottom:1px solid #f3f4f6; transition:background 0.15s; }
.vt-table tbody tr:hover { background:#fffbeb; }
.vt-table tbody tr:last-child { border-bottom:none; }
.vt-table td { padding:0.875rem 1.25rem; color:#374151; vertical-align:middle; }
.vt-badge { display:inline-flex; align-items:center; padding:0.25rem 0.65rem; border-radius:999px; font-size:0.7rem; font-weight:700; }
.vt-badge.pendiente  { background:#fef3c7; color:#92400e; }
.vt-badge.procesando { background:#dbeafe; color:#1e40af; }
.vt-badge.listo      { background:#e0f2fe; color:#075985; }
.vt-badge.entregado  { background:#d1fae5; color:#065f46; }
.vt-badge.cancelado  { background:#fee2e2; color:#991b1b; }
.vt-badge.realizado  { background:#d1fae5; color:#065f46; }
.vt-badge.fallido    { background:#fee2e2; color:#991b1b; }

/* Paginación */
.vt-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.875rem; border-top:1px solid #f3f4f6; flex-wrap:wrap; }
.vt-page-btn { padding:0.45rem 0.9rem; border-radius:0.5rem; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
.vt-page-btn:hover:not(:disabled) { background:var(--orange-light); border-color:var(--orange-main); color:var(--orange-dark); }
.vt-page-btn.current { background:var(--orange-main); border-color:var(--orange-main); color:#fff; }
.vt-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.vt-empty { text-align:center; padding:3rem 1rem; color:#9ca3af; }
.vt-spinner { text-align:center; padding:3rem; color:#9ca3af; }

@media (max-width: 900px) {
    .vt-rag-grid { grid-template-columns: 1fr; }
    .vt-rag-estados { grid-column: 1; grid-template-columns: repeat(2, 1fr); }
    .vt-table-wrap { overflow-x: auto; }
    .vt-table { min-width: 820px; }
}
@media (max-width: 560px) {
    .vt-rag-estados { grid-template-columns: 1fr 1fr; }
    .vt-rag-ingresos-valor { font-size: 1.75rem; }
    .vt-estado-val { font-size: 1.25rem; }
}
`;

const COLORES_PIE = {
    domicilio:      '#e8760a',
    retiro:         '#3b82f6',
    venta_local:    '#16a34a',
    establecimiento:'#8b5cf6',
};

const ITEMS_PER_PAGE = 10;
const getOrderTotal = (orden) => Number(orden?.totalFinal ?? orden?.precioTotal ?? orden?.total ?? 0) || 0;
const getPagoEstado = (estadoPago) => {
    if (estadoPago === true || estadoPago === 'true' || estadoPago === 'completado' || estadoPago === 'pagado') return 'realizado';
    if (estadoPago === 'fallido') return 'fallido';
    return 'pendiente';
};
const cuentaComoIngreso = (orden) => getPagoEstado(orden.estadoPago) === 'realizado';

const Ventas = () => {
    const { token } = storeAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPago, setFiltroPago] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [page, setPage] = useState(1);

    const fetchOrdenes = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ordenes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Error al cargar ventas');
            const data = await res.json();
            const raw = Array.isArray(data) ? data : (data.ordenes ?? []);
            raw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrdenes(raw);
        } catch (e) {
            toast.error(e.message || 'No se pudieron cargar las ventas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdenes();
    }, [token]);

    const filtered = ordenes.filter(o => {
        if (filtroEstado && o.estadoOrden !== filtroEstado) return false;
        if (filtroPago && getPagoEstado(o.estadoPago) !== filtroPago) return false;
        if (filtroTipo && o.tipoEntrega !== filtroTipo) return false;
        return true;
    });

    const totalVentas = filtered.reduce((acc, o) => cuentaComoIngreso(o) ? acc + getOrderTotal(o) : acc, 0);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <>
            <style>{pageStyles}</style>
            <div className="vt-page">
                {/* Header */}
                <div className="vt-header">
                    <div>
                        <h1 className="vt-title">Reporte de Ventas</h1>
                        <p className="vt-sub">Historial de pedidos y facturación</p>
                    </div>
                    <button className="vt-refresh-btn" type="button" onClick={() => window.location.reload()}>
                        Refrescar
                    </button>
                </div>

                {/* RAG Grid */}
                {!loading && (
                    <div className="vt-rag-grid">

                        {/* Cuadro superior izquierdo — Ingresos */}
                        <div className="vt-rag-ingresos">
                            <div>
                                <p className="vt-rag-ingresos-label">💰 Ingresos totales</p>
                                <p className="vt-rag-ingresos-valor">
                                    ${totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="vt-rag-ingresos-sub">Solo pedidos con pago realizado</p>
                            </div>
                            <div className="vt-rag-ingresos-stats">
                                <div className="vt-rag-stat">
                                    <span className="vt-rag-stat-val">{filtered.length}</span>
                                    <span className="vt-rag-stat-lbl">Total pedidos</span>
                                </div>
                                <div className="vt-rag-stat">
                                    <span className="vt-rag-stat-val">
                                        {filtered.filter(o => getPagoEstado(o.estadoPago) === 'realizado').length}
                                    </span>
                                    <span className="vt-rag-stat-lbl">Pagos realizados</span>
                                </div>
                                <div className="vt-rag-stat">
                                    <span className="vt-rag-stat-val">
                                        {filtered.filter(o => getPagoEstado(o.estadoPago) === 'pendiente').length}
                                    </span>
                                    <span className="vt-rag-stat-lbl">Pagos pendientes</span>
                                </div>
                            </div>
                        </div>

                        {/* Cuadro superior derecho — Gráfico pastel */}
                        <div className="vt-rag-chart">
                            <p className="vt-rag-chart-title">📊 Ventas por tipo de entrega</p>
                            {filtered.length > 0 ? (
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'A domicilio', value: filtered.filter(o => o.tipoEntrega === 'domicilio').length, tipo: 'domicilio' },
                                                { name: 'Retiro', value: filtered.filter(o => o.tipoEntrega === 'retiro').length, tipo: 'retiro' },
                                                { name: 'Venta local', value: filtered.filter(o => o.tipoEntrega === 'venta_local').length, tipo: 'venta_local' },
                                            ].filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'A domicilio', value: filtered.filter(o => o.tipoEntrega === 'domicilio').length, tipo: 'domicilio' },
                                                { name: 'Retiro', value: filtered.filter(o => o.tipoEntrega === 'retiro').length, tipo: 'retiro' },
                                                { name: 'Venta local', value: filtered.filter(o => o.tipoEntrega === 'venta_local').length, tipo: 'venta_local' },
                                            ].filter(d => d.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORES_PIE[entry.tipo]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value} pedidos`, name]}
                                            contentStyle={{ borderRadius:'0.5rem', border:'1px solid #e5e7eb', fontSize:'0.78rem' }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(value) => <span style={{ fontSize:'0.75rem', color:'#374151' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:'0.85rem' }}>
                                    Sin datos para mostrar
                                </div>
                            )}
                        </div>

                        {/* Fila inferior — Contadores de estado */}
                        <div className="vt-rag-estados" style={{ position: 'relative', paddingTop: '1.5rem' }}>
                            <p style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                📦 Estado de los pedidos
                            </p>
                            {[
                                {
                                    label: 'Pendientes',
                                    value: filtered.filter(o => o.estadoOrden === 'pendiente').length,
                                    icon: '⏳',
                                    colorClass: 'icon-pendiente'
                                },
                                {
                                    label: 'En curso',
                                    value: filtered.filter(o => ['procesando','pagado','listo'].includes(o.estadoOrden)).length,
                                    icon: '⚙️',
                                    colorClass: 'icon-en-curso'
                                },
                                {
                                    label: 'Entregados',
                                    value: filtered.filter(o => o.estadoOrden === 'entregado').length,
                                    icon: '✅',
                                    colorClass: 'icon-entregado'
                                },
                                {
                                    label: 'Cancelados',
                                    value: filtered.filter(o => o.estadoOrden === 'cancelado').length,
                                    icon: '❌',
                                    colorClass: 'icon-cancelado'
                                },
                            ].map(({ label, value, icon, colorClass }) => (
                                <div key={label} className="vt-estado-card">
                                    <div className={`vt-estado-icon ${colorClass}`}>{icon}</div>
                                    <div className="vt-estado-info">
                                        <p className="vt-estado-val">{value}</p>
                                        <p className="vt-estado-lbl">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtros — se mantienen */}
                <div className="vt-filters">
                    <select className="vt-select" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}>
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="listo">Listo</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    <select className="vt-select" value={filtroPago} onChange={e => { setFiltroPago(e.target.value); setPage(1); }}>
                        <option value="">Todos los pagos</option>
                        <option value="pendiente">Pago pendiente</option>
                        <option value="realizado">Pago realizado</option>
                        <option value="fallido">Pago fallido</option>
                    </select>
                    <select className="vt-select" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPage(1); }}>
                        <option value="">Todos los tipos</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="retiro">Retiro</option>
                        <option value="venta_local">Venta local</option>
                    </select>
                    {(filtroEstado || filtroPago || filtroTipo) && (
                        <button className="vt-page-btn" onClick={() => { setFiltroEstado(''); setFiltroPago(''); setFiltroTipo(''); setPage(1); }}>
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Tabla — se mantiene igual que antes */}
                {loading ? (
                    <div className="vt-spinner">Cargando ventas...</div>
                ) : filtered.length === 0 ? (
                    <div className="vt-empty"><p style={{ fontWeight:700 }}>No hay pedidos con ese filtro</p></div>
                ) : (
                    <div className="vt-table-wrap">
                        <table className="vt-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ID Pedido</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Tipo entrega</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((orden, i) => {
                                    const total = getOrderTotal(orden);
                                    const pagoEstado = getPagoEstado(orden.estadoPago);
                                    const fecha = new Date(orden.createdAt).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
                                    const clienteNombre = orden.cliente
                                        ? `${orden.cliente.nombre ?? ''} ${orden.cliente.apellido ?? ''}`.trim()
                                        : 'Sin cliente';
                                    return (
                                        <tr key={orden._id}>
                                            <td style={{ color:'#9ca3af', fontWeight:600 }}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                            <td style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#6b7280' }}>{orden._id?.slice(-8).toUpperCase()}</td>
                                            <td style={{ fontWeight:600 }}>{clienteNombre}</td>
                                            <td>{fecha}</td>
                                            <td><span style={{ fontSize:'0.75rem', color:'#6b7280', fontWeight:600 }}>{orden.tipoEntrega || 'N/D'}</span></td>
                                            <td>
                                                <span className={`vt-badge ${orden.estadoOrden}`}>{orden.estadoOrden}</span>
                                                {orden.solicitudCancelacion?.solicitada && !orden.solicitudCancelacion?.resuelta && (
                                                  <span style={{
                                                    display: 'block',
                                                    fontSize: '0.65rem',
                                                    color: '#92400e',
                                                    background: '#fef3c7',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '999px',
                                                    marginTop: '0.25rem',
                                                    fontWeight: 700
                                                  }}>
                                                    ⚠️ Cancelación solicitada
                                                  </span>
                                                )}
                                            </td>
                                            <td><span className={`vt-badge ${pagoEstado}`}>{pagoEstado}</span></td>
                                            <td style={{ fontWeight:800, color:'#e8760a' }}>${Number(total).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="vt-pagination">
                                <button className="vt-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Anterior</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i + 1} className={`vt-page-btn${page === i + 1 ? ' current' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                                ))}
                                <button className="vt-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Siguiente</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Ventas;
