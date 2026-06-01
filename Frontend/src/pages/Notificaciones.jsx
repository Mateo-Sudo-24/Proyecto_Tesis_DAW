import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

/* ── Estilos internos ─────────────────────────────────────────── */
const styles = `
    .notif-page {
        min-height: 100%;
        background-color: #f3f4f6;
        padding: 0.75rem 1rem;
    }
    .notif-inner {
        width: 100%;
    }
    .notif-header {
        background-color: #1f2937;
        border-radius: 0.6rem;
        padding: 0.75rem 1.1rem;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.14);
    }
    .notif-header h1 {
        font-size: 1.1rem;
        font-weight: 900;
        color: #f59e0b;
        margin: 0 0 0.1rem 0;
    }
    .notif-header p {
        font-size: 0.78rem;
        color: #9ca3af;
        margin: 0;
    }
    .notif-header .badge-sin-leer {
        background: #f59e0b;
        color: #1f2937;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
        margin-left: 0.4rem;
    }
    .notif-header .pendientes-box {
        background: rgba(239,68,68,0.15);
        border: 1px solid rgba(239,68,68,0.35);
        border-radius: 0.5rem;
        padding: 0.3rem 0.85rem;
        text-align: center;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .notif-header .pendientes-box .num { font-size: 1.1rem; font-weight: 900; color: #fca5a5; line-height: 1; }
    .notif-header .pendientes-box .lbl { font-size: 0.65rem; color: #fca5a5; font-weight: 600; }

    /* Filtros */
    .notif-filtros { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.65rem; }
    .notif-filtro-btn {
        padding: 0.35rem 0.8rem;
        border-radius: 0.5rem;
        font-weight: 700;
        font-size: 0.78rem;
        border: 1.5px solid #d1d5db;
        background: #fff;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.18s ease;
        display: flex;
        align-items: center;
        gap: 0.3rem;
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
        border-radius: 0.6rem;
        border: 1px solid #e5e7eb;
        padding: 2rem 1.25rem;
        text-align: center;
        box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    }
    .notif-empty .icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .notif-empty .title { font-size: 0.95rem; font-weight: 700; color: #374151; margin-bottom: 0.25rem; }
    .notif-empty .sub   { font-size: 0.78rem; color: #9ca3af; }

    /* Tarjeta de notificación */
    .notif-card {
        background: #fff;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        border-left: 3px solid transparent;
        overflow: hidden;
        margin-bottom: 0.4rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        transition: box-shadow 0.15s ease;
    }
    .notif-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
    .notif-card.no-leida   { border-left-color: transparent; background: #fff; }
    .notif-card.pendiente  { border-left-color: #3b82f6; }
    .notif-card.aprobada   { border-left-color: #16a34a; }
    .notif-card.rechazada  { border-left-color: #ef4444; }
    .notif-card.completada { border-left-color: #6b7280; }
    .notif-card.en-pendiente { border-left-color: #3b82f6; }

    .notif-card .stripe { display: none; }

    /* Cabecera clicable */
    .notif-card-head {
        width: 100%; text-align: left;
        padding: 0.6rem 0.9rem;
        display: flex; align-items: center; gap: 0.65rem;
        background: transparent; border: none; cursor: pointer;
    }
    .notif-tipo-label {
        font-size: 0.65rem; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.06em;
        color: #6b7280;
    }
    .notif-mensaje { font-size: 0.82rem; font-weight: 600; color: #111827; margin: 0.1rem 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .notif-fecha   { font-size: 0.7rem; color: #9ca3af; margin-top: 0.08rem; }

    .badge-nueva    { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #fff; color: #374151; border: 1px solid #e5e7eb; }
    .badge-aprobado { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #d1fae5; color: #065f46; }
    .badge-rechazado{ font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #fee2e2; color: #991b1b; }
    .badge-completado{font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #dbeafe; color: #1e40af; }
    .badge-pendiente{ font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #dbeafe; color: #1e40af; }

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
        padding: 0.6rem 0.9rem 0.85rem;
        border-top: 1px solid rgba(0,0,0,0.07);
    }
    .notif-body-msg { font-size: 0.8rem; color: #374151; margin-bottom: 0.6rem; line-height: 1.5; }

    .productos-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 0.4rem; }
    .producto-fila {
        display: flex; align-items: center; justify-content: space-between;
        background: #f9fafb; border: 1px solid #e5e7eb;
        border-radius: 0.4rem; padding: 0.4rem 0.65rem; margin-bottom: 0.3rem;
    }
    .producto-nombre { font-size: 0.8rem; font-weight: 700; color: #111827; }
    .producto-desc   { font-size: 0.7rem; color: #9ca3af; margin-top: 0.05rem; }
    .producto-stock  { font-size: 0.82rem; font-weight: 900; color: #dc2626; }
    .producto-umbral { font-size: 0.68rem; color: #9ca3af; text-align: right; }

    /* Botones de gestión */
    .gestion-row { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
    .btn-aprobar, .btn-rechazar {
        flex: 1; padding: 0.5rem 0.75rem;
        border-radius: 0.5rem; border: none; cursor: pointer;
        font-size: 0.8rem; font-weight: 800;
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

    /* ── Paginación ── */
    .notif-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding: 0.65rem 0 0.25rem;
    }
    .notif-page-btn {
        border-radius: 9999px;
        border: 1px solid #cbd5e1;
        padding: 0.45rem 0.75rem;
        text-align: center;
        font-size: 0.8rem;
        line-height: 1.25;
        transition: all 0.15s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        color: #475569;
        background: #fff;
        cursor: pointer;
        font-weight: 700;
    }
    .notif-page-btn:hover:not(:disabled) {
        background: #1f2937;
        color: #fff;
        border-color: #1f2937;
        box-shadow: 0 4px 6px rgba(0,0,0,0.12);
    }
    .notif-page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
        box-shadow: none;
    }
    .notif-page-num { min-width: 2.25rem; }
    .notif-page-num.active {
        background: #1f2937;
        color: #fff;
        border-color: transparent;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        cursor: default;
        pointer-events: none;
    }

    /* Botones acción en cuerpo expandido */
    .btn-confirmar-paso1, .btn-rechazar-paso1,
    .btn-paso2-ok, .btn-paso2-ko {
        flex: 1; padding: 0.5rem 0.75rem;
        border-radius: 0.5rem; border: none; cursor: pointer;
        font-size: 0.8rem; font-weight: 800;
        transition: all 0.18s ease;
    }
    .btn-confirmar-paso1 { background: #0284c7; color: #fff; }
    .btn-confirmar-paso1:hover { background: #0369a1; }
    .btn-rechazar-paso1  { background: #dc2626; color: #fff; }
    .btn-rechazar-paso1:hover  { background: #b91c1c; }
    .btn-paso2-ok  { background: #16a34a; color: #fff; }
    .btn-paso2-ok:hover  { background: #15803d; }
    .btn-paso2-ko  { background: #dc2626; color: #fff; }
    .btn-paso2-ko:hover  { background: #b91c1c; }
    .btn-paso2-ko.dejar  { background: #6b7280; }
    .btn-paso2-ko.dejar:hover  { background: #4b5563; }
    .btn-paso2-ok:disabled, .btn-paso2-ko:disabled { opacity: 0.5; cursor: not-allowed; }
    .notif-card.en-pendiente { border-left-color: #3b82f6; }
    .badge-en-pendiente { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #dbeafe; color: #1e40af; }

    /* ── Media queries móvil ── */
    @media (max-width: 640px) {
        .notif-page { padding: 0.75rem 0; }
        .notif-inner { padding: 0 0.75rem; }
        .notif-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem 1.1rem;
            gap: 0.75rem;
            border-radius: 0.75rem;
        }
        .notif-header h1 { font-size: 1.25rem; }
        .notif-header p  { font-size: 0.8rem; }
        .pendientes-box {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0.875rem;
            border-radius: 0.5rem;
        }
        .pendientes-box .num { font-size: 1.25rem; }
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

const ITEMS_POR_PAGINA = 5;

/* ═══════════════════════════════════════════════════════════════ */
const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading]               = useState(true);
    const [filtro, setFiltro]                 = useState('todas');
    const [expandido, setExpandido]           = useState(null);
    const [gestionando, setGestionando]       = useState(null);
    const [pagina, setPagina]                 = useState(1);

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

    const cambiarFiltro = (key) => {
        setFiltro(key);
        setPagina(1);
        setExpandido(null);
    };

    const toggleExpandido = (id) => setExpandido(prev => prev === id ? null : id);

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
                setExpandido(null);
                toast.success(decision === 'aprobar' ? 'Notificación aprobada' : 'Notificación rechazada');
            } else {
                toast.error(`Error al ${decision === 'aprobar' ? 'aprobar' : 'rechazar'}`);
            }
        } catch { toast.error('Error de conexión'); }
        finally { setGestionando(null); }
    };

    // ── Conteos ──
    const pasarAPendiente = async (id) => {
        setGestionando(id);
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}/pendiente`, {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotificaciones(prev =>
                    prev.map(n => n._id === id
                        ? (data.notif || { ...n, estadoGestion: 'pendiente', leida: true })
                        : n)
                );
                toast.success('Notificación puesta en pendiente');
            } else {
                toast.error('No se pudo pasar a pendiente');
            }
        } catch { toast.error('Error de conexión'); }
        finally { setGestionando(null); }
    };

    const pendientesCount = notificaciones.filter(n => n.estadoGestion === 'pendiente' && n.leida).length;
    const aprobadasCount  = notificaciones.filter(n => n.estadoGestion === 'aprobado').length;

    // Filtros visibles: Todas, Pendientes y Aprobadas.
    const notificacionesFiltradas = notificaciones.filter(n => {
        if (filtro === 'pendientes') return n.estadoGestion === 'pendiente' && n.leida;
        if (filtro === 'aprobadas')  return n.estadoGestion === 'aprobado';
        return true;
    });

    // ── Paginación ──
    const totalPaginas    = Math.ceil(notificacionesFiltradas.length / ITEMS_POR_PAGINA);
    const paginaActual    = Math.min(pagina, Math.max(1, totalPaginas));
    const notifsPagina    = notificacionesFiltradas.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    const getCardClass = (n) => {
        if (n.estadoGestion === 'aprobado')     return 'notif-card aprobada';
        if (n.estadoGestion === 'rechazado')    return 'notif-card rechazada';
        if (n.estadoGestion === 'completado')   return 'notif-card completada';
        if (!n.leida)                           return 'notif-card no-leida';
        if (n.estadoGestion === 'pendiente')    return 'notif-card en-pendiente';
        return 'notif-card';
    };

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

                    {/* ── Cabecera ───────────────────────────────────────── */}
                    <div className="notif-header">
                        <div>
                            <h1>Notificaciones</h1>
                            <p>
                                {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''} en total
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
                            { key: 'pendientes', label: 'Pendientes',  count: pendientesCount, alert: pendientesCount > 0 },
                            { key: 'aprobadas',  label: 'Aprobadas',   count: aprobadasCount },
                        ].map(({ key, label, count, alert }) => (
                            <button
                                key={key}
                                onClick={() => cambiarFiltro(key)}
                                className={`notif-filtro-btn${filtro === key ? ' activo' : alert ? ' alerta' : ''}`}
                            >
                                {label}
                                <span className="badge">{count}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Lista ─────────────────────────────────────────── */}
                    {notifsPagina.length === 0 ? (
                        <div className="notif-empty">
                            <div className="icon">🔔</div>
                            <p className="title">No hay notificaciones en esta categoría</p>
                            <p className="sub">Cuando haya actividad, aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div>
                            {notifsPagina.map(notif => {
                                const estaExpandido    = expandido === notif._id;
                                const esUnread         = !notif.leida && (!notif.estadoGestion || notif.estadoGestion === 'pendiente');
                                const enPendienteLocal = notif.estadoGestion === 'pendiente' && notif.leida;
                                const label            = TIPO_LABELS[notif.tipo] || notif.tipo || 'Notificación';

                                return (
                                    <div key={notif._id} className={getCardClass(notif)}>
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
                                                    {(enPendienteLocal || notif.estadoGestion !== 'pendiente') && estadoBadge(notif.estadoGestion)}
                                                    {esUnread && <span className="badge-nueva">Nueva</span>}
                                                    {enPendienteLocal && <span className="badge-en-pendiente">Pendiente de aprobación</span>}
                                                </div>
                                                <p className="notif-mensaje">{notif.mensaje}</p>
                                                <p className="notif-fecha">
                                                    {notif.createdAt
                                                        ? new Date(notif.createdAt).toLocaleString('es-ES')
                                                        : 'Fecha no disponible'}
                                                </p>
                                            </div>

                                            {/* Botón eliminar rápido */}
                                            <div className="notif-actions">
                                                {notif.estadoGestion === 'aprobado' && (
                                                    <button
                                                        className="notif-btn-accion notif-btn-del"
                                                        onClick={(e) => eliminarNotificacion(e, notif._id)}
                                                        title="Eliminar"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                                <span className={`notif-chevron${estaExpandido ? ' open' : ''}`}>▾</span>
                                            </div>
                                        </button>

                                        {/* Contenido expandido */}
                                        {estaExpandido && (
                                            <div className="notif-body">
                                                <p className="notif-body-msg">{notif.mensaje}</p>

                                                {notif.productos && notif.productos.length > 0 && (
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <p className="productos-label">Productos afectados</p>
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

                                                {/* ── Paso 2: Pendiente → Aprobar / Rechazar o Confirmar pedido / Dejar ── */}
                                                {esUnread && (
                                                    <div className="gestion-row">
                                                        <button
                                                            className="btn-confirmar-paso1"
                                                            onClick={() => pasarAPendiente(notif._id)}
                                                            disabled={gestionando === notif._id}
                                                        >
                                                            {gestionando === notif._id ? 'Procesando…' : 'Pasar a pendiente'}
                                                        </button>
                                                    </div>
                                                )}

                                                {enPendienteLocal && (
                                                    <div className="gestion-row">
                                                        <button
                                                            className="btn-paso2-ok"
                                                            onClick={() => gestionarPedido(notif._id, 'aprobar')}
                                                            disabled={gestionando === notif._id}
                                                        >
                                                            {gestionando === notif._id
                                                                ? 'Procesando…'
                                                                : '✓ Aprobar'}
                                                        </button>
                                                        <button
                                                            className="btn-paso2-ko"
                                                            onClick={() => gestionarPedido(notif._id, 'rechazar')}
                                                            disabled={gestionando === notif._id}
                                                        >
                                                            {gestionando === notif._id
                                                                ? 'Procesando…'
                                                                : '✗ Rechazar'}
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

                    {/* ── Paginación ── */}
                    {totalPaginas > 1 && (
                        <div className="notif-pagination">
                            <button
                                className="notif-page-btn"
                                onClick={() => { setPagina(p => Math.max(1, p - 1)); setExpandido(null); }}
                                disabled={paginaActual === 1}
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPaginas }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`notif-page-btn notif-page-num${paginaActual === i + 1 ? ' active' : ''}`}
                                    onClick={() => { setPagina(i + 1); setExpandido(null); }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="notif-page-btn"
                                onClick={() => { setPagina(p => Math.min(totalPaginas, p + 1)); setExpandido(null); }}
                                disabled={paginaActual === totalPaginas}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Notificaciones;
