/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import storeProfile from "../context/storeProfile";
import storeAuth from "../context/storeAuth";
import FacturaPDF from "../components/carrito/FacturaPDF.jsx";

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
    /* ── Paginación ── */
    .mp-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:1.25rem; flex-wrap:wrap; }
    .mp-page-btn { padding:0.45rem 0.9rem; border-radius:0.5rem; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-size:0.82rem; font-weight:700; cursor:pointer; transition:background 0.15s,border-color 0.15s,color 0.15s; }
    .mp-page-btn:hover:not(:disabled) { background:var(--orange-light); border-color:var(--orange-main); color:var(--orange-dark); }
    .mp-page-btn.current { background:var(--orange-main); border-color:var(--orange-main); color:#fff; }
    .mp-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .mp-page-info { font-size:0.8rem; color:#6b7280; font-weight:600; }
    .mp-progress { display:flex; align-items:center; gap:0; margin:0.875rem 0 0; overflow-x:auto; padding-bottom:0.25rem; }
    .mp-step { display:flex; flex-direction:column; align-items:center; flex:1; min-width:70px; }
    .mp-step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800; border:2px solid #e5e7eb; background:#fff; color:#d1d5db; transition:all 0.2s; flex-shrink:0; }
    .mp-step-dot.active { background:var(--orange-main); border-color:var(--orange-main); color:#fff; box-shadow:0 0 0 4px rgba(232,118,10,0.18); }
    .mp-step-dot.done { background:#10b981; border-color:#10b981; color:#fff; }
    .mp-step-dot.canceled { background:#ef4444; border-color:#ef4444; color:#fff; }
    .mp-step-dot.clickable { cursor:pointer; }
    .mp-step-dot.clickable:hover { transform:scale(1.18); box-shadow:0 0 0 6px rgba(232,118,10,0.22); border-color:var(--orange-main); color:var(--orange-main); }
    .mp-step-dot.updating { opacity:0.55; cursor:not-allowed; pointer-events:none; }
    .mp-step-label { font-size:0.62rem; color:#9ca3af; font-weight:600; margin-top:0.3rem; text-align:center; text-transform:capitalize; white-space:nowrap; }
    .mp-step-label.active { color:var(--orange-main); }
    .mp-step-label.done { color:#10b981; }
    .mp-step-label.clickable { color:var(--orange-main); }
    .mp-step-connector { flex:1; height:2px; background:#e5e7eb; margin-bottom:1.25rem; transition:background 0.2s; min-width:12px; }
    .mp-step-connector.done { background:#10b981; }
    .mp-section-title { font-size:1rem; font-weight:700; color:#374151; margin:0 0 0.75rem; }
    .mp-vendor-hint { font-size:0.68rem; color:#9ca3af; margin-top:0.35rem; font-style:italic; }
    .mp-terminado { display:flex; align-items:center; gap:0.6rem; margin-top:0.75rem; }
    .mp-terminado-radio { width:16px; height:16px; border-radius:50%; border:2px solid #10b981; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .mp-terminado-radio::after { content:''; width:8px; height:8px; border-radius:50%; background:#10b981; }
    .mp-terminado-label { font-size:0.8rem; font-weight:700; color:#065f46; background:#d1fae5; padding:0.25rem 0.75rem; border-radius:999px; border:1.5px solid #10b981; }
    .mp-factura-row { display:flex; justify-content:flex-end; margin-top:0.875rem; padding-top:0.75rem; border-top:1px solid #f3f4f6; }
    .mp-actions-row { display:flex; justify-content:flex-end; gap:0.6rem; margin-top:0.875rem; padding-top:0.75rem; border-top:1px solid #f3f4f6; flex-wrap:wrap; }
    .mp-pay-btn { border:none; border-radius:0.6rem; background:#16a34a; color:#fff; font-size:0.8rem; font-weight:800; padding:0.55rem 0.95rem; cursor:pointer; }
    .mp-pay-btn:hover:not(:disabled) { background:#15803d; }
    .mp-pay-btn:disabled { opacity:0.55; cursor:not-allowed; }
    .mp-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
    .mp-modal { background:#fff; width:min(420px, 96vw); border-radius:1rem; padding:1.5rem; box-shadow:0 20px 60px rgba(0,0,0,0.22); }
    .mp-modal-title { font-size:1.05rem; font-weight:900; color:#111827; margin:0 0 0.45rem; }
    .mp-modal-text { font-size:0.875rem; color:#6b7280; line-height:1.5; margin:0 0 1.25rem; }
    .mp-modal-actions { display:flex; justify-content:flex-end; gap:0.75rem; }
    .mp-modal-cancel, .mp-modal-confirm { border:none; border-radius:0.6rem; padding:0.6rem 1rem; font-size:0.85rem; font-weight:800; cursor:pointer; }
    .mp-modal-cancel { background:#f3f4f6; color:#374151; }
    .mp-modal-confirm { background:#16a34a; color:#fff; }
`;

const STEPS_DOMICILIO      = ['Pedido recibido', 'Procesando', 'Motorizado en camino a su hogar', 'Entregado'];
const STEPS_ESTABLECIMIENTO = ['Pedido recibido', 'Procesando pedido', 'Pedido listo', 'Pedido en recepción'];
const STEPS_VENTA_LOCAL    = ['Listo'];

// Maps display label → backend estadoOrden value
const DOMICILIO_MAP      = { 'Pedido recibido': 'pagado', 'Procesando': 'procesando', 'Motorizado en camino a su hogar': 'listo', 'Entregado': 'entregado' };
const ESTABLECIMIENTO_MAP = { 'Pedido recibido': 'pagado', 'Procesando pedido': 'procesando', 'Pedido listo': 'listo', 'Pedido en recepción': 'entregado' };
const VENTA_LOCAL_MAP     = { 'Listo': 'listo' };

const getStepConfig = (tipoEntrega) => {
    if (tipoEntrega === 'domicilio')       return { steps: STEPS_DOMICILIO,       map: DOMICILIO_MAP };
    if (tipoEntrega === 'venta_local')     return { steps: STEPS_VENTA_LOCAL,     map: VENTA_LOCAL_MAP };
    return { steps: STEPS_ESTABLECIMIENTO, map: ESTABLECIMIENTO_MAP };
};
const ITEMS_PER_PAGE = 3;
const IVA_RATE = 0.15;

const numeroValido = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const numeroPositivo = (value) => {
    const n = numeroValido(value);
    return n > 0 ? n : 0;
};

const calcularTotalesOrden = (orden = {}) => {
    const items = orden.productoPedido ?? orden.items ?? [];
    const subtotalItems = items.reduce((s, it) => {
        const subtotalItem = numeroPositivo(it.subtotal);
        if (subtotalItem > 0) return s + subtotalItem;
        const precio = numeroValido(it.precio ?? it.precioUnitario ?? it.producto?.precioPorMetro ?? it.producto?.precioPorRollo ?? it.producto?.precio);
        const cantidad = numeroValido(it.cantidad || 1);
        return s + (precio * cantidad);
    }, 0);

    const subtotal = numeroPositivo(orden.subtotal) || subtotalItems;
    const descuentoTotal = numeroValido(orden.descuentoTotal);
    const iva = numeroPositivo(orden.iva) || Number((subtotal * IVA_RATE).toFixed(2));
    const envio = numeroValido(orden.envio);
    const comisionPago = numeroValido(orden.comisionPago);
    const totalGuardado = numeroPositivo(orden.totalFinal) || numeroPositivo(orden.precioTotal) || numeroPositivo(orden.total);
    const totalFinal = totalGuardado || Number((subtotal + iva + envio + comisionPago).toFixed(2));

    return { subtotal, descuentoTotal, iva, envio, comisionPago, totalFinal };
};

const estadoIcono = { pendiente:'⏳', pagado:'💰', procesando:'⚙️', listo:'🚚', enviado:'🚚', entregado:'✅', cancelado:'❌' };

const ProgressBar = ({ estadoOrden, estadoPago, tipoEntrega, isVendedor, ordenId, token, onStatusUpdate }) => {
    const { steps: ORDER_STEPS, map: STEP_MAP } = getStepConfig(tipoEntrega);
    const [updating, setUpdating] = useState(false);

    if (estadoOrden === 'cancelado') {
        return (
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.75rem' }}>
                <span style={{ fontSize:'1.3rem' }}>❌</span>
                <span style={{ fontSize:'0.82rem', color:'#ef4444', fontWeight:700 }}>Pedido cancelado</span>
            </div>
        );
    }

    // venta_local: render single dot centered
    if (tipoEntrega === 'venta_local') {
        const isDone = estadoOrden === 'listo' || estadoOrden === 'entregado';
        return (
            <div style={{ display:'flex', justifyContent:'center', margin:'0.875rem 0 0' }}>
                <div className="mp-step">
                    <div className={`mp-step-dot${isDone ? ' done' : ' active'}`}>
                        {isDone ? '✓' : '🏪'}
                    </div>
                    <span className={`mp-step-label${isDone ? ' done' : ' active'}`}>Listo</span>
                </div>
            </div>
        );
    }

    // Map backend estadoOrden → step index
    const currentIdx = ORDER_STEPS.findIndex(label => STEP_MAP[label] === estadoOrden);
    const effectiveIdx = currentIdx === -1 ? -1 : currentIdx;

    const handleStepClick = async (label, stepIdx) => {
        if (stepIdx !== effectiveIdx + 1) return;
        if (!isVendedor || updating) return;
        const backendEstado = STEP_MAP[label];
        if (!backendEstado) return;

        setUpdating(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/ordenes/${ordenId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ estadoOrden: backendEstado }),
                }
            );
            if (!res.ok) throw new Error('No se pudo actualizar el estado.');
            const data = await res.json();
            toast.success(`Pedido marcado como "${label}"`);
            onStatusUpdate(data.orden ?? { estadoOrden: backendEstado });
        } catch {
            toast.error('Error al actualizar el estado del pedido.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <div className="mp-progress">
                {ORDER_STEPS.map((step, i) => {
                    const isDone   = i < effectiveIdx;
                    const isActive = i === effectiveIdx;
                    // Solo el paso siguiente al actual es clickeable para el vendedor
                    const pagoRealizado = estadoPago === 'completado';
                    const isClickable = isVendedor && pagoRealizado && !updating && i === effectiveIdx + 1;
                    const isUpdating  = updating && i === effectiveIdx + 1;

                    const dotClass = [
                        'mp-step-dot',
                        isDone   ? 'done'   : '',
                        isActive ? 'active' : '',
                        isClickable ? 'clickable' : '',
                        isUpdating  ? 'updating'  : '',
                    ].filter(Boolean).join(' ');

                    const labelClass = [
                        'mp-step-label',
                        isDone   ? 'done'   : '',
                        isActive ? 'active' : '',
                        isClickable ? 'clickable' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <div key={step} style={{ display:'contents' }}>
                            <div className="mp-step">
                                <div
                                    className={dotClass}
                                    onClick={isClickable ? () => handleStepClick(step, i) : undefined}
                                    title={isClickable ? `Marcar como "${step}"` : undefined}
                                >
                                    {isUpdating ? '…' : isDone ? '✓' : (i + 1)}
                                </div>
                                <span className={labelClass}>{step}</span>
                            </div>
                            {i < ORDER_STEPS.length - 1 && (
                                <div className={`mp-step-connector${isDone ? ' done' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
            {isVendedor && estadoOrden === 'entregado' && (
                <div className="mp-terminado">
                    <div className="mp-terminado-radio" />
                    <span className="mp-terminado-label">✓ Terminado — No se puede modificar</span>
                </div>
            )}
            {isVendedor && estadoPago !== 'completado' && estadoOrden !== 'cancelado' && (
                <p className="mp-vendor-hint">
                    Primero confirma el pago para continuar con la gestión del pedido.
                </p>
            )}
            {isVendedor && estadoPago === 'completado' && estadoOrden !== 'entregado' && estadoOrden !== 'cancelado' && (
                <p className="mp-vendor-hint">
                    💡 Haz clic en el siguiente círculo para avanzar el estado del pedido.
                </p>
            )}
        </>
    );
};

const OrdenCard = ({ orden: ordenInicial, index, isVendedor, token }) => {
    const [orden, setOrden] = useState(ordenInicial);
    const [open, setOpen] = useState(false);
    const [confirmPago, setConfirmPago] = useState(false);
    const [actualizandoPago, setActualizandoPago] = useState(false);
    const fecha = new Date(orden.createdAt).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
    const itemsOrden = orden.productoPedido ?? orden.items ?? [];
    const totalesOrden = calcularTotalesOrden(orden);
    const total = totalesOrden.totalFinal;
    const ordenFactura = { ...orden, ...totalesOrden, precioTotal: total };

    const pagoClass = {
        pendiente: 'pago-pendiente',
        completado: 'pago-completado',
        fallido: 'pago-fallido',
    }[orden.estadoPago] ?? 'pago-pendiente';

    const handleStatusUpdate = (ordenActualizada) => {
        setOrden(prev => ({ ...prev, ...ordenActualizada }));
    };

    const confirmarPago = async () => {
        setActualizandoPago(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ordenes/${orden._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ estadoPago: 'completado' }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.msg || 'No se pudo confirmar el pago.');
            setOrden(prev => ({ ...prev, ...(data.orden ?? {}), estadoPago: 'completado' }));
            toast.success('Pago marcado como realizado.');
            setConfirmPago(false);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActualizandoPago(false);
        }
    };

    const vendedorNombre = orden.vendedor
        ? `${orden.vendedor.nombrePropietario || orden.vendedor.nombre || ''} ${orden.vendedor.apellido || ''}`.trim()
        : '';

    return (
        <div className="mp-card">
            {confirmPago && (
                <div className="mp-modal-overlay" onClick={() => setConfirmPago(false)}>
                    <div className="mp-modal" onClick={e => e.stopPropagation()}>
                        <p className="mp-modal-title">Confirmar pago</p>
                        <p className="mp-modal-text">
                            Esta acción marcará el pedido como pago realizado y permitirá continuar la gestión del pedido.
                        </p>
                        <div className="mp-modal-actions">
                            <button className="mp-modal-cancel" type="button" onClick={() => setConfirmPago(false)}>Cancelar</button>
                            <button className="mp-modal-confirm" type="button" onClick={confirmarPago} disabled={actualizandoPago}>
                                {actualizandoPago ? 'Confirmando...' : 'Pago realizado'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mp-card-top">
                <div>
                    <p className="mp-order-id">Pedido #{String(index + 1).padStart(3,'0')} · {orden._id?.slice(-8).toUpperCase()}</p>
                    <p className="mp-order-fecha">📅 {fecha}</p>
                </div>
                <div className="mp-badges">
                    {orden.origenPedido === 'tienda' && (
                        <span className="mp-badge pagado">Pedido en tienda</span>
                    )}
                    <span className={`mp-badge ${orden.estadoOrden}`}>
                        {estadoIcono[orden.estadoOrden]} {orden.estadoOrden}
                    </span>
                    <span className={`mp-badge ${pagoClass}`}>
                        💳 Pago {orden.estadoPago === 'completado' ? 'realizado' : (orden.estadoPago ?? 'pendiente')}
                    </span>
                </div>
            </div>

            <ProgressBar
                estadoOrden={orden.estadoOrden}
                estadoPago={orden.estadoPago}
                isVendedor={isVendedor}
                tipoEntrega={orden.tipoEntrega}
                ordenId={orden._id}
                token={token}
                onStatusUpdate={handleStatusUpdate}
            />

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
                <div className="mp-info">
                    <p className="mp-info-label">Vendedor asignado</p>
                    <p className="mp-info-value">{vendedorNombre || 'Pendiente'}</p>
                </div>
            </div>

            {itemsOrden.length > 0 && (
                <>
                    <button
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', color:'#6b7280', fontWeight:600, marginTop:'0.5rem', padding:0 }}
                        onClick={() => setOpen(o => !o)}
                    >
                        {open ? '▲ Ocultar productos' : `▼ Ver ${itemsOrden.length} producto(s)`}
                    </button>
                    {open && (
                        <div className="mp-items-list">
                            {itemsOrden.map((it, i) => (
                                <div key={i} className="mp-item-row">
                                    <span className="mp-item-name">
                                        {it.producto?.nombre ?? it.nombre ?? 'Producto'}
                                        <span className="mp-item-qty">x{it.cantidad}</span>
                                    </span>
                                    <span className="mp-item-price">${Number(it.subtotal ?? ((it.precio ?? it.producto?.precio ?? 0) * (it.cantidad || 1))).toFixed(2)}</span>
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
            <div className="mp-actions-row">
                {isVendedor && orden.estadoPago !== 'completado' && (
                    <button className="mp-pay-btn" type="button" onClick={() => setConfirmPago(true)}>
                        Marcar pago realizado
                    </button>
                )}
                <FacturaPDF
                    orden={ordenFactura}
                    facturacion={
                        orden.datosFacturacion
                        ?? (orden.cliente ? {
                            nombre: orden.cliente.nombre,
                            apellido: orden.cliente.apellido ?? '',
                            correo: orden.cliente.email ?? '',
                            direccion: orden.direccionEnvio?.direccion ?? '',
                        } : undefined)
                    }
                    label="Factura PDF"
                />
            </div>
        </div>
    );
};

const MisPedidos = () => {
    const { user } = storeProfile();
    const { token } = storeAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

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
                const raw = Array.isArray(data) ? data : (data.ordenes ?? []);
                // Más reciente primero
                raw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrdenes(raw);
            } catch (e) {
                toast.error(e.message || "No se pudieron cargar los pedidos.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrdenes();
    }, [token]);

    const totalPages = Math.ceil(ordenes.length / ITEMS_PER_PAGE);
    const paginatedOrdenes = ordenes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const titulo = isVendedor ? 'Gestion de pedidos' : 'Mis pedidos';
    const subtitulo = isVendedor
        ? 'Gestiona manualmente el estado de cada pedido: haz clic en el siguiente paso para avanzarlo.'
        : 'Consulta el estado de tus pedidos realizados.';

    return (
        <>
            <style>{pageStyles}</style>
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
                        {paginatedOrdenes.map((orden, i) => (
                            <OrdenCard
                                key={orden._id}
                                orden={orden}
                                index={ordenes.length - 1 - ((page - 1) * ITEMS_PER_PAGE + i)}
                                isVendedor={isVendedor}
                                token={token}
                            />
                        ))}
                        {totalPages > 1 && (
                            <div className="mp-pagination">
                                <button
                                    className="mp-page-btn"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page === 1}
                                >← Anterior</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`mp-page-btn${page === i + 1 ? ' current' : ''}`}
                                        onClick={() => setPage(i + 1)}
                                    >{i + 1}</button>
                                ))}
                                <button
                                    className="mp-page-btn"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page === totalPages}
                                >Siguiente →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default MisPedidos;
