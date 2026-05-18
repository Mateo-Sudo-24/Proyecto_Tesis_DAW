import { useEffect, useRef, useState } from 'react';

const ITEMS_POR_PAGINA = 10;

const bmStyles = `
    /* ── Wrapper ── */
    .bm-wrap { position: relative; }

    /* ── Botón campana ── */
    .bm-bell-btn {
        position: relative;
        width: 38px; height: 38px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background 0.18s;
        font-size: 1.1rem;
        color: #fff;
        flex-shrink: 0;
        overflow: visible;
    }
    .bm-bell-btn:hover { background: rgba(255,255,255,0.16); }

    .bm-badge {
        position: absolute;
        top: -5px; right: -5px;
        min-width: 17px; height: 17px;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 800;
        border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        padding: 0 3px;
        border: 2px solid #1f2937;
        line-height: 1;
        pointer-events: none;
        z-index: 2;
    }
    .bm-badge.orange { background: #e8760a; }

    /* ── Panel desplegable ── */
    .bm-panel {
        position: absolute;
        right: 0; top: calc(100% + 10px);
        width: 380px;
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 16px 48px rgba(0,0,0,0.18);
        border: 1px solid #e5e7eb;
        z-index: 100;
        overflow: hidden;
        animation: bm-slide-in 0.18s ease;
    }
    @keyframes bm-slide-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Flecha apuntando al botón */
    .bm-panel::before {
        content: '';
        position: absolute;
        top: -7px; right: 12px;
        width: 13px; height: 13px;
        background: #1f2937;
        transform: rotate(45deg);
        border-radius: 2px;
    }

    /* ── Header del panel ── */
    .bm-panel-header {
        background: #1f2937;
        padding: 1rem 1.25rem;
        display: flex; align-items: center; justify-content: space-between;
        position: relative;
    }
    .bm-panel-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
    }
    .bm-header-badges { display: flex; gap: 0.4rem; }
    .bm-hbadge {
        font-size: 0.68rem; font-weight: 800;
        padding: 0.15rem 0.55rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        transition: opacity 0.15s, outline 0.15s;
        outline: 2px solid transparent;
    }
    .bm-hbadge:hover { opacity: 0.85; }
    .bm-hbadge-unread  { background: #e8760a; color: #fff; }
    .bm-hbadge-pending { background: #ef4444; color: #fff; }
    .bm-hbadge-active  { outline: 2px solid #fff; outline-offset: 1px; }

    /* ── Filtros ── */
    .bm-filters {
        display: flex;
        gap: 0;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
    }
    .bm-filter-btn {
        flex: 1;
        padding: 0.6rem 0.5rem;
        border: none;
        background: transparent;
        font-size: 0.75rem;
        font-weight: 700;
        color: #6b7280;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        white-space: nowrap;
    }
    .bm-filter-btn:hover { background: #f3f4f6; color: #374151; }
    .bm-filter-btn.active-todas    { border-bottom-color: #6b7280; color: #111827; }
    .bm-filter-btn.active-unread   { border-bottom-color: #e8760a; color: #e8760a; }
    .bm-filter-btn.active-pending  { border-bottom-color: #ef4444; color: #ef4444; }
    .bm-filter-btn.active-read     { border-bottom-color: #3b82f6; color: #3b82f6; }
    .bm-filter-count {
        font-size: 0.65rem; font-weight: 800;
        padding: 0.1rem 0.4rem;
        border-radius: 999px;
        background: #e5e7eb;
        color: #6b7280;
    }
    .bm-filter-btn.active-todas   .bm-filter-count { background: #374151;  color: #fff; }
    .bm-filter-btn.active-unread  .bm-filter-count { background: #e8760a;  color: #fff; }
    .bm-filter-btn.active-pending .bm-filter-count { background: #ef4444;  color: #fff; }
    .bm-filter-btn.active-read    .bm-filter-count { background: #3b82f6;  color: #fff; }

    /* ── Lista ── */
    .bm-list {
        max-height: 420px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
    }
    .bm-list::-webkit-scrollbar { width: 4px; }
    .bm-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }

    /* ── Vacío ── */
    .bm-empty {
        padding: 2.5rem 1rem;
        text-align: center;
        color: #9ca3af;
        font-size: 0.85rem;
    }
    .bm-empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }

    /* ── Item ── */
    .bm-item {
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.15s;
    }
    .bm-item:last-child { border-bottom: none; }
    .bm-item.unread  { background: #fffbeb; border-left: 3px solid #f59e0b; }
    .bm-item.pending { background: #fef2f2; border-left: 3px solid #ef4444; }
    .bm-item.read    { background: #fff;    border-left: 3px solid transparent; }

    /* Cabecera clicable del item */
    .bm-item-head {
        width: 100%; text-align: left;
        padding: 0.85rem 1rem;
        display: flex; align-items: flex-start; gap: 0.75rem;
        background: transparent; border: none; cursor: pointer;
    }
    .bm-item-head:hover { background: rgba(0,0,0,0.025); }

    .bm-item-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

    .bm-item-info { flex: 1; min-width: 0; text-align: left; }
    .bm-item-tags {
        display: flex; flex-wrap: wrap; gap: 0.3rem;
        margin-bottom: 0.2rem;
    }
    .bm-tag {
        font-size: 0.65rem; font-weight: 800;
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
    }
    .bm-tag-nueva      { background: #fef3c7; color: #92400e; }
    .bm-tag-accion     { background: #fee2e2; color: #991b1b; }
    .bm-tag-aprobado   { background: #d1fae5; color: #065f46; }
    .bm-tag-rechazado  { background: #fee2e2; color: #991b1b; }
    .bm-tag-completado { background: #dbeafe; color: #1e40af; }

    .bm-item-msg {
        font-size: 0.82rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .bm-item-date {
        font-size: 0.72rem;
        color: #9ca3af;
        margin-top: 0.15rem;
    }
    .bm-chevron { color: #9ca3af; font-size: 0.7rem; flex-shrink: 0; margin-top: 4px; transition: transform 0.2s; }
    .bm-chevron.open { transform: rotate(180deg); }

    /* ── Cuerpo expandido ── */
    .bm-item-body {
        padding: 0 1rem 1rem;
        border-top: 1px solid rgba(0,0,0,0.06);
    }
    .bm-item-full-msg {
        font-size: 0.82rem; color: #374151;
        line-height: 1.55; margin: 0.75rem 0;
    }

    /* Productos */
    .bm-products-label {
        font-size: 0.65rem; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.07em;
        color: #9ca3af; margin-bottom: 0.5rem;
    }
    .bm-product-row {
        display: flex; align-items: center; justify-content: space-between;
        background: #f9fafb; border: 1px solid #e5e7eb;
        border-radius: 0.5rem; padding: 0.5rem 0.75rem;
        margin-bottom: 0.35rem; font-size: 0.78rem;
    }
    .bm-product-name  { font-weight: 700; color: #111827; }
    .bm-product-stock { font-weight: 900; color: #dc2626; }

    /* Botones aprobar/rechazar */
    .bm-gestion-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .bm-btn-ok, .bm-btn-ko {
        flex: 1; padding: 0.55rem;
        border-radius: 0.5rem; border: none; cursor: pointer;
        font-size: 0.75rem; font-weight: 800;
        transition: background 0.15s, opacity 0.15s;
    }
    .bm-btn-ok { background: #16a34a; color: #fff; }
    .bm-btn-ok:hover { background: #15803d; }
    .bm-btn-ko { background: #dc2626; color: #fff; }
    .bm-btn-ko:hover { background: #b91c1c; }
    .bm-btn-ok:disabled, .bm-btn-ko:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Marcar leída */
    .bm-btn-leida {
        display: inline-block;
        margin-top: 0.6rem;
        font-size: 0.75rem; font-weight: 700;
        color: #e8760a; background: #fde8ce;
        border: none; border-radius: 0.4rem;
        padding: 0.35rem 0.75rem; cursor: pointer;
        transition: background 0.15s;
    }
    .bm-btn-leida:hover { background: #fbd3a0; }

    /* ── Footer ── */
    .bm-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid #f3f4f6;
        text-align: center;
        font-size: 0.75rem;
        color: #9ca3af;
    }

    /* ── Responsive móvil ── */
    @media (max-width: 520px) {
        .bm-panel {
            position: fixed;
            right: 0.5rem;
            left: 0.5rem;
            top: auto;
            width: auto;
            max-height: 85vh;
        }
        .bm-list { max-height: calc(85vh - 130px); }
        .bm-panel::before { display: none; }
        .bm-filter-btn { font-size: 0.68rem; padding: 0.5rem 0.3rem; }
        .bm-filter-count { display: none; }
    }

    /* ── Paginación ── */
    .bm-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding: 0.65rem 1rem;
        border-top: 1px solid #f3f4f6;
    }
    .bm-page-btn {
        border-radius: 9999px;
        border: 1px solid #cbd5e1;
        padding: 0.4rem 0.7rem;
        text-align: center;
        font-size: 0.75rem;
        line-height: 1.25;
        transition: all 0.15s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        color: #475569;
        background: #fff;
        cursor: pointer;
        font-weight: 700;
    }
    .bm-page-btn:hover:not(:disabled) {
        background: #1f2937;
        color: #fff;
        border-color: #1f2937;
        box-shadow: 0 4px 6px rgba(0,0,0,0.12);
    }
    .bm-page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
        box-shadow: none;
    }
    .bm-page-num { min-width: 2rem; }
    .bm-page-num.active {
        background: #1f2937;
        color: #fff;
        border-color: transparent;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        cursor: default;
        pointer-events: none;
    }
`;

const necesitaGestion = (n) =>
    n.tipo === 'stock_critico' && (!n.estadoGestion || n.estadoGestion === 'pendiente');

const isN8n = (n) => n.tipo === 'stock_critico' || n.tipo === 'pago_completado';

const estadoTag = (estado) => {
    if (estado === 'aprobado')   return <span className="bm-tag bm-tag-aprobado">Aprobado ✓</span>;
    if (estado === 'rechazado')  return <span className="bm-tag bm-tag-rechazado">Rechazado ✗</span>;
    if (estado === 'completado') return <span className="bm-tag bm-tag-completado">Completado</span>;
    return null;
};

export default function BandejaMensajes() {
    const [notifs, setNotifs] = useState([]);
    const [abierta, setAbierta] = useState(false);
    const [expandido, setExpandido] = useState(null);
    const [gestionando, setGestionando] = useState(null);
    const [filtro, setFiltro] = useState('todas');
    const [localEstado, setLocalEstado] = useState({}); // { [id]: 'pendiente' }
    const [pagina, setPagina] = useState(1);
    const panelRef = useRef(null);

    // Detectar rol del usuario desde el store de auth en localStorage
    const getRol = () => {
        try {
            return JSON.parse(localStorage.getItem('auth-token'))?.state?.rol ?? null;
        } catch { return null; }
    };

    const getToken = () => {
        try {
            return JSON.parse(localStorage.getItem('auth-token'))?.state?.token ?? null;
        } catch { return null; }
    };

    const isAdminUser = getRol() === 'administrador';

    const fetchNotifs = async () => {
        try {
            const token = getToken();
            const rol = getRol();
            const endpoint = rol === 'vendedor'
                ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor`
                : `${import.meta.env.VITE_BACKEND_URL}/notificaciones`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setNotifs(Array.isArray(data) ? data : data.notificaciones || []);
        } catch { /* silencioso */ }
    };

    useEffect(() => {
        fetchNotifs();
        const id = setInterval(fetchNotifs, 30000);
        return () => clearInterval(id);
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!abierta) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setAbierta(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [abierta]);

    const cambiarFiltro = (key) => {
        setFiltro(key);
        setPagina(1);
        setExpandido(null);
    };

    const marcarLeida = async (id) => {
        try {
            const token = getToken();
            const rol = getRol();
            const endpoint = rol === 'vendedor'
                ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor/${id}/leida`
                : `${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}/leida`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setNotifs(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
        } catch { /* silencioso */ }
    };

    const gestionarPedido = async (id, decision) => {
        setGestionando(id);
        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}/${decision}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifs(prev => prev.map(n =>
                    n._id === id
                        ? { ...n, estadoGestion: decision === 'aprobar' ? 'aprobado' : 'rechazado', leida: true }
                        : n
                ));
                // Limpiar estado local pendiente (admin)
                setLocalEstado(prev => { const next = { ...prev }; delete next[id]; return next; });
                setExpandido(null);
            }
        } catch { /* silencioso */ }
        finally { setGestionando(null); }
    };

    // Admin — Paso 1: Confirmar desde "Sin leer" → mueve a "Pendientes" solo en local
    const moverAPendiente = (id) => {
        setLocalEstado(prev => ({ ...prev, [id]: 'pendiente' }));
        setExpandido(null);
    };

    // Admin — Paso 1: Rechazar desde "Sin leer" → marca como leída, desaparece
    const rechazarDesdeUnread = async (id) => {
        await marcarLeida(id);
        setExpandido(null);
    };

    // ── Conteos generales ──
    const noLeidas  = notifs.filter(n => !n.leida).length;
    const pendientes = notifs.filter(necesitaGestion).length;
    const leidas     = notifs.filter(n => n.leida).length;

    // ── Conteos admin ──
    const unreadAdmin     = notifs.filter(n => !n.leida && !localEstado[n._id]).length;
    const pendientesAdmin = notifs.filter(n => localEstado[n._id] === 'pendiente').length;
    const aprobadasAdmin  = notifs.filter(n => n.estadoGestion === 'aprobado').length;

    const badgeUnread  = isAdminUser ? unreadAdmin    : noLeidas;
    const badgePending = isAdminUser ? pendientesAdmin : pendientes;
    const totalBadge   = badgeUnread + badgePending;

    // ── Tabs ──
    const tabs = isAdminUser
        ? [
            { key: 'todas',   label: 'Todas',      count: notifs.length },
            { key: 'unread',  label: 'Sin leer',   count: unreadAdmin },
            { key: 'pending', label: 'Pendientes', count: pendientesAdmin },
            { key: 'read',    label: 'Aprobadas',  count: aprobadasAdmin },
          ]
        : [
            { key: 'todas',   label: 'Todas',      count: notifs.length },
            { key: 'unread',  label: 'Sin leer',   count: noLeidas },
            { key: 'pending', label: 'Pendientes', count: pendientes },
            { key: 'read',    label: 'Leídas',     count: leidas },
          ];

    // ── Filtrado ──
    const notifsFiltradas = notifs.filter(n => {
        if (isAdminUser) {
            if (filtro === 'unread')  return !n.leida && !localEstado[n._id];
            if (filtro === 'pending') return localEstado[n._id] === 'pendiente';
            if (filtro === 'read')    return n.estadoGestion === 'aprobado';
            return true;
        }
        if (filtro === 'unread')  return !n.leida;
        if (filtro === 'pending') return necesitaGestion(n);
        if (filtro === 'read')    return n.leida;
        return true;
    });

    // ── Paginación (solo admin) ──
    const totalPaginas  = Math.ceil(notifsFiltradas.length / ITEMS_POR_PAGINA);
    const paginaActual  = Math.min(pagina, Math.max(1, totalPaginas));
    const notifsEnPagina = isAdminUser
        ? notifsFiltradas.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA)
        : notifsFiltradas;

    // ── Clase visual del item ──
    const getItemClass = (n) => {
        if (isAdminUser) {
            if (localEstado[n._id] === 'pendiente') return 'bm-item pending';
            if (n.estadoGestion === 'aprobado')     return 'bm-item read';
            if (!n.leida)                           return 'bm-item unread';
            return 'bm-item read';
        }
        if (!n.leida)           return 'bm-item unread';
        if (necesitaGestion(n)) return 'bm-item pending';
        return 'bm-item read';
    };

    return (
        <>
            <style>{bmStyles}</style>
            <div className="bm-wrap" ref={panelRef}>
                {/* Campana — badge fuera del button para evitar clip en móvil */}
                <button
                    className="bm-bell-btn"
                    onClick={() => setAbierta(v => !v)}
                    title="Notificaciones"
                >
                    🔔
                </button>
                {totalBadge > 0 && (
                    <span
                        className={`bm-badge${badgePending > 0 ? '' : ' orange'}`}
                        onClick={() => setAbierta(v => !v)}
                    >
                        {totalBadge > 9 ? '9+' : totalBadge}
                    </span>
                )}

                {/* Panel */}
                {abierta && (
                    <div className="bm-panel">
                        {/* Header — badges clicables como filtro */}
                        <div className="bm-panel-header">
                            <p className="bm-panel-title">Notificaciones</p>
                            <div className="bm-header-badges">
                                {badgeUnread > 0 && (
                                    <button
                                        className={`bm-hbadge bm-hbadge-unread${filtro === 'unread' ? ' bm-hbadge-active' : ''}`}
                                        onClick={() => cambiarFiltro(filtro === 'unread' ? 'todas' : 'unread')}
                                        title="Filtrar sin leer"
                                    >
                                        {badgeUnread} sin leer
                                    </button>
                                )}
                                {badgePending > 0 && (
                                    <button
                                        className={`bm-hbadge bm-hbadge-pending${filtro === 'pending' ? ' bm-hbadge-active' : ''}`}
                                        onClick={() => cambiarFiltro(filtro === 'pending' ? 'todas' : 'pending')}
                                        title="Filtrar pendientes"
                                    >
                                        {badgePending} pendiente{badgePending !== 1 ? 's' : ''}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bm-filters">
                            {tabs.map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    className={`bm-filter-btn${filtro === key ? ` active-${key}` : ''}`}
                                    onClick={() => cambiarFiltro(key)}
                                >
                                    {label}
                                    <span className="bm-filter-count">{count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Lista */}
                        <div className="bm-list">
                            {notifsEnPagina.length === 0 ? (
                                <div className="bm-empty">
                                    <div className="bm-empty-icon">🔕</div>
                                    <p>{notifs.length === 0 ? 'Sin notificaciones por ahora' : 'Sin resultados en este filtro'}</p>
                                </div>
                            ) : (
                                notifsEnPagina.map(n => {
                                    const estaExpandido    = expandido === n._id;
                                    const enPendienteLocal = isAdminUser && localEstado[n._id] === 'pendiente';
                                    const esUnreadAdmin    = isAdminUser && !n.leida && !localEstado[n._id];
                                    const puedeGestionar   = !isAdminUser && necesitaGestion(n);

                                    return (
                                        <div key={n._id} className={getItemClass(n)}>
                                            {/* Cabecera */}
                                            <button
                                                className="bm-item-head"
                                                onClick={() => setExpandido(estaExpandido ? null : n._id)}
                                            >
                                                <span className="bm-item-icon">
                                                    {n.tipo === 'stock_critico'
                                                        ? '⚠️'
                                                        : n.tipo === 'pago_completado'
                                                            ? '💰'
                                                            : '🔔'}
                                                </span>
                                                <div className="bm-item-info">
                                                    <div className="bm-item-tags">
                                                        {estadoTag(n.estadoGestion)}
                                                        {enPendienteLocal && (
                                                            <span className="bm-tag bm-tag-accion">Pendiente de aprobación</span>
                                                        )}
                                                        {esUnreadAdmin && (
                                                            <span className="bm-tag bm-tag-nueva">Nueva</span>
                                                        )}
                                                        {puedeGestionar && (
                                                            <span className="bm-tag bm-tag-accion">Acción requerida</span>
                                                        )}
                                                        {!isAdminUser && !n.leida && !puedeGestionar && (
                                                            <span className="bm-tag bm-tag-nueva">Nueva</span>
                                                        )}
                                                    </div>
                                                    <p className="bm-item-msg">{n.mensaje}</p>
                                                    <p className="bm-item-date">
                                                        {n.createdAt ? new Date(n.createdAt).toLocaleString('es-ES') : '—'}
                                                    </p>
                                                </div>
                                                <span className={`bm-chevron${estaExpandido ? ' open' : ''}`}>▼</span>
                                            </button>

                                            {/* Cuerpo expandido */}
                                            {estaExpandido && (
                                                <div className="bm-item-body">
                                                    <p className="bm-item-full-msg">{n.mensaje}</p>

                                                    {n.productos?.length > 0 && (
                                                        <div>
                                                            <p className="bm-products-label">Productos afectados</p>
                                                            {n.productos.map((p, i) => (
                                                                <div key={i} className="bm-product-row">
                                                                    <div>
                                                                        <span className="bm-product-name">{p.nombre}</span>
                                                                        {p.descripcion && (
                                                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '0.3rem' }}>
                                                                                · {p.descripcion}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="bm-product-stock">{p.stock} uds</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* ── Admin — Paso 1: Sin leer → Confirmar/Rechazar ── */}
                                                    {esUnreadAdmin && (
                                                        <div className="bm-gestion-row">
                                                            <button
                                                                className="bm-btn-ok"
                                                                onClick={() => moverAPendiente(n._id)}
                                                            >
                                                                ✓ Confirmar
                                                            </button>
                                                            <button
                                                                className="bm-btn-ko"
                                                                onClick={() => rechazarDesdeUnread(n._id)}
                                                            >
                                                                ✗ Rechazar
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* ── Admin — Paso 2: Pendiente → Aprobar/Rechazar o Confirmar pedido/Dejar ── */}
                                                    {enPendienteLocal && (
                                                        <div className="bm-gestion-row">
                                                            <button
                                                                className="bm-btn-ok"
                                                                onClick={() => gestionarPedido(n._id, 'aprobar')}
                                                                disabled={gestionando === n._id}
                                                            >
                                                                {gestionando === n._id
                                                                    ? 'Procesando…'
                                                                    : isN8n(n) ? '✓ Aprobar' : '✓ Confirmar pedido'}
                                                            </button>
                                                            <button
                                                                className="bm-btn-ko"
                                                                onClick={isN8n(n)
                                                                    ? () => gestionarPedido(n._id, 'rechazar')
                                                                    : () => setExpandido(null)}
                                                                disabled={gestionando === n._id}
                                                            >
                                                                {gestionando === n._id
                                                                    ? 'Procesando…'
                                                                    : isN8n(n) ? '✗ Rechazar' : '⏸ Dejar en pendiente'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* ── Vendedor — Gestión stock_critico ── */}
                                                    {puedeGestionar && (
                                                        <div className="bm-gestion-row">
                                                            <button
                                                                className="bm-btn-ok"
                                                                onClick={() => gestionarPedido(n._id, 'aprobar')}
                                                                disabled={gestionando === n._id}
                                                            >
                                                                {gestionando === n._id ? 'Procesando…' : '✓ Confirmar'}
                                                            </button>
                                                            <button
                                                                className="bm-btn-ko"
                                                                onClick={() => gestionarPedido(n._id, 'rechazar')}
                                                                disabled={gestionando === n._id}
                                                            >
                                                                {gestionando === n._id ? 'Procesando…' : '✗ Rechazar'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Marcar leída (vendedor, no gestionable) */}
                                                    {!isAdminUser && !n.leida && !puedeGestionar && (
                                                        <button className="bm-btn-leida" onClick={() => marcarLeida(n._id)}>
                                                            Marcar como leída
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Paginación — solo admin, cuando hay más de una página */}
                        {isAdminUser && totalPaginas > 1 && (
                            <div className="bm-pagination">
                                <button
                                    className="bm-page-btn"
                                    onClick={() => { setPagina(p => Math.max(1, p - 1)); setExpandido(null); }}
                                    disabled={paginaActual === 1}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`bm-page-btn bm-page-num${paginaActual === i + 1 ? ' active' : ''}`}
                                        onClick={() => { setPagina(i + 1); setExpandido(null); }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="bm-page-btn"
                                    onClick={() => { setPagina(p => Math.min(totalPaginas, p + 1)); setExpandido(null); }}
                                    disabled={paginaActual === totalPaginas}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        {notifs.length > 0 && (
                            <div className="bm-footer">
                                {notifs.length} notificación{notifs.length !== 1 ? 'es' : ''} en total
                                {isAdminUser && totalPaginas > 1 && (
                                    <span> · Pág. {paginaActual}/{totalPaginas}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
