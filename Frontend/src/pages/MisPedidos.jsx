import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import storeProfile from "../context/storeProfile";
import storeAuth from "../context/storeAuth";

const pageStyles = `
    :root { --orange-main:#e8760a; --orange-dark:#c4620a; --orange-light:#fde8ce; }
    .mp-container { max-width: 900px; margin: 0 auto; }
    .mp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.75rem; }
    .mp-title { font-size:1.5rem; font-weight:800; color:#111827; margin:0; }
    .mp-subtitle { font-size:0.875rem; color:#6b7280; margin:0.25rem 0 0; }
    .mp-empty { text-align:center; padding:3rem 1rem; color:#9ca3af; background:#fff; border-radius:1rem; border:2px dashed #e5e7eb; }
    .mp-empty-icon { font-size:3rem; margin-bottom:0.75rem; }
    .mp-card { background:#fff; border:1px solid #e5e7eb; border-radius:1rem; padding:1.25rem 1.5rem; margin-bottom:0.875rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); transition:box-shadow 0.15s; }
    .mp-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .mp-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
    .mp-order-id { font-size:0.72rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.07em; margin:0; }
    .mp-order-fecha { font-size:0.75rem; color:#9ca3af; margin:0.2rem 0 0; }
    .mp-badges { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; }
    .mp-badge { display:inline-flex; align-items:center; gap:0.3rem; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.72rem; font-weight:700; text-transform:capitalize; white-space:nowrap; }
    .mp-badge.pendiente  { background:#fef3c7; color:#92400e; }
    .mp-badge.procesando { background:#dbeafe; color:#1e40af; }
    .mp-badge.enviado    { background:#e0f2fe; color:#075985; }
    .mp-badge.entregado  { background:#d1fae5; color:#065f46; }
    .mp-badge.cancelado  { background:#fee2e2; color:#991b1b; }
    .mp-badge.pagado     { background:#d1fae5; color:#065f46; }
    .mp-badge.pago-pendiente  { background:#fef3c7; color:#92400e; }
    .mp-badge.pago-completado { background:#d1fae5; color:#065f46; }
    .mp-badge.pago-fallido    { background:#fee2e2; color:#991b1b; }
    .mp-divider { height:1px; background:#f3f4f6; margin:0.875rem 0; }
    .mp-card-body { display:flex; flex-wrap:wrap; gap:1rem; }
    .mp-info { flex:1; min-width:140px; }
    .mp-info-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#9ca3af; margin:0 0 0.2rem; }
    .mp-info-value { font-size:0.875rem; font-weight:600; color:#111827; margin:0; }
    .mp-items-list { margin-top:0.75rem; }
    .mp-item-row { display:flex; align-items:center; justify-content:space-between; padding:0.35rem 0; border-bottom:1px solid #f9fafb; font-size:0.82rem; }
    .mp-item-row:last-child { border-bottom:none; }
    .mp-item-name { color:#374151; font-weight:600; }
    .mp-item-qty  { color:#9ca3af; font-size:0.75rem; margin-left:0.3rem; }
    .mp-item-price { color:var(--orange-main); font-weight:700; }
    .mp-total-row { display:flex; justify-content:flex-end; margin-top:0.75rem; font-size:0.95rem; font-weight:800; color:#111827; gap:0.5rem; }
    .mp-total-label { color:#6b7280; font-weight:600; }
    .mp-spinner { text-align:center; padding:3rem; color:#9ca3af; }
    .mp-progress { display:flex; align-items:center; gap:0; margin:0.875rem 0 0; overflow-x:auto; padding-bottom:0.25rem; }
    .mp-step { display:flex; flex-direction:column; align-items:center; flex:1; min-width:70px; }
    .mp-step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800; border:2px solid #e5e7eb; background:#fff; color:#d1d5db; transition:all 0.2s; flex-shrink:0; }
    .mp-step-dot.active { background:var(--orange-main); border-color:var(--orange-main); color:#fff; box-shadow:0 0 0 4px rgba(232,118,10,0.18); }
    .mp-step-dot.done { background:#10b981; border-color:#10b981; color:#fff; }
    .mp-step-dot.canceled { background:#ef4444; border-color:#ef4444; color:#fff; }
    .mp-step-label { font-size:0.62rem; color:#9ca3af; font-weight:600; margin-top:0.3rem; text-align:center; text-transform:capitalize; white-space:nowrap; }
    .mp-step-label.active { color:var(--orange-main); }
    .mp-step-label.done { color:#10b981; }
    .mp-step-connector { flex:1; height:2px; background:#e5e7eb; margin-bottom:1.25rem; transition:background 0.2s; min-width:12px; }
    .mp-step-connector.done { background:#10b981; }
    .mp-section-title { font-size:1rem; font-weight:700; color:#374151; margin:0 0 0.75rem; }
`;

const ORDER_STEPS = ['pendiente', 'procesando', 'enviado', 'entregado'];

const estadoIcono = { pendiente:'⏳', procesando:'⚙️', enviado:'🚚', entregado:'✅', cancelado:'❌', pagado:'💰' };

const ProgressBar = ({ estadoOrden }) => {
    if (estadoOrden === 'cancelado') {
        return (
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.75rem' }}>
                <span style={{ fontSize:'1.3rem' }}>❌</span>
                <span style={{ fontSize:'0.82rem', color:'#ef4444', fontWeight:700 }}>Pedido cancelado</span>
            </div>
        );
    }
    const currentIdx = ORDER_STEPS.indexOf(estadoOrden);
    return (
        <div className="mp-progress">
            {ORDER_STEPS.map((step, i) => {
                const isDone   = i < currentIdx;
                const isActive = i === currentIdx;
                return (
                    <div key={step} style={{ display:'contents' }}>
                        <div className="mp-step">
                            <div className={`mp-step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                                {isDone ? '✓' : (i + 1)}
                            </div>
                            <span className={`mp-step-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                                {step}
                            </span>
                        </div>
                        {i < ORDER_STEPS.length - 1 && (
                            <div className={`mp-step-connector${isDone ? ' done' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const OrdenCard = ({ orden, index }) => {
    const [open, setOpen] = useState(false);
    const fecha = new Date(orden.createdAt).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
    const total = orden.total ?? orden.items?.reduce((s, it) => s + (it.precio * it.cantidad), 0) ?? 0;

    const pagoClass = {
        pendiente: 'pago-pendiente',
        completado: 'pago-completado',
        fallido: 'pago-fallido',
    }[orden.estadoPago] ?? 'pago-pendiente';

    return (
        <div className="mp-card">
            <div className="mp-card-top">
                <div>
                    <p className="mp-order-id">Pedido #{String(index + 1).padStart(3,'0')} · {orden._id?.slice(-8).toUpperCase()}</p>
                    <p className="mp-order-fecha">📅 {fecha}</p>
                </div>
                <div className="mp-badges">
                    <span className={`mp-badge ${orden.estadoOrden}`}>
                        {estadoIcono[orden.estadoOrden]} {orden.estadoOrden}
                    </span>
                    <span className={`mp-badge ${pagoClass}`}>
                        💳 Pago {orden.estadoPago ?? 'pendiente'}
                    </span>
                </div>
            </div>

            <ProgressBar estadoOrden={orden.estadoOrden} />

            <div className="mp-divider" />

            <div className="mp-card-body">
                <div className="mp-info">
                    <p className="mp-info-label">Método de pago</p>
                    <p className="mp-info-value">{orden.metodoPago ?? '—'}</p>
                </div>
                <div className="mp-info">
                    <p className="mp-info-label">Total</p>
                    <p className="mp-info-value" style={{ color:'#e8760a' }}>${Number(total).toFixed(2)}</p>
                </div>
                {orden.cliente?.nombre && (
                    <div className="mp-info">
                        <p className="mp-info-label">Cliente</p>
                        <p className="mp-info-value">{orden.cliente.nombre} {orden.cliente.apellido ?? ''}</p>
                    </div>
                )}
            </div>

            {orden.items?.length > 0 && (
                <>
                    <button
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', color:'#6b7280', fontWeight:600, marginTop:'0.5rem', padding:0 }}
                        onClick={() => setOpen(o => !o)}
                    >
                        {open ? '▲ Ocultar productos' : `▼ Ver ${orden.items.length} producto(s)`}
                    </button>
                    {open && (
                        <div className="mp-items-list">
                            {orden.items.map((it, i) => (
                                <div key={i} className="mp-item-row">
                                    <span className="mp-item-name">
                                        {it.producto?.nombre ?? it.nombre ?? 'Producto'}
                                        <span className="mp-item-qty">x{it.cantidad}</span>
                                    </span>
                                    <span className="mp-item-price">${(it.precio * it.cantidad).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="mp-total-row">
                                <span className="mp-total-label">Total:</span>
                                <span>${Number(total).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const MisPedidos = () => {
    const { user } = storeProfile();
    const { token } = storeAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    const isVendedor = user?.rol === 'vendedor';
    const isCliente  = user?.rol === 'cliente';

    useEffect(() => {
        const fetchOrdenes = async () => {
            if (!token) return;
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/ordenes`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error al cargar pedidos");
                const data = await res.json();
                setOrdenes(Array.isArray(data) ? data : (data.ordenes ?? []));
            } catch (e) {
                toast.error(e.message || "No se pudieron cargar los pedidos.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrdenes();
    }, [token]);

    const titulo = isVendedor ? 'Pedidos en curso' : 'Mis pedidos';
    const subtitulo = isVendedor
        ? 'Visualiza el estado de todos los pedidos realizados en la tienda.'
        : 'Consulta el estado de tus pedidos realizados.';

    return (
        <>
            <style>{pageStyles}</style>
            <ToastContainer />
            <div className="mp-container">
                <div className="mp-header">
                    <div>
                        <h1 className="mp-title">📦 {titulo}</h1>
                        <p className="mp-subtitle">{subtitulo}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="mp-spinner">⏳ Cargando pedidos...</div>
                ) : ordenes.length === 0 ? (
                    <div className="mp-empty">
                        <div className="mp-empty-icon">📭</div>
                        <p style={{ fontWeight:700, color:'#374151' }}>No hay pedidos registrados</p>
                        <p style={{ fontSize:'0.82rem' }}>
                            {isCliente ? 'Cuando realices un pedido aparecerá aquí.' : 'Aún no hay pedidos registrados en la tienda.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mp-section-title">{ordenes.length} pedido{ordenes.length !== 1 ? 's' : ''}</p>
                        {ordenes.map((orden, i) => (
                            <OrdenCard key={orden._id} orden={orden} index={i} />
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default MisPedidos;
