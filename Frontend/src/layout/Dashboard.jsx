import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
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
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */
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
    /* Ã¢â€â‚¬Ã¢â€â‚¬ User Card Ã¢â€â‚¬Ã¢â€â‚¬ */
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
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Nav Ã¢â€â‚¬Ã¢â€â‚¬ */
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
    .dsb-chat-link { position: relative; }
    .dsb-chat-badge {
        margin-left: auto;
        min-width: 1.25rem;
        height: 1.25rem;
        padding: 0 0.35rem;
        border-radius: 999px;
        background: #ef4444;
        color: #fff;
        font-size: 0.68rem;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 2px #111827;
    }
    .dsb-chevron {
        font-size: 0.65rem;
        color: #6b7280;
        transition: transform 0.2s;
    }
    .dsb-chevron.open { transform: rotate(180deg); }
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Dropdown submenu Ã¢â€â‚¬Ã¢â€â‚¬ */
    .dsb-submenu {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.25s ease;
        padding-left: 1rem;
        border-left: 2px solid rgba(255,255,255,0.06);
        margin-left: 1.1rem;
    }
    .dsb-submenu.open { max-height: 200px; }
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Footer Ã¢â€â‚¬Ã¢â€â‚¬ */
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
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Main area Ã¢â€â‚¬Ã¢â€â‚¬ */
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
    .dsb-mobile-logout {
        display: none;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        border: 1px solid rgba(248,113,113,0.35);
        background: rgba(220,38,38,0.12);
        color: #fecaca;
        border-radius: 0.55rem;
        padding: 0.45rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
    }
    .dsb-mobile-logout:hover {
        background: rgba(220,38,38,0.22);
        color: #fff;
    }
    .dsb-chat-alert {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        max-width: min(360px, 46vw);
        border: 1px solid rgba(239,68,68,0.35);
        background: #fef2f2;
        color: #991b1b;
        border-radius: 999px;
        padding: 0.45rem 0.75rem;
        font-size: 0.78rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(0,0,0,0.18);
    }
    .dsb-chat-alert-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .dsb-chat-alert-count {
        min-width: 1.35rem;
        height: 1.35rem;
        border-radius: 999px;
        background: #ef4444;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        box-shadow: 0 0 0 2px #fff;
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
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Mobile sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */
    .dsb-sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 30;
    }
    @media (max-width: 768px) {
        .dsb-sidebar-overlay.open { display: block; }
        .dsb-sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(.4,0,.2,1);
            box-shadow: 4px 0 24px rgba(0,0,0,0.35);
        }
        .dsb-sidebar.mobile-open {
            transform: translateX(0);
        }
        .dsb-content { padding: 1rem; }
        .dsb-topbar { justify-content: space-between; padding: 0.7rem 1rem; }
        .dsb-chat-alert { max-width: 48vw; padding: 0.4rem 0.6rem; }
        .dsb-chat-alert-text { max-width: 30vw; }
        .dsb-mobile-logout { display: inline-flex; }
        .dsb-topbar-name { display: none; }
    }
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Hamburger button Ã¢â€â‚¬Ã¢â€â‚¬ */
    .dsb-hamburger {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.35rem;
        border-radius: 0.375rem;
        color: #f9fafb;
        transition: background 0.15s;
    }
    .dsb-hamburger:hover { background: rgba(255,255,255,0.08); }
    .dsb-hamburger svg { display: block; }
    @media (max-width: 768px) {
        .dsb-hamburger { display: flex; align-items: center; }
    }
`;

const Dashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const urlActual = location.pathname
    const { token, clearToken } = storeAuth()
    const { user, clearUser } = storeProfile()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [chatUnread, setChatUnread] = useState(0)
    const [lastChatSender, setLastChatSender] = useState('')

    const closeSidebar = () => setSidebarOpen(false)

    const displayName = user?.nombre || user?.nombrePropietario || "Usuario"
    const initial = displayName.charAt(0).toUpperCase()
    const isVendedor = user?.rol === "vendedor"
    const isCliente = user?.rol === "cliente"
    const isAdmin = user?.rol === "administrador"
    const miId = user?._id || user?.id

    const lc = (path) => `dsb-nav-link${urlActual === path ? ' active' : ''}`

    useEffect(() => {
        if (urlActual === '/dashboard/chat') {
            setChatUnread(0)
            setLastChatSender('')
        }
    }, [urlActual])

    useEffect(() => {
        if (!token || !user) return undefined
        const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '')
        if (!backendUrl) return undefined

        const sock = io(backendUrl, { auth: { token } })
        const registrarMensaje = (msg) => {
            if (!msg || msg.de?.id === miId || urlActual === '/dashboard/chat') return
            setChatUnread(prev => prev + 1)
            setLastChatSender(msg.de?.nombre || 'un contacto')
        }
        const aplicarResumenNoLeidos = ({ count = 0, lastSender = '' } = {}) => {
            if (urlActual === '/dashboard/chat') return
            setChatUnread(Number(count) || 0)
            setLastChatSender(lastSender || '')
        }

        sock.on('chat_unread_summary', aplicarResumenNoLeidos)
        sock.on('mensaje_de_staff', registrarMensaje)
        sock.on('mensaje_de_cliente', ({ msg }) => registrarMensaje(msg))

        return () => sock.disconnect()
    }, [token, user, miId, urlActual])

    return (
        <>
            <style>{styles}</style>
            <div className="dsb-layout">

                {/* Ã¢â€â‚¬Ã¢â€â‚¬ Overlay mÃƒÂ³vil Ã¢â€â‚¬Ã¢â€â‚¬ */}
                <div
                    className={`dsb-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
                    onClick={closeSidebar}
                />

                {/* Ã¢â€â‚¬Ã¢â€â‚¬ Sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */}
                <aside className={`dsb-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>

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

                        <Link to="/dashboard/perfil" className={lc('/dashboard/perfil')} onClick={closeSidebar}>
                            <span className="dsb-icon">👤</span> Perfil
                        </Link>

                        <Link
                            to="/dashboard/chat"
                            className={`${lc('/dashboard/chat')} dsb-chat-link`}
                            onClick={() => { closeSidebar(); setChatUnread(0); setLastChatSender(''); }}
                        >
                            <span className="dsb-icon">💬</span> Chat
                            {chatUnread > 0 && <span className="dsb-chat-badge">{chatUnread > 9 ? '9+' : chatUnread}</span>}
                        </Link>

                        {/* GestiÃƒÂ³n (admin + vendedor) */}
                        {(isVendedor || isAdmin) && (
                            <>
                                <span className="dsb-nav-section">Gestión</span>
                                <Link to="/dashboard/usuarios" className={lc('/dashboard/usuarios')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🗂️</span> Usuarios
                                </Link>
                            </>
                        )}

                        {/* Admin especÃƒÂ­fico */}
                        {isAdmin && (
                            <>
                                <Link to="/dashboard/productos-admin" className={lc('/dashboard/productos-admin')} onClick={closeSidebar}>
                                    <span className="dsb-icon">📦</span> Productos
                                </Link>
                                <Link to="/dashboard/notificaciones" className={lc('/dashboard/notificaciones')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🔔</span> Notificaciones
                                </Link>
                                <Link to="/dashboard/ventas" className={lc('/dashboard/ventas')} onClick={closeSidebar}>
                                    <span className="dsb-icon">📊</span> Ventas
                                </Link>
                            </>
                        )}

                        {/* Vendedor Ã¢â‚¬â€ productos + pedidos */}
                        {isVendedor && (
                            <>
                                <Link to="/dashboard/productos-admin" className={lc('/dashboard/productos-admin')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🧵</span> Productos
                                </Link>
                                <Link to="/dashboard/tienda" className={lc('/dashboard/tienda')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🏪</span> Tienda
                                </Link>
                                <Link to="/dashboard/carrito" className={lc('/dashboard/carrito')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🛒</span> Carrito
                                </Link>
                                <Link to="/dashboard/mis-pedidos" className={lc('/dashboard/mis-pedidos')} onClick={closeSidebar}>
                                    <span className="dsb-icon">📦</span> Gestión de pedidos
                                </Link>
                                <Link to="/dashboard/ventas" className={lc('/dashboard/ventas')} onClick={closeSidebar}>
                                    <span className="dsb-icon">📊</span> Ventas
                                </Link>
                            </>
                        )}

                        {/* Cliente especÃƒÂ­fico */}
                        {isCliente && (
                            <>
                                <span className="dsb-nav-section">Tienda</span>
                                <Link to="/dashboard/productos" className={lc('/dashboard/productos')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🧵</span> Productos
                                </Link>
                                <Link to="/dashboard/carrito" className={lc('/dashboard/carrito')} onClick={closeSidebar}>
                                    <span className="dsb-icon">🛒</span> Carrito
                                </Link>
                                <Link to="/dashboard/mis-pedidos" className={lc('/dashboard/mis-pedidos')} onClick={closeSidebar}>
                                    <span className="dsb-icon">📦</span> Mis pedidos
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Logout */}
                    <div className="dsb-sidebar-footer">
                        <button
                            className="btn-dsb-logout"
                            onClick={() => { clearToken(); clearUser(); navigate('/login'); }}
                        >
                            🚪 Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* Ã¢â€â‚¬Ã¢â€â‚¬ Main Ã¢â€â‚¬Ã¢â€â‚¬ */}
                <div className="dsb-main">
                    <header className="dsb-topbar">
                        {/* BotÃƒÂ³n hamburguesa (solo mÃƒÂ³vil) */}
                        <button
                            className="dsb-hamburger"
                            onClick={() => setSidebarOpen(o => !o)}
                            aria-label="Abrir menú"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                {sidebarOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6"/>
                                        <line x1="3" y1="12" x2="21" y2="12"/>
                                        <line x1="3" y1="18" x2="21" y2="18"/>
                                    </>
                                )}
                            </svg>
                        </button>
                        <button
                            className="dsb-mobile-logout"
                            type="button"
                            onClick={() => { clearToken(); clearUser(); navigate('/login'); }}
                        >
                            Cerrar sesión
                        </button>
                        {chatUnread > 0 && (
                            <button
                                className="dsb-chat-alert"
                                type="button"
                                onClick={() => { setChatUnread(0); setLastChatSender(''); navigate('/dashboard/chat'); }}
                                title="Ir al chat"
                            >
                                <span>💬</span>
                                <span className="dsb-chat-alert-text">Tienes un mensaje de {lastChatSender || 'un contacto'}</span>
                                <span className="dsb-chat-alert-count">{chatUnread > 9 ? '9+' : chatUnread}</span>
                            </button>
                        )}
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
