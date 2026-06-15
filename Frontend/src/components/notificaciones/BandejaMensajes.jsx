import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const bmStyles = `
.bm-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.bm-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
}
.bm-btn:hover { background: rgba(255,255,255,0.18); }
.bm-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 17px;
  height: 17px;
  background: #e8760a;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid #1f2937;
  pointer-events: none;
  z-index: 2;
}
.bm-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-height: 480px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.13);
  z-index: 9999;
}
.bm-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
}
.bm-panel-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.bm-ver-todas {
  font-size: 0.75rem;
  color: #e8760a;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.bm-ver-todas:hover { text-decoration: underline; }
.bm-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f9fafb;
  cursor: pointer;
  transition: background 0.15s;
}
.bm-item:hover { background: #fffbeb; }
.bm-item:last-child { border-bottom: none; }
.bm-item-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.bm-item-content { flex: 1; min-width: 0; }
.bm-item-titulo {
  font-size: 0.78rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bm-item-msg {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bm-item-fecha {
  font-size: 0.65rem;
  color: #9ca3af;
  margin: 0.2rem 0 0;
}
.bm-unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e8760a;
  flex-shrink: 0;
  margin-top: 4px;
}
.bm-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.82rem;
}
`;

/* ── Helpers Compartidos ────────────────────────────────────────── */
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

export default function BandejaMensajes() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const panelRef = useRef(null);

  const getToken = () => {
    try {
      return JSON.parse(localStorage.getItem('auth-token'))?.state?.token ?? null;
    } catch {
      return null;
    }
  };

  const getRol = () => {
    try {
      return JSON.parse(localStorage.getItem('auth-token'))?.state?.rol ?? null;
    } catch {
      return null;
    }
  };

  const fetchNotifs = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const rol = getRol();
      if (rol !== 'administrador' && rol !== 'vendedor') return;

      const endpoint = rol === 'vendedor'
        ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor?limite=6`
        : `${import.meta.env.VITE_BACKEND_URL}/notificaciones?limite=6`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.notificaciones || [];
      setNotifs(list);
      setTotalNoLeidas(list.filter(n => !n.leida).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setPanelAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDestinoNotif = (notif) => {
    if (!notif) return '/dashboard/ventas';

    // Stock → chat con admin
    if (notif.tipo === 'stock_critico' || notif.tipo === 'producto_reabastecido') {
      return '/dashboard/chat?destinatario=admin';
    }

    // Mensaje de cliente → chat con ese cliente
    if (notif.tipo === 'mensaje_chat') {
      const clienteId = notif.remitenteId || notif.clienteId || notif.datos?.clienteId || null;
      if (clienteId) {
        return `/dashboard/chat?clienteId=${clienteId}`;
      }
      return '/dashboard/chat';
    }

    // Cancelación → ventas
    if (notif.tipo === 'solicitud_cancelacion') {
      return '/dashboard/ventas';
    }

    return '/dashboard/ventas';
  };

  const handleClickNotif = async (notif) => {
    const rol = getRol();
    const destino = rol === 'administrador'
      ? '/dashboard/notificaciones'
      : getDestinoNotif(notif);

    navigate(destino);
    setPanelAbierto(false);

    if (notif && !notif.leida) {
      try {
        const token = getToken();
        const endpoint = rol === 'vendedor'
          ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor/${notif._id}/leida`
          : `${import.meta.env.VITE_BACKEND_URL}/notificaciones/${notif._id}/leida`;

        await fetch(endpoint, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotifs(prev => prev.map(n =>
          n._id === notif._id ? { ...n, leida: true } : n
        ));
        setTotalNoLeidas(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
  };

  const rol = getRol();
  if (rol !== 'administrador' && rol !== 'vendedor') return null;

  return (
    <div className="bm-wrap" ref={panelRef}>
      <style>{bmStyles}</style>
      <button className="bm-btn" onClick={() => setPanelAbierto(!panelAbierto)}>
        🔔
        {totalNoLeidas > 0 && (
          <span className="bm-badge">{totalNoLeidas > 9 ? '9+' : totalNoLeidas}</span>
        )}
      </button>

      {panelAbierto && (
        <div className="bm-panel">
          <div className="bm-panel-header">
            <p className="bm-panel-title">Notificaciones</p>
            {rol === 'administrador' && (
              <button className="bm-ver-todas" onClick={() => { navigate('/dashboard/notificaciones'); setPanelAbierto(false); }}>
                Ver todas →
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="bm-empty">Sin notificaciones recientes</div>
          ) : (
            notifs.map(n => (
              <div
                key={n._id}
                className="bm-item"
                onClick={() => handleClickNotif(n)}
              >
                <div className="bm-item-icon">{iconoNotif(n)}</div>
                <div className="bm-item-content">
                  <p className="bm-item-titulo">{tituloSegunTipo(n)}</p>
                  <p className="bm-item-msg">{n.mensaje}</p>
                  <p className="bm-item-fecha">{new Date(n.createdAt).toLocaleString('es-ES')}</p>
                </div>
                {!n.leida && <span className="bm-unread-dot" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
