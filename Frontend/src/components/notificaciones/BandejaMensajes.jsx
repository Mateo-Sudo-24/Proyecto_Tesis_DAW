import { useEffect, useRef, useState } from 'react';

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
    }
    .bm-bell-btn:hover { background: rgba(255,255,255,0.16); }

    .bm-badge {
        position: absolute;
        top: 2px; right: 2px;
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
    const [filtro, setFiltro] = useState('todas');
    const panelRef = useRef(null);

    const fetchNotifs = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones`, {
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

    const marcarLeida = async (id) => {
        try {
            const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}/leida`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setNotifs(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
        } catch { /* silencioso */ }
    };

    const gestionarPedido = async (id, decision) => {
        setGestionando(id);
        try {
            const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
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

    const noLeidas   = notifs.filter(n => !n.leida).length;
    const pendientes  = notifs.filter(necesitaGestion).length;
    const leidas      = notifs.filter(n => n.leida).length;
    const totalBadge  = noLeidas + pendientes;

    const notifsFiltradas = notifs.filter(n => {
        if (filtro === 'unread')  return !n.leida;
        if (filtro === 'pending') return necesitaGestion(n);
        if (filtro === 'read')    return n.leida;
        return true;
    });

    return (
        <>
            <style>{bmStyles}</style>
            <div className="bm-wrap" ref={panelRef}>
                {/* Campana */}
                <button
                    className="bm-bell-btn"
                    onClick={() => setAbierta(v => !v)}
                    title="Notificaciones"
                >
                    🔔
                    {totalBadge > 0 && (
                        <span className={`bm-badge${pendientes > 0 ? '' : ' orange'}`}>
                            {totalBadge > 9 ? '9+' : totalBadge}
                        </span>
                    )}
                </button>

                {/* Panel */}
                {abierta && (
                    <div className="bm-panel">
                        {/* Header — badges clicables como filtro */}
                        <div className="bm-panel-header">
                            <p className="bm-panel-title">Notificaciones</p>
                            <div className="bm-header-badges">
                                {noLeidas > 0 && (
                                    <button
                                        className={`bm-hbadge bm-hbadge-unread${filtro === 'unread' ? ' bm-hbadge-active' : ''}`}
                                        onClick={() => { setFiltro(filtro === 'unread' ? 'todas' : 'unread'); setExpandido(null); }}
                                        title="Filtrar sin leer"
                                    >
                                        {noLeidas} sin leer
                                    </button>
                                )}
                                {pendientes > 0 && (
                                    <button
                                        className={`bm-hbadge bm-hbadge-pending${filtro === 'pending' ? ' bm-hbadge-active' : ''}`}
                                        onClick={() => { setFiltro(filtro === 'pending' ? 'todas' : 'pending'); setExpandido(null); }}
                                        title="Filtrar pendientes"
                                    >
                                        {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bm-filters">
                            {[
                                { key: 'todas',   label: 'Todas',      count: notifs.length },
                                { key: 'unread',  label: 'Sin leer',   count: noLeidas },
                                { key: 'pending', label: 'Pendientes', count: pendientes },
                                { key: 'read',    label: 'Leídas',     count: leidas },
                            ].map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    className={`bm-filter-btn${filtro === key ? ` active-${key}` : ''}`}
                                    onClick={() => { setFiltro(key); setExpandido(null); }}
                                >
                                    {label}
                                    <span className="bm-filter-count">{count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Lista */}
                        <div className="bm-list">
                            {notifsFiltradas.length === 0 ? (
                                <div className="bm-empty">
                                    <div className="bm-empty-icon">🔕</div>
                                    <p>{notifs.length === 0 ? 'Sin notificaciones por ahora' : 'Sin resultados en este filtro'}</p>
                                </div>
                            ) : (
                                notifsFiltradas.map(n => {
                                    const estaExpandido  = expandido === n._id;
                                    const puedeGestionar = necesitaGestion(n);
                                    const itemClass = `bm-item${!n.leida ? ' unread' : puedeGestionar ? ' pending' : ' read'}`;

                                    return (
                                        <div key={n._id} className={itemClass}>
                                            {/* Cabecera */}
                                            <button
                                                className="bm-item-head"
                                                onClick={() => setExpandido(estaExpandido ? null : n._id)}
                                            >
                                                <span className="bm-item-icon">
                                                    {n.tipo === 'stock_critico' ? '⚠️' : '🔔'}
                                                </span>
                                                <div className="bm-item-info">
                                                    <div className="bm-item-tags">
                                                        {estadoTag(n.estadoGestion)}
                                                        {puedeGestionar && <span className="bm-tag bm-tag-accion">Acción requerida</span>}
                                                        {!n.leida && !puedeGestionar && <span className="bm-tag bm-tag-nueva">Nueva</span>}
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

                                                    {!n.leida && !puedeGestionar && (
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

                        {/* Footer */}
                        {notifs.length > 0 && (
                            <div className="bm-footer">
                                {notifs.length} notificación{notifs.length !== 1 ? 'es' : ''} en total
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
