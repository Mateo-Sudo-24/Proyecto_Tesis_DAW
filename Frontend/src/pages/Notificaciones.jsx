import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

/* ── Estilos internos ─────────────────────────────────────────── */
const styles = `
    .notif-page {
        min-height: 100%;
        background-color: #f3f4f6;
        padding: 2.5rem 1.5rem;
    }
    .notif-inner {
        max-width: 860px;
        margin: 0 auto;
    }
    .notif-header {
        background-color: #1f2937;
        border-radius: 1rem;
        padding: 1.75rem 2rem;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    }
    .notif-header h1 {
        font-size: 1.75rem;
        font-weight: 900;
        color: #f59e0b;
        margin: 0 0 0.25rem 0;
    }
    .notif-header p {
        font-size: 0.85rem;
        color: #9ca3af;
        margin: 0;
    }
    .notif-header .badge-sin-leer {
        background: #f59e0b;
        color: #1f2937;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 0.15rem 0.55rem;
        border-radius: 9999px;
        margin-left: 0.5rem;
    }
    .notif-header .pendientes-box {
        background: rgba(239,68,68,0.15);
        border: 1px solid rgba(239,68,68,0.35);
        border-radius: 0.75rem;
        padding: 0.5rem 1.25rem;
        text-align: center;
        flex-shrink: 0;
    }
    .notif-header .pendientes-box .num { font-size: 1.6rem; font-weight: 900; color: #fca5a5; line-height: 1; }
    .notif-header .pendientes-box .lbl { font-size: 0.7rem; color: #fca5a5; font-weight: 600; margin-top: 0.2rem; }

    /* Filtros */
    .notif-filtros { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .notif-filtro-btn {
        padding: 0.5rem 1.1rem;
        border-radius: 0.75rem;
        font-weight: 700;
        font-size: 0.85rem;
        border: 1.5px solid #d1d5db;
        background: #fff;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.18s ease;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .notif-filtro-btn:hover { background: #f9fafb; border-color: #9ca3af; }
    .notif-filtro-btn.activo { background: #1f2937; color: #f59e0b; border-color: #1f2937; }
    .notif-filtro-btn.alerta { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .notif-filtro-btn .badge {
        font-size: 0.7rem; font-weight: 800;
        padding: 0.1rem 0.45rem; border-radius: 9999px;
        background: #e5e7eb; color: #6b7280;
    }
    .notif-filtro-btn.activo .badge { background: #374151; color: #f59e0b; }
    .notif-filtro-btn.alerta .badge { background: #fee2e2; color: #b91c1c; }

    /* Estado vacío */
    .notif-empty {
        background: #fff;
        border-radius: 1rem;
        border: 1px solid #e5e7eb;
        padding: 4rem 2rem;
        text-align: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .notif-empty .icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .notif-empty .title { font-size: 1.1rem; font-weight: 700; color: #374151; margin-bottom: 0.4rem; }
    .notif-empty .sub   { font-size: 0.85rem; color: #9ca3af; }

    /* Tarjeta de notificación */
    .notif-card {
        background: #fff;
        border-radius: 1rem;
        border: 1.5px solid #e5e7eb;
        overflow: hidden;
        margin-bottom: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: box-shadow 0.2s ease;
    }
    .notif-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.1); }
    .notif-card.no-leida { background: #fffbeb; border-color: #fcd34d; box-shadow: 0 2px 12px rgba(245,158,11,0.12); }
    .notif-card.pendiente { background: #fef2f2; border-color: #fca5a5; box-shadow: 0 2px 12px rgba(239,68,68,0.1); }

    .notif-card .stripe {
        height: 4px; width: 100%;
        background: #e5e7eb;
    }
    .notif-card.no-leida .stripe { background: #f59e0b; }
    .notif-card.pendiente .stripe { background: #ef4444; }

    /* Cabecera clicable */
    .notif-card-head {
        width: 100%; text-align: left;
        padding: 1rem 1.25rem;
        display: flex; align-items: center; gap: 1rem;
        background: transparent; border: none; cursor: pointer;
    }
    .notif-tipo-label {
        font-size: 0.7rem; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.07em;
        color: #6b7280;
    }
    .notif-mensaje { font-size: 0.9rem; font-weight: 600; color: #111827; margin: 0.15rem 0 0; }
    .notif-fecha   { font-size: 0.75rem; color: #9ca3af; margin-top: 0.15rem; }

    .badge-nueva    { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #fef3c7; color: #92400e; }
    .badge-aprobado { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #d1fae5; color: #065f46; }
    .badge-rechazado{ font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #fee2e2; color: #991b1b; }
    .badge-completado{font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #dbeafe; color: #1e40af; }
    .badge-pendiente{ font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #fef3c7; color: #92400e; }

    /* Acciones en cabecera */
    .notif-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .notif-btn-accion {
        padding: 0.4rem 0.75rem;
        border-radius: 0.5rem;
        border: none; cursor: pointer;
        font-size: 0.75rem; font-weight: 700;
        transition: all 0.18s ease;
    }
    .notif-btn-leer  { background: #fef3c7; color: #92400e; }
    .notif-btn-leer:hover  { background: #1f2937; color: #f59e0b; }
    .notif-btn-del   { background: #fee2e2; color: #991b1b; }
    .notif-btn-del:hover   { background: #ef4444; color: #fff; }
    .notif-chevron { color: #9ca3af; font-size: 1.2rem; transition: transform 0.2s ease; }
    .notif-chevron.open { transform: rotate(180deg); }

    /* Cuerpo expandido */
    .notif-body {
        padding: 1rem 1.25rem 1.25rem;
        border-top: 1px solid rgba(0,0,0,0.07);
    }
    .notif-body-msg { font-size: 0.875rem; color: #374151; margin-bottom: 1rem; line-height: 1.6; }

    .productos-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; margin-bottom: 0.75rem; }
    .producto-fila {
        display: flex; align-items: center; justify-content: space-between;
        background: #fff; border: 1px solid #e5e7eb;
        border-radius: 0.75rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .producto-nombre { font-size: 0.875rem; font-weight: 700; color: #111827; }
    .producto-desc   { font-size: 0.75rem; color: #9ca3af; margin-top: 0.1rem; }
    .producto-stock  { font-size: 0.9rem; font-weight: 900; color: #dc2626; }
    .producto-umbral { font-size: 0.72rem; color: #9ca3af; text-align: right; }

    /* Botones de gestión */
    .gestion-row { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .btn-aprobar, .btn-rechazar {
        flex: 1; padding: 0.7rem 1rem;
        border-radius: 0.75rem; border: none; cursor: pointer;
        font-size: 0.9rem; font-weight: 800;
        transition: all 0.18s ease;
    }
    .btn-aprobar         { background: #16a34a; color: #fff; }
    .btn-aprobar:hover   { background: #15803d; }
    .btn-rechazar        { background: #dc2626; color: #fff; }
    .btn-rechazar:hover  { background: #b91c1c; }
    .btn-aprobar:disabled, .btn-rechazar:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Spinner */
    .spinner-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 16rem; background: #fff; border-radius: 1rem; border: 1px solid #e5e7eb; gap: 1rem; }
    .spinner { width: 3rem; height: 3rem; border: 4px solid #1f2937; border-top-color: #f59e0b; border-radius: 9999px; animation: spin 0.75s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-txt { font-size: 0.875rem; color: #9ca3af; font-weight: 500; }

    /* ── Media queries móvil ── */
    @media (max-width: 640px) {
        .notif-page { padding: 1.25rem 0.75rem; }
        .notif-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1.25rem 1.25rem;
        }
        .notif-header h1 { font-size: 1.35rem; }
        .pendientes-box { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1rem; }
        .pendientes-box .num { font-size: 1.3rem; }
        .notif-filtros {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 0.25rem;
            gap: 0.4rem;
        }
        .notif-filtro-btn {
            white-space: nowrap;
            font-size: 0.8rem;
            padding: 0.45rem 0.85rem;
            flex-shrink: 0;
        }
        .notif-card-head { flex-wrap: wrap; gap: 0.5rem; }
        .notif-actions {
            width: 100%;
            justify-content: flex-end;
            gap: 0.4rem;
        }
        .notif-btn-accion { font-size: 0.7rem; padding: 0.35rem 0.6rem; }
        .gestion-row { flex-direction: column; gap: 0.5rem; }
        .btn-aprobar, .btn-rechazar { padding: 0.65rem; }
        .producto-fila { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
        .producto-stock { text-align: left; }
    }
`;

/* ── Helpers ──────────────────────────────────────────────────── */
const TIPO_LABELS = {
    stock_critico:         'Stock Crítico',
    orden_creada:          'Orden Creada',
    pago_completado:       'Pago Completado',
    envio_listo:           'Envío Listo',
    solicitud_cancelacion: 'Cancelación',
};

const estadoBadge = (estado) => {
    if (estado === 'aprobado')   return <span className="badge-aprobado">Aprobado ✓</span>;
    if (estado === 'rechazado')  return <span className="badge-rechazado">Rechazado ✗</span>;
    if (estado === 'completado') return <span className="badge-completado">Completado</span>;
    if (estado === 'pendiente')  return <span className="badge-pendiente">Pendiente</span>;
    return null;
};

const necesitaGestion = (notif) =>
    notif.tipo === 'stock_critico' &&
    (!notif.estadoGestion || notif.estadoGestion === 'pendiente');

/* ═══════════════════════════════════════════════════════════════ */
const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filtro, setFiltro]       = useState('todas');
    const [expandido, setExpandido] = useState(null);
    const [gestionando, setGestionando] = useState(null);

    const token      = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchNotificaciones = async () => {
        try {
            const res  = await fetch(`${backendUrl}/notificaciones`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setNotificaciones(Array.isArray(data) ? data : data.notificaciones || []);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            toast.error('Error al cargar notificaciones');
            setNotificaciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchNotificaciones(); }, [token]);

    const toggleExpandido = (id) => setExpandido(prev => prev === id ? null : id);

    const marcarComoLeida = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}/leida`, {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
                toast.success('Notificación marcada como leída');
            }
        } catch { toast.error('Error al actualizar notificación'); }
    };

    const eliminarNotificacion = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev => prev.filter(n => n._id !== id));
                if (expandido === id) setExpandido(null);
                toast.success('Notificación eliminada');
            }
        } catch { toast.error('Error al eliminar notificación'); }
    };

    const gestionarPedido = async (id, decision) => {
        setGestionando(id);
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}/${decision}`, {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const nuevoEstado = decision === 'aprobar' ? 'aprobado' : 'rechazado';
                setNotificaciones(prev =>
                    prev.map(n => n._id === id ? { ...n, estadoGestion: nuevoEstado, leida: true } : n)
                );
                toast.success(decision === 'aprobar' ? 'Pedido aprobado' : 'Pedido rechazado');
            } else {
                toast.error(`Error al ${decision === 'aprobar' ? 'aprobar' : 'rechazar'} el pedido`);
            }
        } catch { toast.error('Error de conexión'); }
        finally { setGestionando(null); }
    };

    const notificacionesFiltradas = notificaciones.filter(notif => {
        if (filtro === 'leidas')     return notif.leida;
        if (filtro === 'no-leidas')  return !notif.leida;
        if (filtro === 'pendientes') return necesitaGestion(notif);
        return true;
    });

    const noLeidasCount   = notificaciones.filter(n => !n.leida).length;
    const pendientesCount = notificaciones.filter(necesitaGestion).length;

    if (loading) {
        return (
            <>
                <style>{styles}</style>
                <div className="notif-page">
                    <div className="notif-inner">
                        <div className="spinner-wrap">
                            <div className="spinner" />
                            <p className="spinner-txt">Cargando notificaciones…</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{styles}</style>
            <div className="notif-page">
                <div className="notif-inner">
                    <ToastContainer position="top-right" autoClose={3000} />

                    {/* ── Cabecera ───────────────────────────────────────── */}
                    <div className="notif-header">
                        <div>
                            <h1>Notificaciones</h1>
                            <p>
                                {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''} en total
                                {noLeidasCount > 0 && (
                                    <span className="badge-sin-leer">{noLeidasCount} sin leer</span>
                                )}
                            </p>
                        </div>
                        {pendientesCount > 0 && (
                            <div className="pendientes-box">
                                <div className="num">{pendientesCount}</div>
                                <div className="lbl">Pendientes</div>
                            </div>
                        )}
                    </div>

                    {/* ── Filtros ────────────────────────────────────────── */}
                    <div className="notif-filtros">
                        {[
                            { key: 'todas',      label: 'Todas',       count: notificaciones.length },
                            { key: 'no-leidas',  label: 'Sin leer',    count: noLeidasCount,   alert: noLeidasCount > 0 },
                            { key: 'pendientes', label: 'Pendientes',  count: pendientesCount, alert: pendientesCount > 0 },
                            { key: 'leidas',     label: 'Leídas',      count: notificaciones.filter(n => n.leida).length },
                        ].map(({ key, label, count, alert }) => (
                            <button
                                key={key}
                                onClick={() => setFiltro(key)}
                                className={`notif-filtro-btn${filtro === key ? ' activo' : alert ? ' alerta' : ''}`}
                            >
                                {label}
                                <span className="badge">{count}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Lista ─────────────────────────────────────────── */}
                    {notificacionesFiltradas.length === 0 ? (
                        <div className="notif-empty">
                            <div className="icon">🔔</div>
                            <p className="title">No hay notificaciones en esta categoría</p>
                            <p className="sub">Cuando haya actividad, aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div>
                            {notificacionesFiltradas.map(notif => {
                                const estaExpandido  = expandido === notif._id;
                                const puedeGestionar = necesitaGestion(notif);
                                const label          = TIPO_LABELS[notif.tipo] || notif.tipo || 'Notificación';
                                const cardClass      = `notif-card${!notif.leida ? ' no-leida' : puedeGestionar ? ' pendiente' : ''}`;

                                return (
                                    <div key={notif._id} className={cardClass}>
                                        {/* Franja de color */}
                                        <div className="stripe" />

                                        {/* Cabecera clicable */}
                                        <button
                                            className="notif-card-head"
                                            onClick={() => toggleExpandido(notif._id)}
                                        >
                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                                                    <span className="notif-tipo-label">{label}</span>
                                                    {estadoBadge(notif.estadoGestion)}
                                                    {!notif.leida && <span className="badge-nueva">Nueva</span>}
                                                </div>
                                                <p className="notif-mensaje">{notif.mensaje}</p>
                                                <p className="notif-fecha">
                                                    {notif.createdAt
                                                        ? new Date(notif.createdAt).toLocaleString('es-ES')
                                                        : 'Fecha no disponible'}
                                                </p>
                                            </div>

                                            {/* Botones de acción rápida */}
                                            <div className="notif-actions">
                                                {!notif.leida && (
                                                    <button
                                                        className="notif-btn-accion notif-btn-leer"
                                                        onClick={(e) => marcarComoLeida(e, notif._id)}
                                                        title="Marcar como leída"
                                                    >
                                                        Marcar leída
                                                    </button>
                                                )}
                                                <button
                                                    className="notif-btn-accion notif-btn-del"
                                                    onClick={(e) => eliminarNotificacion(e, notif._id)}
                                                    title="Eliminar"
                                                >
                                                    Eliminar
                                                </button>
                                                <span className={`notif-chevron${estaExpandido ? ' open' : ''}`}>▾</span>
                                            </div>
                                        </button>

                                        {/* Contenido expandido */}
                                        {estaExpandido && (
                                            <div className="notif-body">
                                                <p className="notif-body-msg">{notif.mensaje}</p>

                                                {notif.productos && notif.productos.length > 0 && (
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <p className="productos-label">Productos con stock crítico</p>
                                                        {notif.productos.map((p, i) => (
                                                            <div key={i} className="producto-fila">
                                                                <div>
                                                                    <p className="producto-nombre">{p.nombre}</p>
                                                                    {p.descripcion && <p className="producto-desc">{p.descripcion}</p>}
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <p className="producto-stock">{p.stock} uds</p>
                                                                    {p.umbral && <p className="producto-umbral">umbral: {p.umbral}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {puedeGestionar && (
                                                    <div className="gestion-row">
                                                        <button
                                                            className="btn-aprobar"
                                                            onClick={() => gestionarPedido(notif._id, 'aprobar')}
                                                            disabled={gestionando === notif._id}
                                                        >
                                                            {gestionando === notif._id ? 'Procesando…' : '✓ Confirmar reposición'}
                                                        </button>
                                                        <button
                                                            className="btn-rechazar"
                                                            onClick={() => gestionarPedido(notif._id, 'rechazar')}
                                                            disabled={gestionando === notif._id}
                                                        >
                                                            {gestionando === notif._id ? 'Procesando…' : '✗ Rechazar pedido'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Notificaciones;
