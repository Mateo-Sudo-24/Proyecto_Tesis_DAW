import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { MdMarkEmailRead, MdDelete } from 'react-icons/md';

const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas'); // 'todas', 'leidas', 'no-leidas'

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

    // Cargar notificaciones
    const fetchNotificaciones = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones`, {
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
        if (token) {
            fetchNotificaciones();
        }
    }, [token]);

    // Marcar como leída
    const marcarComoLeida = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}/leida`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev =>
                    prev.map(n => n._id === id ? { ...n, leida: true } : n)
                );
                toast.success('Notificación marcada como leída');
            }
        } catch (error) {
            toast.error('Error al actualizar notificación');
        }
    };

    // Eliminar notificación
    const eliminarNotificacion = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notificaciones/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotificaciones(prev => prev.filter(n => n._id !== id));
                toast.success('Notificación eliminada');
            }
        } catch (error) {
            toast.error('Error al eliminar notificación');
        }
    };

    // Filtrar notificaciones
    const notificacionesFiltradas = notificaciones.filter(notif => {
        if (filtro === 'leidas') return notif.leida;
        if (filtro === 'no-leidas') return !notif.leida;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Cargando notificaciones...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <h1 className="text-3xl font-bold text-amber-900 mb-6">Notificaciones</h1>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFiltro('todas')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filtro === 'todas'
                            ? 'bg-amber-900 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    Todas ({notificaciones.length})
                </button>
                <button
                    onClick={() => setFiltro('no-leidas')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filtro === 'no-leidas'
                            ? 'bg-amber-900 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    No leídas ({notificaciones.filter(n => !n.leida).length})
                </button>
                <button
                    onClick={() => setFiltro('leidas')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        filtro === 'leidas'
                            ? 'bg-amber-900 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    Leídas ({notificaciones.filter(n => n.leida).length})
                </button>
            </div>

            {/* Lista de notificaciones */}
            {notificacionesFiltradas.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600 text-lg">No hay notificaciones</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notificacionesFiltradas.map(notif => (
                        <div
                            key={notif._id}
                            className={`p-4 border-l-4 rounded-lg shadow transition ${
                                notif.leida
                                    ? 'bg-gray-50 border-gray-400'
                                    : 'bg-blue-50 border-blue-500'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 mb-2">
                                        {notif.tipo || 'Notificación'}
                                    </h3>
                                    <p className="text-gray-700 mb-2">{notif.mensaje}</p>
                                    <span className="text-xs text-gray-500">
                                        {notif.createdAt
                                            ? new Date(notif.createdAt).toLocaleString('es-ES')
                                            : 'Fecha no disponible'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {!notif.leida && (
                                        <button
                                            onClick={() => marcarComoLeida(notif._id)}
                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                            title="Marcar como leída"
                                        >
                                            <MdMarkEmailRead size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => eliminarNotificacion(notif._id)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        title="Eliminar"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notificaciones;
