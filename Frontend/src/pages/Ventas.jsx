import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';

const pageStyles = `
    :root { --orange-main:#e8760a; --orange-dark:#c4620a; --orange-light:#fde8ce; }
    .vt-page { max-width: 1100px; margin: 0 auto; }
    .vt-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
    .vt-title { font-size:1.5rem; font-weight:900; color:#111827; margin:0 0 0.2rem; display:flex; align-items:center; gap:0.55rem; }
    .vt-title::before { content:''; display:inline-block; width:4px; height:1.4rem; background:var(--orange-main); border-radius:2px; flex-shrink:0; }
    .vt-sub { font-size:0.85rem; color:#6b7280; margin:0; }
    .vt-metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .vt-metric { background:#fff; border:1px solid #e5e7eb; border-radius:1rem; padding:1.25rem 1.5rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
    .vt-metric-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#9ca3af; margin:0 0 0.35rem; }
    .vt-metric-value { font-size:1.75rem; font-weight:900; color:#111827; margin:0; }
    .vt-metric-value.orange { color:var(--orange-main); }
    .vt-filters { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; margin-bottom:1.25rem; }
    .vt-refresh-btn { padding:0.55rem 0.9rem; border-radius:0.625rem; border:none; background:var(--orange-main); color:#fff; font-size:0.85rem; font-weight:800; cursor:pointer; }
    .vt-refresh-btn:hover { background:var(--orange-dark); }
    .vt-select { padding:0.55rem 0.9rem; border:1.5px solid #e5e7eb; border-radius:0.625rem; font-size:0.875rem; color:#374151; background:#fff; outline:none; cursor:pointer; }
    .vt-select:focus { border-color:var(--orange-main); }
    .vt-table-wrap { background:#fff; border:1px solid #e5e7eb; border-radius:1rem; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,0.06); }
    .vt-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
    .vt-table thead tr { background:#111827; }
    .vt-table thead th { padding:0.875rem 1.25rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#9ca3af; }
    .vt-table tbody tr { border-bottom:1px solid #f3f4f6; transition:background 0.15s; }
    .vt-table tbody tr:hover { background:#fffbeb; }
    .vt-table tbody tr:last-child { border-bottom:none; }
    .vt-table td { padding:0.875rem 1.25rem; color:#374151; vertical-align:middle; }
    .vt-badge { display:inline-flex; align-items:center; padding:0.25rem 0.65rem; border-radius:999px; font-size:0.7rem; font-weight:700; text-transform:capitalize; }
    .vt-badge.pendiente  { background:#fef3c7; color:#92400e; }
    .vt-badge.procesando { background:#dbeafe; color:#1e40af; }
    .vt-badge.listo      { background:#e0f2fe; color:#075985; }
    .vt-badge.entregado  { background:#d1fae5; color:#065f46; }
    .vt-badge.cancelado  { background:#fee2e2; color:#991b1b; }
    .vt-badge.realizado  { background:#d1fae5; color:#065f46; }
    .vt-badge.fallido    { background:#fee2e2; color:#991b1b; }
    .vt-empty { text-align:center; padding:3rem 1rem; color:#9ca3af; }
    .vt-spinner { text-align:center; padding:3rem; color:#9ca3af; }
    .vt-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.875rem; border-top:1px solid #f3f4f6; flex-wrap:wrap; }
    .vt-page-btn { padding:0.45rem 0.9rem; border-radius:0.5rem; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .vt-page-btn:hover:not(:disabled) { background:var(--orange-light); border-color:var(--orange-main); color:var(--orange-dark); }
    .vt-page-btn.current { background:var(--orange-main); border-color:var(--orange-main); color:#fff; }
    .vt-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
    @media (max-width: 900px) {
        .vt-page { max-width: 100%; padding: 0 0.75rem; }
        .vt-table-wrap { overflow-x: auto; border-radius: 0.85rem; }
        .vt-table { min-width: 820px; }
        .vt-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
        .vt-metric { padding: 1rem; border-radius: 0.85rem; }
    }
    @media (max-width: 560px) {
        .vt-header { align-items: stretch; }
        .vt-title { font-size: 1.25rem; }
        .vt-refresh-btn, .vt-select, .vt-page-btn { width: 100%; }
        .vt-filters { flex-direction: column; align-items: stretch; }
        .vt-metrics { grid-template-columns: 1fr; }
        .vt-metric-value { font-size: 1.35rem; }
        .vt-pagination { align-items: stretch; }
    }
`;

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

    useEffect(() => {
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

    const metricasPorTipo = {
        domicilio: filtered.filter(o => o.tipoEntrega === 'domicilio').length,
        retiro: filtered.filter(o => o.tipoEntrega === 'retiro').length,
        establecimiento: filtered.filter(o => o.tipoEntrega === 'establecimiento').length,
        venta_local: filtered.filter(o => o.tipoEntrega === 'venta_local').length,
    };

    return (
        <>
            <style>{pageStyles}</style>
            <div className="vt-page">
                <div className="vt-header">
                    <div>
                        <h1 className="vt-title">Reporte de Ventas</h1>
                        <p className="vt-sub">Historial de pedidos y facturacion</p>
                    </div>
                    <button className="vt-refresh-btn" type="button" onClick={() => window.location.reload()}>
                        Refrescar ventas
                    </button>
                </div>

                <div className="vt-metrics">
                    <div className="vt-metric"><p className="vt-metric-label">Total pedidos</p><p className="vt-metric-value">{filtered.length}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Ingresos pagados</p><p className="vt-metric-value orange">${totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Entregados</p><p className="vt-metric-value">{filtered.filter(o => o.estadoOrden === 'entregado').length}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Pendientes / En curso</p><p className="vt-metric-value">{filtered.filter(o => ['pendiente','procesando','listo'].includes(o.estadoOrden)).length}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Domicilio</p><p className="vt-metric-value">{metricasPorTipo.domicilio}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Retiro</p><p className="vt-metric-value">{metricasPorTipo.retiro}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Establecimiento</p><p className="vt-metric-value">{metricasPorTipo.establecimiento}</p></div>
                    <div className="vt-metric"><p className="vt-metric-label">Venta local</p><p className="vt-metric-value">{metricasPorTipo.venta_local}</p></div>
                </div>

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
                        <option value="establecimiento">Establecimiento</option>
                        <option value="venta_local">Venta local</option>
                    </select>
                    {(filtroEstado || filtroPago || filtroTipo) && (
                        <button className="vt-page-btn" onClick={() => { setFiltroEstado(''); setFiltroPago(''); setFiltroTipo(''); setPage(1); }}>
                            Limpiar filtros
                        </button>
                    )}
                </div>

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
                                    <th>Dirección</th>
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
                                    const direccionCliente = orden.datosFacturacion?.direccion || orden.direccionEnvio?.direccion || 'Sin dirección';
                                    return (
                                        <tr key={orden._id}>
                                            <td style={{ color:'#9ca3af', fontWeight:600 }}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                            <td style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#6b7280' }}>{orden._id?.slice(-8).toUpperCase()}</td>
                                            <td style={{ fontWeight:600 }}>{clienteNombre || 'Sin cliente'}</td>
                                            <td style={{ maxWidth:220, color:'#6b7280', fontSize:'0.8rem' }}>{direccionCliente}</td>
                                            <td>{fecha}</td>
                                            <td><span style={{ fontSize:'0.75rem', color:'#6b7280', fontWeight:600 }}>{orden.tipoEntrega || 'N/D'}</span></td>
                                            <td><span className={`vt-badge ${orden.estadoOrden}`}>{orden.estadoOrden}</span></td>
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
