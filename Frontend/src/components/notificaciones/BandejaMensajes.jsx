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
        background: #e8760a;
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
    .bm-item.unread  { background: #fff; border-left: 3px solid transparent; }
    .bm-item.pending { background: #fff;  border-left: 3px solid #3b82f6; }
    .bm-item.aprobado{ background: #fff;  border-left: 3px solid #16a34a; }
    .bm-item.rechazado{ background: #fff; border-left: 3px solid #ef4444; }
    .bm-item.completado{ background: #fff; border-left: 3px solid #6b7280; }
    .bm-item.read    { background: #fff;  border-left: 3px solid transparent; }

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
    .bm-tag-nueva      { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
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
    const [pagina, setPagina] = useState(1);
    const [pollingActivo, setPollingActivo] = useState(true);
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
            if (!token) { setPollingActivo(false); return; }
            const rol = getRol();
            const endpoint = rol === 'vendedor'
                ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor`
                : rol === 'cliente'
                    ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/cliente`
                    : `${import.meta.env.VITE_BACKEND_URL}/notificaciones`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                setPollingActivo(false);
                return;
            }
            if (!res.ok) return;
            const data = await res.json();
            setNotifs(Array.isArray(data) ? data : data.notificaciones || []);
        } catch { /* silencioso */ }
    };

    useEffect(() => {
        if (!pollingActivo) return;
        fetchNotifs();
        const id = setInterval(() => {
            if (pollingActivo) fetchNotifs();
        }, 10000);
        return () => clearInterval(id);
    }, [pollingActivo]);

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

    const marcarLeida = async (id) => {
        try {
            const token = getToken();
            const rol = getRol();
            const endpoint = rol === 'vendedor'
                ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor/${id}/leida`
                : rol === 'cliente'
                    ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/cliente/${id}/leida`
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
                setExpandido(null);
            }
        } catch { /* silencioso */ }
        finally { setGestionando(null); }
    };

    // Admin: confirma una notificación nueva y guarda pendiente en BDD.
    const moverAPendiente = async (id) => {
        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}/pendiente`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifs(prev => prev.map(n => n._id === id ? (data.notif || { ...n, estadoGestion: 'pendiente', leida: true }) : n));
            }
        } catch { /* silencioso */ }
        finally { setExpandido(null); }
    };

    // Admin: rechaza una notificación nueva y la marca como leída.
    const rechazarDesdeUnread = async (id) => {
        await marcarLeida(id);
        setExpandido(null);
    };

    // ── Badge: total de notificaciones no leídas ──
    const totalBadge = notifs.length;

    // Mostrar todas las notificaciones sin filtros en la burbuja.
    const notifsFiltradas = notifs;

    // ── Paginación (solo admin) ──
    const totalPaginas  = Math.ceil(notifsFiltradas.length / ITEMS_POR_PAGINA);
    const paginaActual  = Math.min(pagina, Math.max(1, totalPaginas));
    const notifsEnPagina = isAdminUser
        ? notifsFiltradas.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA)
        : notifsFiltradas;

    // ── Clase visual del item ──
    const getItemClass = (n) => {
        if (n.estadoGestion === 'rechazado')    return 'bm-item rechazado';
        if (n.estadoGestion === 'completado')   return 'bm-item completado';
        if (n.estadoGestion === 'aprobado')     return 'bm-item aprobado';
        if (isAdminUser) {
            if (!n.leida)                           return 'bm-item unread';
            if (n.estadoGestion === 'pendiente')    return 'bm-item pending';
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
                    <span className="bm-badge" onClick={() => setAbierta(v => !v)}>
                        {totalBadge > 9 ? '9+' : totalBadge}
                    </span>
                )}

                {/* Panel */}
                {abierta && (
                    <div className="bm-panel">
                        {/* Header */}
                        <div className="bm-panel-header">
                            <p className="bm-panel-title">Notificaciones</p>
                            {totalBadge > 0 && (
                                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                    {totalBadge} nueva{totalBadge !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Lista */}
                        <div className="bm-list">
                            {notifsEnPagina.length === 0 ? (
                                <div className="bm-empty">
                                    <div className="bm-empty-icon">🔕</div>
                                    <p>Sin notificaciones por ahora</p>
                                </div>
                            ) : (
                                notifsEnPagina.map(n => {
                                    const estaExpandido    = expandido === n._id;
                                    const esUnreadAdmin    = isAdminUser && !n.leida && (!n.estadoGestion || n.estadoGestion === 'pendiente');
                                    const enPendienteLocal = isAdminUser && n.estadoGestion === 'pendiente' && n.leida;
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
                                                        {(enPendienteLocal || n.estadoGestion !== 'pendiente') && estadoTag(n.estadoGestion)}
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

                                                    {/* Admin: confirmar/rechazar notificación nueva */}
                                                    {esUnreadAdmin && (
                                                        <div className="bm-gestion-row">
                                                            <button
                                                                className="bm-btn-ok"
                                                                onClick={() => moverAPendiente(n._id)}
                                                            >
                                                                Pasar a pendiente
                                                            </button>
                                                            <button
                                                                className="bm-btn-ko"
                                                                onClick={() => rechazarDesdeUnread(n._id)}
                                                            >
                                                                Rechazar
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
                                                                    : '✓ Aprobar'}
                                                            </button>
                                                            <button
                                                                className="bm-btn-ko"
                                                                onClick={() => gestionarPedido(n._id, 'rechazar')}
                                                                disabled={gestionando === n._id}
                                                            >
                                                                {gestionando === n._id
                                                                    ? 'Procesando…'
                                                                    : '✗ Rechazar'}
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
