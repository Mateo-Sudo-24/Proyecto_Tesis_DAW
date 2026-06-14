import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

/* ── Helpers ──────────────────────────────────────────────────── */
const esNotifInfo = (n) =>
  n.tipo === 'pago_completado' || n.tipo === 'mensaje_chat';

const clasificarNotif = (n) => {
  if (n.tipo === 'pago_completado') return 'pago';
  if (n.tipo === 'mensaje_chat') return 'chat';
  if (n.tipo === 'producto_reabastecido') return 'info';
  if (n.tipo === 'solicitud_cancelacion' || n.tipo === 'orden_cancelada') return 'automatizacion';
  return 'automatizacion';
};

const TITULOS_NOTIF = {
  stock_critico:         '⚠️ Stock Crítico',
  producto_reabastecido: '📦 Producto Reabastecido',
  orden_creada:          '🛒 Nuevo Pedido',
  confirmacion_pedido:   '✅ Confirmación de Pedido',
  pago_completado:       '💳 Pago Recibido (Stripe)',
  mensaje_chat:          '💬 Nuevo Mensaje',
  solicitud_cancelacion: '❌ Solicitud de Cancelación',
  orden_cancelada:       '🚫 Pedido Cancelado',
};

const tituloSegunTipo = (n) => TITULOS_NOTIF[n.tipo] || '🔔 Notificación';

const iconoNotif = (n) => tituloSegunTipo(n).split(' ')[0];

const ITEMS_POR_PAGINA = 10;

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

  // ── Conteos ──
  const atendidasCount  = notificaciones.filter(n => !esNotifInfo(n) && (n.estadoGestion === 'pendiente' || n.estadoGestion === 'aprobado')).length;
  const finalizadasCount = notificaciones.filter(n => !esNotifInfo(n) && (n.estadoGestion === 'completado' || n.estadoGestion === 'rechazado')).length;

  // ── Filtrado ──
  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'atendidas') return !esNotifInfo(n) && (n.estadoGestion === 'pendiente' || n.estadoGestion === 'aprobado');
    if (filtro === 'finalizadas') return !esNotifInfo(n) && (n.estadoGestion === 'completado' || n.estadoGestion === 'rechazado');
    return true;
  });

  // ── Paginación ──
  const totalPaginas    = Math.ceil(notificacionesFiltradas.length / ITEMS_POR_PAGINA);
  const paginaActual    = Math.min(pagina, Math.max(1, totalPaginas));
  const notifsPagina    = notificacionesFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <Typography className="mt-4 text-gray-600">Cargando notificaciones…</Typography>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="bg-gray-900 rounded-xl p-6 text-white mb-6 flex justify-between items-center shadow-lg">
          <div>
            <Typography variant="h4" className="text-orange-400 font-bold">Notificaciones</Typography>
            <Typography className="text-gray-400 text-sm">
              {notificaciones.length} notificación{notificaciones.length !== 1 ? 'es' : ''} en total
            </Typography>
          </div>
          {atendidasCount > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 text-center">
              <Typography variant="h5" className="text-orange-400 leading-none">{atendidasCount}</Typography>
              <Typography className="text-[10px] uppercase font-bold text-orange-400 mt-1">Atendidas</Typography>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'todas',      label: 'Todas',       count: notificaciones.length },
            { key: 'atendidas',  label: 'Atendidas',   count: atendidasCount },
            { key: 'finalizadas', label: 'Finalizadas', count: finalizadasCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => cambiarFiltro(key)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border ${
                filtro === key
                ? 'bg-gray-900 text-orange-400 border-gray-900 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${filtro === key ? 'bg-gray-800 text-orange-400' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {notifsPagina.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <Typography className="text-4xl mb-4">🔔</Typography>
            <Typography variant="h6" color="blue-gray">No hay notificaciones</Typography>
            <Typography className="text-gray-500 text-sm">Cuando haya actividad, aparecerá aquí.</Typography>
          </div>
        ) : (
          <div className="space-y-3">
            {notifsPagina.map(notif => {
              const estaExpandido = expandido === notif._id;
              const tipoClase = clasificarNotif(notif);

              return (
                <Card key={notif._id} className="shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <CardBody className="p-4 cursor-pointer" onClick={() => toggleExpandido(notif._id)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{iconoNotif(notif)}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-500`}>
                        {notif.tipo.replace('_', ' ')}
                      </span>
                      {!notif.leida && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}

                      {!esNotifInfo(notif) && notif.estadoGestion === 'pendiente' && notif.leida && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">Atendida</span>
                      )}
                      {!esNotifInfo(notif) && (notif.estadoGestion === 'completado' || notif.estadoGestion === 'aprobado') && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">Finalizada</span>
                      )}
                      {!esNotifInfo(notif) && notif.estadoGestion === 'rechazado' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">Rechazada</span>
                      )}
                    </div>

                    <Typography variant="h6" color="blue-gray" className="mb-1">
                      {tituloSegunTipo(notif)}
                    </Typography>
                    <Typography className="text-sm text-gray-600 line-clamp-2">
                      {notif.mensaje}
                    </Typography>
                    <Typography className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                      {new Date(notif.createdAt).toLocaleString('es-ES')}
                    </Typography>
                  </CardBody>

                  {estaExpandido && (
                    <CardFooter className="p-4 pt-0 border-t border-gray-50 bg-gray-50/30">
                      <Typography className="text-sm text-gray-700 py-3 leading-relaxed">
                        {notif.mensaje}
                      </Typography>

                      {notif.productos?.length > 0 && (
                        <div className="mb-4 bg-white rounded-lg border border-gray-100 p-3">
                          <Typography className="text-[10px] font-black uppercase text-gray-400 mb-2">Productos afectados</Typography>
                          {notif.productos.map((p, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                              <Typography className="text-sm font-bold text-gray-800">{p.nombre}</Typography>
                              <Typography className="text-sm font-black text-red-600">{p.stock} rollos</Typography>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {/* Flujo n8n: Sin leer -> Atendida */}
                        {!esNotifInfo(notif) && !notif.leida && (
                          <Button
                            size="sm"
                            color="amber"
                            className="flex-1"
                            onClick={() => pasarAPendiente(notif._id)}
                            disabled={gestionando === notif._id}
                          >
                            Marcar como atendida
                          </Button>
                        )}

                        {/* Flujo n8n: Atendida -> Finalizar/Rechazar */}
                        {!esNotifInfo(notif) && notif.leida && notif.estadoGestion === 'pendiente' && (
                          <>
                            <Button
                              size="sm"
                              color="green"
                              className="flex-1"
                              onClick={() => gestionarPedido(notif._id, 'aprobar')}
                              disabled={gestionando === notif._id}
                            >
                              ✓ Finalizar
                            </Button>
                            <Button
                              size="sm"
                              color="red"
                              className="flex-1"
                              onClick={() => gestionarPedido(notif._id, 'rechazar')}
                              disabled={gestionando === notif._id}
                            >
                              ✗ Rechazar
                            </Button>
                          </>
                        )}

                        {/* Informativas: Solo marcar leída */}
                        {esNotifInfo(notif) && !notif.leida && (
                          <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            className="flex-1"
                            onClick={() => marcarLeida(notif._id)}
                          >
                            Marcar como leída
                          </Button>
                        )}

                        {/* Eliminar (solo si ya está finalizada o es informativa leída) */}
                        {(notif.estadoGestion === 'completado' || notif.estadoGestion === 'rechazado' || notif.estadoGestion === 'aprobado' || (esNotifInfo(notif) && notif.leida)) && (
                          <Button
                            size="sm"
                            variant="text"
                            color="red"
                            className="ml-auto"
                            onClick={(e) => eliminarNotificacion(e, notif._id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="text"
              size="sm"
              onClick={() => { setPagina(p => Math.max(1, p - 1)); setExpandido(null); }}
              disabled={paginaActual === 1}
              className="text-gray-600"
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    paginaActual === i + 1
                    ? 'bg-gray-900 text-orange-400 shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => { setPagina(i + 1); setExpandido(null); }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="text"
              size="sm"
              onClick={() => { setPagina(p => Math.min(totalPaginas, p + 1)); setExpandido(null); }}
              disabled={paginaActual === totalPaginas}
              className="text-gray-600"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;
