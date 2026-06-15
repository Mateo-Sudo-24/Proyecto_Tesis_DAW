import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const styles = `
.notif-page {
  padding: 1.25rem 1.5rem;
  min-height: 100%;
}

/* Título */
.notif-titulo {
  font-size: 1.4rem;
  font-weight: 900;
  color: #111827;
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.notif-titulo::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.3rem;
  background: #e8760a;
  border-radius: 2px;
}

/* Pills de filtro */
.notif-filtros {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
}
.notif-pill {
  padding: 0.38rem 1rem;
  border-radius: 999px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.notif-pill:hover {
  border-color: #e8760a;
  color: #c4620a;
}
.notif-pill.activo {
  background: #1f2937;
  color: #f59e0b;
  border-color: #1f2937;
}
.notif-pill-count {
  font-size: 0.65rem;
  background: rgba(0,0,0,0.12);
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  margin-left: 0.2rem;
}

/* GRID 3 columnas */
.notif-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* CARD */
.notif-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.15s, transform 0.12s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.notif-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* Franja superior de color según tipo */
.notif-card-stripe {
  height: 5px;
  width: 100%;
  flex-shrink: 0;
}
.stripe-automatizacion { background: linear-gradient(90deg, #e8760a, #c4620a); }
.stripe-pago           { background: linear-gradient(90deg, #16a34a, #15803d); }
.stripe-info           { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.stripe-chat           { background: linear-gradient(90deg, #8b5cf6, #6d28d9); }

/* Cuerpo de la card */
.notif-card-body {
  padding: 1rem 1.1rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.notif-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.notif-card-icono {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.notif-card-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
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
.notif-estado-badge {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
}
.badge-atendida   { background: #fef3c7; color: #92400e; }
.badge-finalizada { background: #d1fae5; color: #065f46; }
.notif-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8760a;
  margin-top: 0.3rem;
}

/* Título y mensaje */
.notif-card-titulo {
  font-size: 0.88rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.notif-card-msg {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.notif-card-fecha {
  font-size: 0.68rem;
  color: #9ca3af;
  margin: 0;
}

/* Productos afectados dentro de la card */
.notif-card-productos {
  margin-top: 0.25rem;
}
.notif-card-productos-label {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
  margin: 0 0 0.3rem;
}
.notif-card-producto-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.35rem;
  padding: 0.3rem 0.55rem;
  margin-bottom: 0.2rem;
  font-size: 0.72rem;
}
.notif-card-prod-nombre { font-weight: 700; color: #111827; }
.notif-card-prod-stock  { font-weight: 900; color: #dc2626; }

/* Footer de la card con botones */
.notif-card-footer {
  padding: 0.65rem 1.1rem 0.85rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.4rem;
}
.notif-btn {
  flex: 1;
  padding: 0.42rem 0.5rem;
  border-radius: 0.4rem;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  transition: all 0.15s;
}
.notif-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.notif-btn-atender   { background: #fef3c7; color: #92400e; }
.notif-btn-atender:hover:not(:disabled) { background: #fde68a; }
.notif-btn-finalizar { background: #16a34a; color: #fff; }
.notif-btn-finalizar:hover:not(:disabled) { background: #15803d; }
.notif-btn-rechazar  { background: #dc2626; color: #fff; }
.notif-btn-rechazar:hover:not(:disabled)  { background: #b91c1c; }
.notif-btn-leer      { background: #dbeafe; color: #1e40af; }
.notif-btn-leer:hover:not(:disabled) { background: #bfdbfe; }
.notif-btn-eliminar  { background: #fee2e2; color: #991b1b; }
.notif-btn-eliminar:hover:not(:disabled) { background: #fecaca; }

/* Estado vacío */
.notif-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 1rem;
  color: #9ca3af;
  font-size: 0.88rem;
  background: #fff;
  border: 2px dashed #e5e7eb;
  border-radius: 0.875rem;
}

/* Spinner */
.notif-spinner-wrap {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
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
  gap: 0.35rem;
  padding: 0.5rem 0 0.25rem;
}
.notif-pag-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 0.5rem;
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

@media (max-width: 900px) {
  .notif-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .notif-grid { grid-template-columns: 1fr; }
  .notif-page { padding: 0.75rem 0.5rem; }
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

const ITEMS_POR_PAGINA = 6;

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filtro, setFiltro]                 = useState('todas');
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

  const eliminarNotificacion = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${backendUrl}/notificaciones/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotificaciones(prev => prev.filter(n => n._id !== id));
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
        toast.success(decision === 'aprobar' ? 'Notificación finalizada' : 'Notificación rechazada');
      } else {
        toast.error(`Error al ${decision === 'aprobar' ? 'finalizar' : 'rechazar'}`);
      }
    } catch { toast.error('Error de conexión'); }
    finally { setGestionando(null); }
  };

  // ── Filtrado ──
  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'atendidas')   return !esNotifInfo(n) && n.leida && ['pendiente','aprobado'].includes(n.estadoGestion);
    if (filtro === 'finalizadas') return !esNotifInfo(n) && ['completado','rechazado'].includes(n.estadoGestion);
    return true;
  });

  // ── Paginación ──
  const totalPaginas = Math.ceil(notificacionesFiltradas.length / ITEMS_POR_PAGINA);

  const calcularVentana = () => {
    let inicio = Math.max(1, paginaActual - 1);
    let fin = Math.min(totalPaginas, inicio + 2);
    inicio = Math.max(1, fin - 2);
    const paginas = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  };

  const notifsPagina = notificacionesFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  return (
    <>
      <style>{styles}</style>
      <div className="notif-page">

        <h1 className="notif-titulo">Notificaciones</h1>

        {/* Pills de filtro */}
        <div className="notif-filtros">
          {[
            { key: 'todas',       label: 'Todas',       count: notificaciones.length },
            { key: 'atendidas',   label: 'Atendidas',   count: notificaciones.filter(n => !esNotifInfo(n) && ['pendiente','aprobado'].includes(n.estadoGestion) && n.leida).length },
            { key: 'finalizadas', label: 'Finalizadas', count: notificaciones.filter(n => !esNotifInfo(n) && ['completado','rechazado'].includes(n.estadoGestion)).length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              className={`notif-pill${filtro === key ? ' activo' : ''}`}
              onClick={() => { setFiltro(key); setPaginaActual(1); }}
            >
              {label}
              <span className="notif-pill-count">{count}</span>
            </button>
          ))}
        </div>

        {/* Grid de cards */}
        <div className="notif-grid">
          {loading ? (
            <div className="notif-spinner-wrap">
              <div className="notif-spinner" />
            </div>
          ) : notifsPagina.length === 0 ? (
            <div className="notif-empty">
              No hay notificaciones en esta sección
            </div>
          ) : (
            notifsPagina.map(notif => {
              const clasificacion = clasificarNotif(notif);
              const esInfo = esNotifInfo(notif);
              const sinLeer = !notif.leida;
              const esAtendida = !esInfo && notif.leida && ['pendiente','aprobado'].includes(notif.estadoGestion);
              const esFinalizada = !esInfo && ['completado','rechazado'].includes(notif.estadoGestion);

              return (
                <div key={notif._id} className="notif-card">

                  {/* Franja de color superior */}
                  <div className={`notif-card-stripe stripe-${clasificacion}`} />

                  {/* Cuerpo */}
                  <div className="notif-card-body">
                    <div className="notif-card-header">
                      <div className="notif-card-icono">{iconoNotif(notif)}</div>
                      <div className="notif-card-badges">
                        <span className={`notif-tipo-badge tipo-${clasificacion}`}>
                          {clasificacion === 'automatizacion' ? 'Automatización'
                            : clasificacion === 'pago' ? 'Pago'
                            : clasificacion === 'chat' ? 'Chat'
                            : 'Info'}
                        </span>
                        {sinLeer && <span className="notif-unread-dot" title="Sin leer" />}
                        {esAtendida && <span className="notif-estado-badge badge-atendida">Atendida</span>}
                        {esFinalizada && <span className="notif-estado-badge badge-finalizada">Finalizada</span>}
                      </div>
                    </div>

                    <p className="notif-card-titulo">{tituloSegunTipo(notif)}</p>
                    <p className="notif-card-msg">{notif.mensaje}</p>
                    <p className="notif-card-fecha">
                      {new Date(notif.createdAt).toLocaleString('es-ES')}
                    </p>

                    {/* Productos afectados si existen */}
                    {notif.productos?.length > 0 && (
                      <div className="notif-card-productos">
                        <p className="notif-card-productos-label">Productos afectados</p>
                        {notif.productos.map((p, i) => (
                          <div key={i} className="notif-card-producto-fila">
                            <span className="notif-card-prod-nombre">{p.nombre}</span>
                            <span className="notif-card-prod-stock">{p.stock} rollos</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer con botones de acción */}
                  <div className="notif-card-footer">
                    {/* Sin leer y es de automatización → marcar como atendida */}
                    {!esInfo && sinLeer && (
                      <button className="notif-btn notif-btn-atender" onClick={() => pasarAPendiente(notif._id)}>
                        Marcar atendida
                      </button>
                    )}
                    {/* Atendida → finalizar o rechazar */}
                    {esAtendida && (
                      <>
                        <button
                          className="notif-btn notif-btn-finalizar"
                          disabled={gestionando === notif._id}
                          onClick={() => gestionarPedido(notif._id, 'aprobar')}
                        >
                          {gestionando === notif._id ? '...' : '✓ Finalizar'}
                        </button>
                        <button
                          className="notif-btn notif-btn-rechazar"
                          disabled={gestionando === notif._id}
                          onClick={() => gestionarPedido(notif._id, 'rechazar')}
                        >
                          {gestionando === notif._id ? '...' : '✗ Rechazar'}
                        </button>
                      </>
                    )}
                    {/* Info (Stripe/chat) sin leer → solo marcar leída */}
                    {esInfo && sinLeer && (
                      <button className="notif-btn notif-btn-leer" onClick={() => marcarLeida(notif._id)}>
                        Marcar como leída
                      </button>
                    )}
                    {/* Finalizada → eliminar */}
                    {esFinalizada && (
                      <button className="notif-btn notif-btn-eliminar" onClick={e => eliminarNotificacion(e, notif._id)}>
                        Eliminar
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Paginación con ventana deslizante ← 1 2 3 → */}
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
    </>
  );
};

export default Notificaciones;
