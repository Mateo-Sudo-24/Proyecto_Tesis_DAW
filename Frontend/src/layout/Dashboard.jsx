import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useState } from 'react'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'
import BandejaMensajes from '../components/notificaciones/BandejaMensajes'
import intexIcon from '../assets/cutting.png'

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .dsb-layout {
        display: flex;
        min-height: 100vh;
    }
    /* ── Sidebar ── */
    .dsb-sidebar {
        width: 240px;
        min-width: 240px;
        background: #111827;
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        z-index: 20;
    }
    .dsb-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem 1.25rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        text-decoration: none;
    }
    .dsb-brand-icon {
        width: 42px;
        height: 42px;
        object-fit: contain;
        flex-shrink: 0;
        filter: drop-shadow(0 0 6px rgba(232,118,10,0.4));
    }
    .dsb-brand-name {
        font-size: 1.25rem;
        font-weight: 900;
        color: #fff;
        line-height: 1;
        margin: 0;
        letter-spacing: -0.02em;
    }
    .dsb-brand-name span { color: var(--orange-main); }
    .dsb-brand-sub {
        font-size: 0.65rem;
        color: #6b7280;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    /* ── User Card ── */
    .dsb-user-card {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .dsb-user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--orange-border);
        flex-shrink: 0;
    }
    .dsb-user-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: #f9fafb;
        margin: 0;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .dsb-user-role {
        font-size: 0.7rem;
        color: var(--orange-border);
        margin: 0;
        text-transform: capitalize;
        font-weight: 600;
    }
    /* ── Nav ── */
    .dsb-nav {
        flex: 1;
        padding: 0.75rem 0.625rem;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }
    .dsb-nav-section {
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #4b5563;
        font-weight: 700;
        padding: 0.75rem 0.5rem 0.25rem;
    }
    .dsb-nav-link {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.58rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #9ca3af;
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
    }
    .dsb-nav-link:hover {
        background: rgba(255,255,255,0.06);
        color: #f3f4f6;
    }
    .dsb-nav-link.active {
        background: rgba(232,118,10,0.13);
        color: var(--orange-main);
        border-left: 3px solid var(--orange-main);
        padding-left: calc(0.75rem - 3px);
    }
    .dsb-nav-link-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    .dsb-nav-link-inner {
        display: flex;
        align-items: center;
        gap: 0.65rem;
    }
    .dsb-icon { font-size: 1rem; line-height: 1; }
    .dsb-chevron {
        font-size: 0.65rem;
        color: #6b7280;
        transition: transform 0.2s;
    }
    .dsb-chevron.open { transform: rotate(180deg); }
    /* ── Dropdown submenu ── */
    .dsb-submenu {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.25s ease;
        padding-left: 1rem;
        border-left: 2px solid rgba(255,255,255,0.06);
        margin-left: 1.1rem;
    }
    .dsb-submenu.open { max-height: 200px; }
    /* ── Footer ── */
    .dsb-sidebar-footer {
        padding: 0.875rem 0.625rem;
        border-top: 1px solid rgba(255,255,255,0.07);
    }
    .btn-dsb-logout {
        width: 100%;
        padding: 0.6rem 1rem;
        background: rgba(220,38,38,0.08);
        color: #f87171;
        border: 1px solid rgba(220,38,38,0.18);
        border-radius: 0.5rem;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }
    .btn-dsb-logout:hover {
        background: rgba(220,38,38,0.18);
        color: #fca5a5;
    }
    /* ── Main area ── */
    .dsb-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: #f3f4f6;
        overflow: hidden;
    }
    .dsb-topbar {
        background: #1f2937;
        padding: 0.7rem 1.75rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 2px 10px rgba(0,0,0,0.22);
    }
    .dsb-topbar-user {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .dsb-topbar-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--orange-border);
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
    }
    .dsb-topbar-avatar:hover {
        transform: scale(1.08);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.35);
    }
    .dsb-topbar-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: #f9fafb;
    }
    .dsb-content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
    }
    .dsb-footer {
        background: #1f2937;
        text-align: center;
        padding: 0.75rem;
        font-size: 0.75rem;
        color: #9ca3af;
        letter-spacing: 0.03em;
        border-top: 1px solid rgba(255,255,255,0.06);
    }
    @media (max-width: 768px) {
        .dsb-sidebar { display: none; }
        .dsb-content { padding: 1rem; }
    }
`;

const Dashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const urlActual = location.pathname
    const { clearToken } = storeAuth()
    const { user } = storeProfile()
    const [gestionOpen, setGestionOpen] = useState(false)

    const displayName = user?.nombre || user?.nombrePropietario || "Usuario"
    const initial = displayName.charAt(0).toUpperCase()
    const isVendedor = user?.rol === "vendedor"
    const isCliente = user?.rol === "cliente"
    const isAdmin = user?.rol === "administrador"

    const lc = (path) => `dsb-nav-link${urlActual === path ? ' active' : ''}`

    const gestionActive = urlActual === '/dashboard/listar' || urlActual === '/dashboard/crear'

    return (
        <>
            <style>{styles}</style>
            <div className="dsb-layout">

                {/* ── Sidebar ── */}
                <aside className="dsb-sidebar">

                    {/* Brand */}
                    <div className="dsb-brand">
                        <img src={intexIcon} alt="Intex Textiles" className="dsb-brand-icon" />
                        <div>
                            <p className="dsb-brand-name"><span>IN</span>TEX</p>
                            <p className="dsb-brand-sub">Textiles</p>
                        </div>
                    </div>

                    {/* User card */}
                    <div className="dsb-user-card">
                        <div className="dsb-user-avatar">{initial}</div>
                        <div style={{overflow:'hidden'}}>
                            <p className="dsb-user-name">{displayName}</p>
                            <p className="dsb-user-role">{user?.rol}</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="dsb-nav">
                        <span className="dsb-nav-section">Principal</span>

                        <Link to="/dashboard" className={lc('/dashboard')}>
                            <span className="dsb-icon">👤</span> Perfil
                        </Link>

                        <Link to="/dashboard/chat" className={lc('/dashboard/chat')}>
                            <span className="dsb-icon">💬</span> Chat
                        </Link>

                        {/* Gestión (dropdown — admin + vendedor) */}
                        {(isVendedor || isAdmin) && (
                            <>
                                <span className="dsb-nav-section">Gestión</span>
                                <button
                                    className={`dsb-nav-link${gestionActive ? ' active' : ''}`}
                                    onClick={() => setGestionOpen(o => !o)}
                                >
                                    <div className="dsb-nav-link-row">
                                        <div className="dsb-nav-link-inner">
                                            <span className="dsb-icon">🗂️</span> Usuarios
                                        </div>
                                        <span className={`dsb-chevron${gestionOpen ? ' open' : ''}`}>▼</span>
                                    </div>
                                </button>
                                <div className={`dsb-submenu${gestionOpen ? ' open' : ''}`}>
                                    <Link to="/dashboard/listar" className={lc('/dashboard/listar')}>
                                        <span className="dsb-icon">📋</span> Listar
                                    </Link>
                                    <Link to="/dashboard/crear" className={lc('/dashboard/crear')}>
                                        <span className="dsb-icon">➕</span> Crear
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Admin específico */}
                        {isAdmin && (
                            <>
                                <Link to="/dashboard/productos-admin" className={lc('/dashboard/productos-admin')}>
                                    <span className="dsb-icon">📦</span> Productos
                                </Link>
                                <Link to="/dashboard/notificaciones" className={lc('/dashboard/notificaciones')}>
                                    <span className="dsb-icon">🔔</span> Notificaciones
                                </Link>
                            </>
                        )}

                        {/* Cliente específico */}
                        {isCliente && (
                            <>
                                <span className="dsb-nav-section">Tienda</span>
                                <Link to="/dashboard/productos" className={lc('/dashboard/productos')}>
                                    <span className="dsb-icon">🧵</span> Productos
                                </Link>
                                <Link to="/dashboard/carrito" className={lc('/dashboard/carrito')}>
                                    <span className="dsb-icon">🛒</span> Carrito
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Logout */}
                    <div className="dsb-sidebar-footer">
                        <button
                            className="btn-dsb-logout"
                            onClick={() => { clearToken(); navigate('/login'); }}
                        >
                            🚪 Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="dsb-main">
                    <header className="dsb-topbar">
                        <div className="dsb-topbar-user">
                            <span className="dsb-topbar-name">{displayName}</span>
                            <div
                                className="dsb-topbar-avatar"
                                onClick={() => navigate('/dashboard')}
                                title="Ir al perfil"
                            >{initial}</div>
                        </div>
                        <BandejaMensajes />
                    </header>
                    <main className="dsb-content">
                        <Outlet />
                    </main>
                    <footer className="dsb-footer">
                        © {new Date().getFullYear()} Intex Textiles — Todos los derechos reservados
                    </footer>
                </div>

            </div>
        </>
    )
}

export default Dashboard
