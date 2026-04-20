import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { MdMarkEmailRead, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';

const TIPO_LABELS = {
  stock_critico: '⚠️ Stock Crítico',
  orden_creada: '🛒 Orden Creada',
  pago_completado: '💳 Pago Completado',
  envio_listo: '📦 Envío Listo',
  solicitud_cancelacion: '❌ Cancelación',
};

const estadoBadge = (estado) => {
  if (estado === 'aprobado')
    return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Aprobado ✓</span>;
  if (estado === 'rechazado')
    return <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Rechazado ✗</span>;
  if (estado === 'completado')
    return <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Completado</span>;
  if (estado === 'pendiente')
    return <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pendiente</span>;
  return null;
};

const necesitaGestion = (notif) =>
  notif.tipo === 'stock_critico' &&
  (!notif.estadoGestion || notif.estadoGestion === 'pendiente');

const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const [expandido, setExpandido] = useState(null); // id de la notif expandida
    const [gestionando, setGestionando] = useState(null); // id en proceso

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchNotificaciones = async () => {
        try {
            const res = await fetch(`${backendUrl}/notificaciones`, {
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

    useEffect(() => {
        if (token) fetchNotificaciones();
    }, [token]);

    const toggleExpandido = (id) => {
        setExpandido(prev => prev === id ? null : id);
    };

    const marcarComoLeida = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}/leida`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev =>
                    prev.map(n => n._id === id ? { ...n, leida: true } : n)
                );
                toast.success('Notificación marcada como leída');
            }
        } catch {
            toast.error('Error al actualizar notificación');
        }
    };

    const eliminarNotificacion = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev => prev.filter(n => n._id !== id));
                if (expandido === id) setExpandido(null);
                toast.success('Notificación eliminada');
            }
        } catch {
            toast.error('Error al eliminar notificación');
        }
    };

    const gestionarPedido = async (id, decision) => {
        setGestionando(id);
        try {
            const res = await fetch(`${backendUrl}/notificaciones/${id}/${decision}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const nuevoEstado = decision === 'aprobar' ? 'aprobado' : 'rechazado';
                setNotificaciones(prev =>
                    prev.map(n => n._id === id ? { ...n, estadoGestion: nuevoEstado, leida: true } : n)
                );
                toast.success(decision === 'aprobar' ? '✅ Pedido aprobado' : '❌ Pedido rechazado');
            } else {
                toast.error(`Error al ${decision === 'aprobar' ? 'aprobar' : 'rechazar'} el pedido`);
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setGestionando(null);
        }
    };

    const notificacionesFiltradas = notificaciones.filter(notif => {
        if (filtro === 'leidas') return notif.leida;
        if (filtro === 'no-leidas') return !notif.leida;
        if (filtro === 'pendientes') return necesitaGestion(notif);
        return true;
    });

    const pendientesCount = notificaciones.filter(necesitaGestion).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-600">Cargando notificaciones...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <h1 className="text-3xl font-bold text-amber-900 mb-6">Notificaciones</h1>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { key: 'todas', label: `Todas (${notificaciones.length})` },
                    { key: 'no-leidas', label: `No leídas (${notificaciones.filter(n => !n.leida).length})` },
                    { key: 'pendientes', label: `Pendientes de acción (${pendientesCount})`, highlight: pendientesCount > 0 },
                    { key: 'leidas', label: `Leídas (${notificaciones.filter(n => n.leida).length})` },
                ].map(({ key, label, highlight }) => (
                    <button
                        key={key}
                        onClick={() => setFiltro(key)}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                            filtro === key
                                ? 'bg-amber-900 text-white'
                                : highlight
                                ? 'bg-amber-100 text-amber-800 border border-amber-400 hover:bg-amber-200'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {notificacionesFiltradas.length === 0 ? (
                <div className="bg-gray-100 rounded-xl p-10 text-center">
                    <p className="text-gray-500 text-lg">No hay notificaciones en esta categoría</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notificacionesFiltradas.map(notif => {
                        const estaExpandido = expandido === notif._id;
                        const puedeGestionar = necesitaGestion(notif);

                        return (
                            <div
                                key={notif._id}
                                className={`rounded-xl shadow-sm border transition-all ${
                                    !notif.leida
                                        ? 'bg-amber-50 border-amber-300'
                                        : puedeGestionar
                                        ? 'bg-orange-50 border-orange-300'
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                {/* Cabecera clicable */}
                                <button
                                    onClick={() => toggleExpandido(notif._id)}
                                    className="w-full text-left p-4 flex items-center gap-3"
                                >
                                    <span className="text-xl flex-shrink-0">
                                        {notif.tipo === 'stock_critico' ? '⚠️' : '🔔'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {TIPO_LABELS[notif.tipo] || notif.tipo || 'Notificación'}
                                            </span>
                                            {estadoBadge(notif.estadoGestion)}
                                            {!notif.leida && (
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    Nueva
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                                            {notif.mensaje}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {notif.createdAt
                                                ? new Date(notif.createdAt).toLocaleString('es-ES')
                                                : 'Fecha no disponible'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Acciones rápidas */}
                                        {!notif.leida && (
                                            <span
                                                role="button"
                                                onClick={(e) => marcarComoLeida(e, notif._id)}
                                                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                title="Marcar como leída"
                                            >
                                                <MdMarkEmailRead size={18} />
                                            </span>
                                        )}
                                        <span
                                            role="button"
                                            onClick={(e) => eliminarNotificacion(e, notif._id)}
                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            title="Eliminar"
                                        >
                                            <MdDelete size={18} />
                                        </span>
                                        {estaExpandido
                                            ? <MdExpandLess size={22} className="text-gray-400" />
                                            : <MdExpandMore size={22} className="text-gray-400" />
                                        }
                                    </div>
                                </button>

                                {/* Contenido expandido */}
                                {estaExpandido && (
                                    <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                                        {/* Mensaje completo */}
                                        <p className="text-sm text-gray-700 mb-3">{notif.mensaje}</p>

                                        {/* Productos afectados */}
                                        {notif.productos && notif.productos.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                                    Productos con stock crítico
                                                </p>
                                                <div className="space-y-2">
                                                    {notif.productos.map((p, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                                                                {p.descripcion && (
                                                                    <p className="text-xs text-gray-500">{p.descripcion}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-red-600">{p.stock} uds</p>
                                                                {p.umbral && (
                                                                    <p className="text-xs text-gray-400">umbral: {p.umbral}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Botones de aprobación — solo si es stock_critico y sin gestionar */}
                                        {puedeGestionar && (
                                            <div className="flex gap-3 mt-2">
                                                <button
                                                    onClick={() => gestionarPedido(notif._id, 'aprobar')}
                                                    disabled={gestionando === notif._id}
                                                    className="flex-1 py-2 px-4 text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                                                >
                                                    {gestionando === notif._id ? 'Procesando…' : '✓ Confirmar pedido de reposición'}
                                                </button>
                                                <button
                                                    onClick={() => gestionarPedido(notif._id, 'rechazar')}
                                                    disabled={gestionando === notif._id}
                                                    className="flex-1 py-2 px-4 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                                                >
                                                    {gestionando === notif._id ? 'Procesando…' : '✗ Rechazar'}
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
        </div>
    );
};

export default Notificaciones;
