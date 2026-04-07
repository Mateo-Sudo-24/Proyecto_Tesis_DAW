import { useEffect, useState } from 'react';

export default function BandejaMensajes() {
  const [notifs, setNotifs] = useState([]);
  const [abierta, setAbierta] = useState(false);

  const fetchNotifs = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
      
      const res = await fetch(`${backendUrl}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error(`❌ Error ${res.status} al obtener notificaciones`);
        return;
      }
      
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : data.notificaciones || []);
    } catch (error) {
      console.error('❌ Error fetching notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const intervalo = setInterval(fetchNotifs, 30000); // polling cada 30s
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
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="relative">
      {/* Botón campana */}
      <button onClick={() => setAbierta(!abierta)}
        className="relative p-2 rounded-full hover:bg-gray-100">
        <span className="text-xl">🔔</span>
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {noLeidas}
          </span>
        )}
      </button>

      {/* Panel bandeja */}
      {abierta && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border border-gray-200 z-50">
          <div className="p-4 border-b font-semibold text-gray-700 flex justify-between">
            <span>Bandeja de notificaciones</span>
            <span className="text-sm text-gray-400">{noLeidas} sin leer</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 && (
              <p className="p-4 text-gray-400 text-sm">Sin notificaciones</p>
            )}
            {notifs.map(n => (
              <div key={n._id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!n.leida ? 'bg-amber-50' : ''}`}
                onClick={() => marcarLeida(n._id)}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{n.mensaje}</p>
                    <div className="mt-2 space-y-1">
                      {n.productos?.map((p, i) => (
                        <div key={i} className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                          <span className="font-medium">{p.nombre}</span> — Stock: {p.stock} unidades
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.leida && <span className="w-2 h-2 bg-amber-500 rounded-full mt-1 flex-shrink-0"/>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}