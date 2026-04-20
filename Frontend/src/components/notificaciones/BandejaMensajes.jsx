import { useEffect, useState } from 'react';

const necesitaGestion = (n) =>
  n.tipo === 'stock_critico' && (!n.estadoGestion || n.estadoGestion === 'pendiente');

const estadoLabel = (estado) => {
  if (estado === 'aprobado')
    return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Aprobado ✓</span>;
  if (estado === 'rechazado')
    return <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Rechazado ✗</span>;
  if (estado === 'completado')
    return <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Completado</span>;
  return null;
};

export default function BandejaMensajes() {
  const [notifs, setNotifs] = useState([]);
  const [abierta, setAbierta] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [gestionando, setGestionando] = useState(null);

  const fetchNotifs = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

      const res = await fetch(`${backendUrl}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : data.notificaciones || []);
    } catch (error) {
      console.error('❌ Error fetching notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const intervalo = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const marcarLeida = async (id) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

      const res = await fetch(`${backendUrl}/notificaciones/${id}/leida`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
      }
    } catch (error) {
      console.error('❌ Error marcar leída:', error);
    }
  };

  const gestionarPedido = async (id, decision) => {
    setGestionando(id);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

      const res = await fetch(`${backendUrl}/notificaciones/${id}/${decision}`, {
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
    } catch (error) {
      console.error(`❌ Error al ${decision} pedido:`, error);
    } finally {
      setGestionando(null);
    }
  };

  const noLeidas = notifs.filter(n => !n.leida).length;
  const pendientes = notifs.filter(necesitaGestion).length;

  return (
    <div className="relative">
      {/* Botón campana */}
      <button
        onClick={() => setAbierta(!abierta)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <span className="text-xl">🔔</span>
        {(noLeidas > 0 || pendientes > 0) && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {noLeidas || pendientes}
          </span>
        )}
      </button>

      {/* Panel bandeja */}
      {abierta && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border border-gray-200 z-50">
          <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
            <span>Notificaciones</span>
            <div className="flex gap-2 text-xs">
              {noLeidas > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{noLeidas} sin leer</span>}
              {pendientes > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendientes} pendiente{pendientes > 1 ? 's' : ''}</span>}
            </div>
          </div>

          <div className="max-h-[32rem] overflow-y-auto divide-y divide-gray-100">
            {notifs.length === 0 && (
              <p className="p-4 text-gray-400 text-sm text-center">Sin notificaciones</p>
            )}

            {notifs.map(n => {
              const estaExpandido = expandido === n._id;
              const puedeGestionar = necesitaGestion(n);

              return (
                <div
                  key={n._id}
                  className={`${!n.leida ? 'bg-amber-50' : puedeGestionar ? 'bg-orange-50' : 'bg-white'}`}
                >
                  {/* Cabecera clicable */}
                  <button
                    onClick={() => setExpandido(estaExpandido ? null : n._id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">
                      {n.tipo === 'stock_critico' ? '⚠️' : '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        {estadoLabel(n.estadoGestion)}
                        {puedeGestionar && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Acción requerida</span>
                        )}
                        {!n.leida && !puedeGestionar && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Nueva</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{n.mensaje}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs mt-1 flex-shrink-0">
                      {estaExpandido ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Contenido expandido */}
                  {estaExpandido && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm text-gray-700 mb-3">{n.mensaje}</p>

                      {/* Productos */}
                      {n.productos && n.productos.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Productos afectados</p>
                          {n.productos.map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                              <div>
                                <span className="font-medium text-gray-800">{p.nombre}</span>
                                {p.descripcion && <span className="text-gray-400 ml-1">· {p.descripcion}</span>}
                              </div>
                              <span className="font-bold text-red-600">{p.stock} uds</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botones aprobar/rechazar */}
                      {puedeGestionar && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => gestionarPedido(n._id, 'aprobar')}
                            disabled={gestionando === n._id}
                            className="flex-1 text-xs font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            {gestionando === n._id ? 'Procesando…' : '✓ Confirmar pedido'}
                          </button>
                          <button
                            onClick={() => gestionarPedido(n._id, 'rechazar')}
                            disabled={gestionando === n._id}
                            className="flex-1 text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            {gestionando === n._id ? 'Procesando…' : '✗ Rechazar'}
                          </button>
                        </div>
                      )}

                      {/* Marcar leída */}
                      {!n.leida && !puedeGestionar && (
                        <button
                          onClick={() => marcarLeida(n._id)}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

