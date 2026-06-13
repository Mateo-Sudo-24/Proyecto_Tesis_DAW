import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const bmSimpleStyles = `
    .bm-wrap { position: relative; display: inline-flex; align-items: center; }
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
`;

export default function BandejaMensajes() {
    const navigate = useNavigate();
    const [totalBadge, setTotalBadge] = useState(0);

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

    useEffect(() => {
        const fetchConteo = async () => {
            try {
                const token = getToken();
                if (!token) return;
                const rol = getRol();
                const endpoint = rol === 'vendedor'
                    ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/vendedor`
                    : rol === 'cliente'
                        ? `${import.meta.env.VITE_BACKEND_URL}/notificaciones/cliente`
                        : `${import.meta.env.VITE_BACKEND_URL}/notificaciones`;
                const res = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                const notifs = Array.isArray(data) ? data : data.notificaciones || [];
                setTotalBadge(notifs.filter(n => !n.leida).length);
            } catch {
                /* silencioso */
            }
        };

        fetchConteo();
        const id = setInterval(fetchConteo, 15000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <style>{bmSimpleStyles}</style>
            <div className="bm-wrap">
                <button
                    className="bm-bell-btn"
                    onClick={() => navigate('/dashboard/notificaciones')}
                    title={`${totalBadge} notificacion${totalBadge !== 1 ? 'es' : ''} sin leer`}
                    type="button"
                >
                    🔔
                </button>
                {totalBadge > 0 && (
                    <span className="bm-badge">{totalBadge > 9 ? '9+' : totalBadge}</span>
                )}
            </div>
        </>
    );
}
