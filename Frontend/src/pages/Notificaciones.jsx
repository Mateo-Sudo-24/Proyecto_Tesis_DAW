import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const styles = `
.notif-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  min-height: 100%;
}

/* Header */
.notif-header {
  background: #1f2937;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.notif-header-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #f59e0b;
  margin: 0 0 0.15rem;
}
.notif-header-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}

/* Filtros pills */
.notif-filtros {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.notif-filtro-btn {
  padding: 0.38rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.notif-filtro-btn:hover { border-color: #e8760a; color: #c4620a; }
.notif-filtro-btn.activo {
  background: #1f2937;
  color: #f59e0b;
  border-color: #1f2937;
}
.notif-filtro-count {
  font-size: 0.65rem;
  background: rgba(0,0,0,0.1);
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  margin-left: 0.25rem;
}

/* TICKET CARD */
.notif-ticket {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  margin-bottom: 0.55rem;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  transition: box-shadow 0.15s;
}
.notif-ticket:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.09); }

.notif-ticket-header {
  display: flex;
  cursor: pointer;
}

/* Franja lateral */
.notif-stripe {
  width: 5px;
  flex-shrink: 0;
}
.stripe-automatizacion { background: linear-gradient(180deg, #e8760a, #c4620a); }
.stripe-pago           { background: linear-gradient(180deg, #16a34a, #15803d); }
.stripe-info           { background: linear-gradient(180deg, #3b82f6, #1d4ed8); }
.stripe-chat           { background: linear-gradient(180deg, #8b5cf6, #6d28d9); }

/* Cuerpo del ticket */
.notif-ticket-body {
  flex: 1;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.notif-ticket-icono {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.notif-ticket-info { flex: 1; min-width: 0; }
.notif-ticket-fila {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
  flex-wrap: wrap;
}
.notif-tipo-badge {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
}
.tipo-automatizacion { background: #fde8ce; color: #c4620a; }
.tipo-pago           { background: #d1fae5; color: #065f46; }
.tipo-info           { background: #dbeafe; color: #1e40af; }
.tipo-chat           { background: #ede9fe; color: #6d28d9; }
.notif-unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e8760a;
  flex-shrink: 0;
}
.notif-ticket-msg {
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-ticket-fecha {
  font-size: 0.68rem;
  color: #9ca3af;
  margin: 0.15rem 0 0;
}

/* Acciones rápidas derecha */
.notif-ticket-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.75rem;
  flex-shrink: 0;
}
.notif-estado-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
}
.badge-atendida   { background: #fef3c7; color: #92400e; }
.badge-finalizada { background: #d1fae5; color: #065f46; }
.notif-chevron {
  font-size: 0.72rem;
  color: #9ca3af;
}

/* Expandido */
.notif-ticket-expanded {
  padding: 0.65rem 1rem 0.85rem 1.4rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}
.notif-expanded-texto {
  font-size: 0.82rem;
  color: #374151;
  line-height: 1.55;
  margin: 0 0 0.65rem;
}
.notif-productos-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
  margin: 0 0 0.35rem;
}
.notif-producto-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.4rem;
  padding: 0.4rem 0.65rem;
  margin-bottom: 0.3rem;
  font-size: 0.78rem;
}
.notif-producto-nombre { font-weight: 700; color: #111827; }
.notif-producto-stock  { font-weight: 900; color: #dc2626; }
.notif-acciones-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
.notif-btn-atender,
.notif-btn-finalizar,
.notif-btn-rechazar,
.notif-btn-leer,
.notif-btn-eliminar {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border-radius: 0.45rem;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 800;
  transition: all 0.15s;
}
.notif-btn-atender   { background: #fef3c7; color: #92400e; }
.notif-btn-atender:hover { background: #fde68a; }
.notif-btn-finalizar { background: #16a34a; color: #fff; }
.notif-btn-finalizar:hover { background: #15803d; }
.notif-btn-rechazar  { background: #dc2626; color: #fff; }
.notif-btn-rechazar:hover  { background: #b91c1c; }
.notif-btn-leer      { background: #dbeafe; color: #1e40af; }
.notif-btn-leer:hover { background: #bfdbfe; }
.notif-btn-eliminar  { background: #fee2e2; color: #991b1b; }
.notif-btn-eliminar:hover { background: #fecaca; }
.notif-btn-atender:disabled,
.notif-btn-finalizar:disabled,
.notif-btn-rechazar:disabled { opacity: 0.5; cursor: not-allowed; }

/* Vacío */
.notif-empty {
  background: #fff;
  border: 2px dashed #e5e7eb;
  border-radius: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Spinner */
.notif-spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 14rem;
  background: #fff;
  border-radius: 0.75rem;
  gap: 0.75rem;
}
.notif-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #fde8ce;
  border-top-color: #e8760a;
  border-radius: 50%;
  animation: notif-spin 0.7s linear infinite;
}
@keyframes notif-spin { to { transform: rotate(360deg); } }

/* PAGINACIÓN */
.notif-paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.75rem 0 0.25rem;
  flex-wrap: wrap;
}
.notif-pag-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 0.45rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0 0.5rem;
}
.notif-pag-btn:hover:not(:disabled):not(.activo) {
  background: #fffbeb;
  border-color: #e8760a;
  color: #c4620a;
}
.notif-pag-btn.activo {
  background: #1f2937;
  color: #f59e0b;
  border-color: #1f2937;
  pointer-events: none;
}
.notif-pag-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .notif-page { padding: 0.75rem 0.5rem; }
  .notif-ticket-msg { white-space: normal; }
  .notif-acciones-row { flex-direction: column; }
}
`;

/* ── Helpers ──────────────────────────────────────────────────── */
const esNotifInfo = (n) =>
  n.tipo === 'pago_completado' || n.tipo === 'mensaje_chat';

const clasificarNotif = (n) => {
  if (n.tipo === 'pago_completado') return 'pago';
  if (n.tipo === 'mensaje_chat') return 'chat';
  if (n.tipo === 'producto_reabastecido') return 'info';
  return 'automatizacion';
};

const tituloSegunTipo = (n) => ({
  stock_critico:          'Stock Crítico',
  producto_reabastecido:  'Producto Reabastecido',
  orden_creada:           'Nuevo Pedido',
  confirmacion_pedido:    'Confirmación de Pedido',
  pago_completado:        'Pago Recibido (Stripe)',
  mensaje_chat:           'Nuevo Mensaje',
  solicitud_cancelacion:  'Solicitud de Cancelación',
  orden_cancelada:        'Pedido Cancelado',
})[n.tipo] || 'Notificación';

const iconoNotif = (n) => ({
  stock_critico:         '⚠️',
  producto_reabastecido: '📦',
  orden_creada:          '🛒',
  confirmacion_pedido:   '✅',
  pago_completado:       '💳',
  mensaje_chat:          '💬',
  solicitud_cancelacion: '❌',
  orden_cancelada:       '🚫',
})[n.tipo] || '🔔';

const ITEMS_POR_PAGINA = 8;
const VENTANA = 3;

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filtro, setFiltro]                 = useState('todas');
  const [expandido, setExpandido]           = useState(null);
  const [gestionando, setGestionando]       = useState(null);
  const [paginaActual, setPaginaActual]     = useState(1);

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
    setPaginaActual(1);
    setExpandido(null);
  };

  const toggleExpandido = (id) => setExpandido(prev => prev === id ? null : id);

  const eliminarNotificacion = async (e, id) => {
    if (e) e.stopPropagation();
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

  const marcarLeida = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/notificaciones/${id}/leida`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotificaciones(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
        toast.success('Marcada como leída');
      }
    } catch { toast.error('Error al marcar como leída'); }
  };

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
        toast.success('Notificación marcada como atendida');
      } else {
        toast.error('No se pudo marcar como atendida');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setGestionando(null); }
  };

  const gestionarPedido = async (id, decision) => {
    setGestionando(id);
    const endpoint = decision === 'aprobar' ? 'aprobar' : 'rechazar';
    try {
      const res = await fetch(`${backendUrl}/notificaciones/${id}/${endpoint}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const nuevoEstado = decision === 'aprobar' ? 'completado' : 'rechazado';
        setNotificaciones(prev =>
          prev.map(n => n._id === id ? { ...n, estadoGestion: nuevoEstado, leida: true } : n)
        );
        setExpandido(null);
        toast.success(decision === 'aprobar' ? 'Notificación finalizada' : 'Notificación rechazada');
      } else {
        toast.error(`Error al ${decision === 'aprobar' ? 'finalizar' : 'rechazar'}`);
      }
    } catch { toast.error('Error de conexión'); }
    finally { setGestionando(null); }
  };

  // ── Filtrado ──
  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'atendidas') return !esNotifInfo(n) && (n.estadoGestion === 'pendiente' || n.estadoGestion === 'aprobado');
    if (filtro === 'finalizadas') return !esNotifInfo(n) && (n.estadoGestion === 'completado' || n.estadoGestion === 'rechazado');
    return true;
  });

  // ── Paginación ──
  const totalPaginas = Math.ceil(notificacionesFiltradas.length / ITEMS_POR_PAGINA);

  const calcularVentana = () => {
    let inicio = Math.max(1, paginaActual - 1);
    let fin = Math.min(totalPaginas, inicio + VENTANA - 1);
    inicio = Math.max(1, fin - VENTANA + 1);
    const paginas = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  };

  const notifsPagina = notificacionesFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  if (loading) {
    return (
      <div className="notif-page">
        <style>{styles}</style>
        <div className="notif-spinner-wrap">
          <div className="notif-spinner" />
          <p style={{ fontSize:'0.85rem', color:'#9ca3af' }}>Cargando notificaciones…</p>
        </div>
      </div>
    );
  }

  const atendidasCount  = notificaciones.filter(n => !esNotifInfo(n) && (n.estadoGestion === 'pendiente' || n.estadoGestion === 'aprobado')).length;
  const finalizadasCount = notificaciones.filter(n => !esNotifInfo(n) && (n.estadoGestion === 'completado' || n.estadoGestion === 'rechazado')).length;

  return (
    <div className="notif-page">
      <style>{styles}</style>

      {/* Cabecera */}
      <div className="notif-header">
        <div>
          <p className="notif-header-title">Notificaciones</p>
          <p className="notif-header-sub">
            {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="notif-filtros">
        {[
          { key: 'todas',       label: 'Todas',       count: notificaciones.length },
          { key: 'atendidas',   label: 'Atendidas',   count: atendidasCount },
          { key: 'finalizadas', label: 'Finalizadas', count: finalizadasCount },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => cambiarFiltro(key)}
            className={`notif-filtro-btn${filtro === key ? ' activo' : ''}`}
          >
            {label}
            <span className="notif-filtro-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {notifsPagina.length === 0 ? (
        <div className="notif-empty">
          No hay notificaciones en esta categoría.
        </div>
      ) : (
        notifsPagina.map(notif => {
          const isExpandido = expandido === notif._id;
          const clase = clasificarNotif(notif);

          return (
            <div key={notif._id} className="notif-ticket">
              <div className="notif-ticket-header" onClick={() => toggleExpandido(notif._id)}>
                <div className={`notif-stripe stripe-${clase}`} />
                <div className="notif-ticket-body">
                  <div className="notif-ticket-icono">{iconoNotif(notif)}</div>
                  <div className="notif-ticket-info">
                    <div className="notif-ticket-fila">
                      <span className={`notif-tipo-badge tipo-${clase}`}>
                        {notif.tipo.replace('_', ' ')}
                      </span>
                      {!notif.leida && <span className="notif-unread-dot" />}
                    </div>
                    <p className="notif-ticket-msg">{notif.mensaje}</p>
                    <p className="notif-ticket-fecha">
                      {new Date(notif.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="notif-ticket-actions">
                    {!esNotifInfo(notif) && notif.estadoGestion === 'pendiente' && notif.leida && (
                      <span className="notif-estado-badge badge-atendida">Atendida</span>
                    )}
                    {!esNotifInfo(notif) && (notif.estadoGestion === 'completado' || notif.estadoGestion === 'aprobado') && (
                      <span className="notif-estado-badge badge-finalizada">Finalizada</span>
                    )}
                    <span className="notif-chevron">{isExpandido ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>

              {isExpandido && (
                <div className="notif-ticket-expanded">
                  <p className="notif-expanded-texto">{notif.mensaje}</p>

                  {notif.productos?.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <p className="notif-productos-label">Productos afectados</p>
                      {notif.productos.map((p, i) => (
                        <div key={i} className="notif-producto-fila">
                          <span className="notif-producto-nombre">{p.nombre}</span>
                          <span className="notif-producto-stock">{p.stock} rollos</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="notif-acciones-row">
                    {!esNotifInfo(notif) && !notif.leida && (
                      <button
                        className="notif-btn-atender"
                        onClick={() => pasarAPendiente(notif._id)}
                        disabled={gestionando === notif._id}
                      >
                        Marcar como atendida
                      </button>
                    )}
                    {!esNotifInfo(notif) && notif.leida && notif.estadoGestion === 'pendiente' && (
                      <>
                        <button
                          className="notif-btn-finalizar"
                          onClick={() => gestionarPedido(notif._id, 'aprobar')}
                          disabled={gestionando === notif._id}
                        >
                          ✓ Finalizar
                        </button>
                        <button
                          className="notif-btn-rechazar"
                          onClick={() => gestionarPedido(notif._id, 'rechazar')}
                          disabled={gestionando === notif._id}
                        >
                          ✗ Rechazar
                        </button>
                      </>
                    )}
                    {esNotifInfo(notif) && !notif.leida && (
                      <button
                        className="notif-btn-leer"
                        onClick={() => marcarLeida(notif._id)}
                      >
                        Marcar como leída
                      </button>
                    )}
                    {(notif.estadoGestion === 'completado' || notif.estadoGestion === 'rechazado' || notif.estadoGestion === 'aprobado' || (esNotifInfo(notif) && notif.leida)) && (
                      <button
                        className="notif-btn-eliminar"
                        onClick={(e) => eliminarNotificacion(e, notif._id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="notif-paginacion">
          <button
            className="notif-pag-btn"
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            ←
          </button>

          {calcularVentana().map(num => (
            <button
              key={num}
              className={`notif-pag-btn${paginaActual === num ? ' activo' : ''}`}
              onClick={() => setPaginaActual(num)}
            >
              {num}
            </button>
          ))}

          <button
            className="notif-pag-btn"
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
