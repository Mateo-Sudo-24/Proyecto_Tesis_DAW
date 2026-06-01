import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { io } from 'socket.io-client';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';

const styles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── Layout general ── */
    .ch-wrap {
        display: flex;
        height: calc(100vh - 130px);
        min-height: 480px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 32px rgba(0,0,0,0.13);
        background: #fff;
        border: 1px solid #e5e7eb;
    }

    /* ── Sidebar de contactos ── */
    .ch-sidebar {
        width: 270px;
        flex-shrink: 0;
        background: #1f2937;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #374151;
    }
    .ch-sidebar-header {
        padding: 1.1rem 1.2rem 0.9rem;
        background: #111827;
        border-bottom: 1px solid #374151;
    }
    .ch-sidebar-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: #f9fafb;
        margin: 0 0 0.15rem;
        letter-spacing: 0.01em;
    }
    .ch-sidebar-sub {
        font-size: 0.72rem;
        color: #9ca3af;
        margin: 0;
    }
    .ch-contacts {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem 0;
    }
    .ch-contacts::-webkit-scrollbar { width: 4px; }
    .ch-contacts::-webkit-scrollbar-track { background: transparent; }
    .ch-contacts::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

    /* Grupos en sidebar */
    .ch-group-label {
        padding: 0.45rem 1rem 0.2rem;
        font-size: 0.66rem;
        font-weight: 800;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.07em;
    }

    .ch-contact {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.7rem 1rem;
        cursor: pointer;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        transition: background 0.15s;
        border-left: 3px solid transparent;
    }
    .ch-contact:hover { background: rgba(255,255,255,0.06); }
    .ch-contact.active {
        background: rgba(232,118,10,0.15);
        border-left-color: var(--orange-main);
    }
    .ch-contact-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
    }
    .ch-contact-avatar.staff-avatar { background: #374151; }
    .ch-contact-online {
        position: absolute;
        bottom: 1px; right: 1px;
        width: 9px; height: 9px;
        border-radius: 50%;
        border: 2px solid #1f2937;
    }
    .ch-contact-online.online  { background: #22c55e; }
    .ch-contact-online.offline { background: #6b7280; }
    .ch-contact-info { overflow: hidden; }
    .ch-contact-name {
        font-size: 0.82rem;
        font-weight: 700;
        color: #f9fafb;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .ch-contact-role {
        font-size: 0.68rem;
        color: #9ca3af;
        text-transform: capitalize;
    }
    .ch-no-contacts {
        padding: 2rem 1rem;
        text-align: center;
        color: #6b7280;
        font-size: 0.8rem;
    }

    /* ── Panel de conversación ── */
    .ch-conv {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #f9fafb;
        min-width: 0;
    }
    .ch-conv-header {
        padding: 0.85rem 1.25rem;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .ch-conv-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .ch-conv-avatar.staff-avatar { background: #374151; }
    .ch-conv-name {
        font-size: 0.9rem;
        font-weight: 700;
        color: #111827;
    }
    .ch-conv-status {
        font-size: 0.7rem;
        color: #22c55e;
        font-weight: 600;
    }
    .ch-conv-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        gap: 0.75rem;
    }
    .ch-conv-placeholder-icon { font-size: 3rem; }
    .ch-conv-placeholder p { font-size: 0.9rem; margin: 0; }

    /* ── Mensajes ── */
    .ch-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }
    .ch-messages::-webkit-scrollbar { width: 5px; }
    .ch-messages::-webkit-scrollbar-track { background: transparent; }
    .ch-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

    .ch-msg-row {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
    }
    .ch-msg-row.own { flex-direction: row-reverse; }

    .ch-msg-mini-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .ch-msg-mini-avatar.staff-mini { background: #374151; }

    .ch-msg-bubble-wrap { max-width: 65%; display: flex; flex-direction: column; }
    .ch-msg-row.own .ch-msg-bubble-wrap { align-items: flex-end; }

    .ch-msg-sender {
        font-size: 0.68rem;
        font-weight: 700;
        color: #6b7280;
        margin-bottom: 0.2rem;
        padding: 0 0.25rem;
    }
    .ch-msg-bubble {
        padding: 0.55rem 0.9rem;
        border-radius: 16px;
        font-size: 0.84rem;
        line-height: 1.45;
        word-break: break-word;
    }
    .ch-msg-bubble.other {
        background: #fff;
        color: #111827;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 4px;
    }
    .ch-msg-bubble.own {
        background: var(--orange-main);
        color: #fff;
        border-bottom-right-radius: 4px;
    }
    .ch-msg-time {
        font-size: 0.62rem;
        color: #9ca3af;
        padding: 0 0.25rem;
        margin-top: 0.2rem;
    }

    /* ── Input de mensaje ── */
    .ch-input-area {
        padding: 0.85rem 1.25rem;
        background: #fff;
        border-top: 1px solid #e5e7eb;
    }
    .ch-input-row {
        display: flex;
        gap: 0.6rem;
        align-items: flex-end;
    }
    .ch-input {
        flex: 1;
        padding: 0.65rem 1rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 24px;
        font-size: 0.88rem;
        color: #111827;
        outline: none;
        background: #f9fafb;
        transition: border-color 0.15s;
        resize: none;
        min-height: 42px;
        max-height: 100px;
        line-height: 1.4;
        font-family: inherit;
    }
    .ch-input:focus { border-color: var(--orange-main); background: #fff; }
    .ch-send-btn {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
        transition: background 0.15s, transform 0.1s;
        box-shadow: 0 2px 8px rgba(232,118,10,0.35);
    }
    .ch-send-btn:hover { background: var(--orange-dark); transform: scale(1.05); }
    .ch-send-btn:disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; transform: none; }

    /* ── Botón volver (solo móvil) ── */
    .ch-back-btn { display: none; }

    @media (max-width: 700px) {
        .ch-wrap {
            height: calc(100svh - 70px);
            min-height: 0;
            border-radius: 0;
            border-left: none;
            border-right: none;
        }
        /* Sidebar ocupa toda la pantalla en móvil */
        .ch-sidebar { width: 100%; }
        .ch-sidebar.mobile-hidden { display: none; }
        /* Conversación oculta hasta seleccionar contacto */
        .ch-conv.mobile-hidden { display: none; }
        /* Botón ← visible en móvil */
        .ch-back-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px; height: 34px;
            border: none;
            background: #f3f4f6;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.1rem;
            color: #374151;
            flex-shrink: 0;
        }
        .ch-back-btn:hover { background: #e5e7eb; }
        /* Burbujas más anchas en móvil */
        .ch-msg-bubble-wrap { max-width: 82%; }
        .ch-messages { padding: 0.75rem; }
        .ch-input-area { padding: 0.65rem 0.75rem; }
        .ch-conv-header { padding: 0.7rem 0.85rem; }
    }
`;

const Chat = () => {
    const { user } = storeProfile();
    const { token } = storeAuth();

    const [socket, setSocket] = useState(null);
    const [usuarios, setUsuarios] = useState([]);           // todos los usuarios verificados (para staff)
    const [vendedores, setVendedores] = useState([]);        // vendedores activos (para clientes)
    const [onlineIds, setOnlineIds] = useState(new Set());  // IDs conectados al socket
    const [clienteActivo, setClienteActivo] = useState(null);  // contacto activo para staff
    const [contactoActivo, setContactoActivo] = useState(null); // contacto activo para cliente (null = soporte)
    const [conversaciones, setConversaciones] = useState({});        // mensajes staff: { userId: [] }
    const [conversacionesCliente, setConversacionesCliente] = useState({}); // mensajes cliente: { contactId: [] }
    const [showConversacion, setShowConversacion] = useState(false);
    const [vistoIds, setVistoIds] = useState(new Set()); // IDs de contactos que han visto mis mensajes

    const { register, handleSubmit, reset, watch } = useForm();
    const msgText = watch('mensaje', '');
    const messagesEndRef = useRef(null);

    const miId    = user?._id || user?.id;
    const miRol   = user?.rol;
    const miNombre = user?.nombre || 'Yo';
    const isStaff  = miRol === 'administrador' || miRol === 'vendedor';

    // Fusionar usuarios con estado online del socket
    const usuariosConEstado = usuarios.map(u => ({ ...u, online: onlineIds.has(u.id) }));

    // Scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversaciones, conversacionesCliente, clienteActivo, contactoActivo]);

    // Cargar usuarios verificados via HTTP al montar (staff)
    useEffect(() => {
        if (!token || !isStaff) return;
        const headers = { Authorization: `Bearer ${token}` };
        fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/usuarios-chat`, { headers })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setUsuarios(data); })
            .catch(() => {});
    }, [token, isStaff]);

    // Cargar vendedores activos via HTTP al montar (cliente)
    useEffect(() => {
        if (!token || isStaff) return;
        const headers = { Authorization: `Bearer ${token}` };
        fetch(`${import.meta.env.VITE_BACKEND_URL}/vendedores/publicos`, { headers })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setVendedores(data); })
            .catch(() => {});
    }, [token, isStaff]);

    // Conexión al socket
    useEffect(() => {
        if (!token) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL.replace('/api', '');
        const sock = io(backendUrl, { auth: { token } });
        setSocket(sock);

        // Staff: recibir lista de IDs online (extraer IDs del arreglo)
        sock.on('lista_usuarios', (lista) => {
            setOnlineIds(new Set(lista.filter(u => u.online).map(u => u.id)));
        });

        // Staff: recibir mensaje de un cliente o vendedor
        sock.on('mensaje_de_cliente', ({ clienteId, msg }) => {
            setConversaciones(prev => ({
                ...prev,
                [clienteId]: [...(prev[clienteId] || []), msg],
            }));
        });

        // Staff: recibir historial al seleccionar usuario
        sock.on('historial_chat', ({ clienteId, historial }) => {
            setConversaciones(prev => ({ ...prev, [clienteId]: historial }));
        });

        // Cliente: recibir respuesta de soporte o vendedor
        sock.on('mensaje_de_staff', (msg) => {
            const contactId = msg.de?.id || 'soporte';
            setConversacionesCliente(prev => ({
                ...prev,
                [contactId]: [...(prev[contactId] || []), msg]
            }));
        });

        // Alguien vio mis mensajes
        sock.on('visto_por', ({ de }) => {
            setVistoIds(prev => new Set([...prev, de]));
        });

        return () => sock.disconnect();
    }, [token]);

    // Emitir marcar_visto cuando hay mensajes del otro y yo los estoy viendo
    useEffect(() => {
        if (!socket) return;
        const contactId = isStaff ? clienteActivo?.id : (contactoActivo?.id || null);
        if (!contactId) return;
        const msgs = isStaff ? (conversaciones[contactId] || []) : (conversacionesCliente[contactId] || []);
        const hayMsgDelOtro = msgs.some(m => m.de?.id !== miId);
        if (hayMsgDelOtro) socket.emit('marcar_visto', { para: contactId });
    }, [conversaciones, conversacionesCliente, clienteActivo, contactoActivo, socket]);

    // Cuando el staff selecciona un cliente, pedir historial
    const seleccionarCliente = (cliente) => {
        setClienteActivo(cliente);
        socket?.emit('solicitar_historial', { clienteId: cliente.id });
        setShowConversacion(true); // en móvil, mostrar conversación
    };

    // Enviar mensaje
    const enviar = ({ mensaje }) => {
        if (!mensaje?.trim() || !socket) return;
        reset({ mensaje: '' });

        if (isStaff) {
            if (!clienteActivo) return;
            socket.emit('mensaje_staff', { para: clienteActivo.id, texto: mensaje.trim() });
        } else {
            const contactId = contactoActivo?.id || 'soporte';
            socket.emit('mensaje_cliente', { texto: mensaje.trim(), para: contactoActivo?.id || undefined });
            const msg = {
                de: { id: miId, nombre: miNombre, rol: 'cliente' },
                texto: mensaje.trim(),
                timestamp: new Date(),
            };
            setConversacionesCliente(prev => ({
                ...prev,
                [contactId]: [...(prev[contactId] || []), msg]
            }));
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(enviar)();
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    };

    const initial = (nombre) => (nombre || '?').charAt(0).toUpperCase();

    // Mensajes activos según rol
    const mensajesActivos = isStaff
        ? (clienteActivo ? (conversaciones[clienteActivo.id] || []) : [])
        : (conversacionesCliente[contactoActivo?.id || 'soporte'] || []);

    return (
        <>
            <style>{styles}</style>
            <div className="ch-wrap">

                {/* ── Sidebar ── */}
                <aside className={`ch-sidebar${(!isStaff || showConversacion) ? ' mobile-hidden' : ''}`}>
                    <div className="ch-sidebar-header">
                        <p className="ch-sidebar-title">💬 Chat</p>
                        <p className="ch-sidebar-sub">
                            {isStaff
                                ? `${onlineIds.size} en línea · ${usuarios.length} registrados`
                                : 'Soporte Intex'}
                        </p>
                    </div>
                    <div className="ch-contacts">
                        {isStaff ? (
                            usuarios.length === 0 ? (
                                <p className="ch-no-contacts">Sin usuarios registrados</p>
                            ) : (
                                (() => {
                                    const admins   = usuariosConEstado.filter(u => u.rol === 'administrador');
                                    const vendedoresLista = usuariosConEstado.filter(u => u.rol === 'vendedor' && u.id !== miId);
                                    const clientes = usuariosConEstado.filter(u => u.rol === 'cliente');

                                    const renderUsuario = (u) => (
                                        <button
                                            key={u.id}
                                            className={`ch-contact${clienteActivo?.id === u.id ? ' active' : ''}`}
                                            onClick={() => seleccionarCliente(u)}
                                            style={{ opacity: u.online ? 1 : 0.65 }}
                                        >
                                            <div className="ch-contact-avatar">
                                                {initial(u.nombre)}
                                                <span className={`ch-contact-online ${u.online ? 'online' : 'offline'}`} />
                                            </div>
                                            <div className="ch-contact-info">
                                                <p className="ch-contact-name">{u.nombre}</p>
                                                <p className="ch-contact-role">
                                                    {u.rol === 'vendedor' ? '🏪 Vendedor' : u.rol === 'administrador' ? '🛡️ Admin' : '👤 Cliente'}{' '}
                                                    <span style={{ color: u.online ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                                                        {u.online ? '● en línea' : '● desconectado'}
                                                    </span>
                                                </p>
                                            </div>
                                        </button>
                                    );

                                    return (
                                        <>
                                            {admins.length > 0 && (
                                                <>
                                                    <p className="ch-group-label">🛡️ Administradores ({admins.length})</p>
                                                    {admins.map(renderUsuario)}
                                                </>
                                            )}
                                            {vendedoresLista.length > 0 && (
                                                <>
                                                    <p className="ch-group-label">🏪 Vendedores ({vendedoresLista.length})</p>
                                                    {vendedoresLista.map(renderUsuario)}
                                                </>
                                            )}
                                            {clientes.length > 0 && (
                                                <>
                                                    <p className="ch-group-label">👤 Clientes ({clientes.length})</p>
                                                    {clientes.map(renderUsuario)}
                                                </>
                                            )}
                                        </>
                                    );
                                })()
                            )
                        ) : (
                            /* Vista cliente: Soporte + Vendedores */
                            <>
                                <p className="ch-group-label">🛡️ Soporte</p>
                                <button
                                    className={`ch-contact${!contactoActivo ? ' active' : ''}`}
                                    onClick={() => setContactoActivo(null)}
                                >
                                    <div className="ch-contact-avatar staff-avatar">
                                        <span>🛡️</span>
                                    </div>
                                    <div className="ch-contact-info">
                                        <p className="ch-contact-name">Soporte Intex</p>
                                        <p className="ch-contact-role">Administración</p>
                                    </div>
                                </button>
                                {vendedores.length > 0 && (
                                    <>
                                        <p className="ch-group-label">🏪 Vendedores ({vendedores.length})</p>
                                        {vendedores.map(v => (
                                            <button
                                                key={v.id}
                                                className={`ch-contact${contactoActivo?.id === v.id ? ' active' : ''}`}
                                                onClick={() => setContactoActivo(v)}
                                                style={{ opacity: onlineIds.has(v.id) ? 1 : 0.65 }}
                                            >
                                                <div className="ch-contact-avatar">
                                                    {initial(v.nombre)}
                                                    <span className={`ch-contact-online ${onlineIds.has(v.id) ? 'online' : 'offline'}`} />
                                                </div>
                                                <div className="ch-contact-info">
                                                    <p className="ch-contact-name">{v.nombre}</p>
                                                    <p className="ch-contact-role">
                                                        🏪 Vendedor{' '}
                                                        <span style={{ color: onlineIds.has(v.id) ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                                                            {onlineIds.has(v.id) ? '● en línea' : '● desconectado'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </aside>

                {/* ── Conversación ── */}
                <div className={`ch-conv${isStaff && !showConversacion ? ' mobile-hidden' : ''}`}>
                    {isStaff && !clienteActivo ? (
                        <div className="ch-conv-placeholder">
                            <div className="ch-conv-placeholder-icon">💬</div>
                            <p>Selecciona un cliente para ver la conversación</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="ch-conv-header">
                                {/* Botón volver (solo móvil) */}
                                {isStaff && (
                                    <button
                                        className="ch-back-btn"
                                        onClick={() => setShowConversacion(false)}
                                        title="Volver a contactos"
                                    >
                                        ←
                                    </button>
                                )}
                                <div className={`ch-conv-avatar${isStaff ? '' : (contactoActivo ? '' : ' staff-avatar')}`}>
                                    {isStaff
                                        ? initial(clienteActivo?.nombre)
                                        : (contactoActivo ? initial(contactoActivo.nombre) : '🛡️')}
                                </div>
                                <div>
                                    <p className="ch-conv-name">
                                        {isStaff ? clienteActivo?.nombre : (contactoActivo ? contactoActivo.nombre : 'Soporte Intex')}
                                    </p>
                                    <p className="ch-conv-status" style={{
                                        color: isStaff
                                            ? (clienteActivo && onlineIds.has(clienteActivo.id) ? '#22c55e' : '#ef4444')
                                            : (contactoActivo ? (onlineIds.has(contactoActivo.id) ? '#22c55e' : '#ef4444') : '#22c55e')
                                    }}>
                                        {isStaff
                                            ? (clienteActivo && onlineIds.has(clienteActivo.id) ? '● En línea' : '● Desconectado')
                                            : (contactoActivo ? (onlineIds.has(contactoActivo.id) ? '● En línea' : '● Desconectado') : '● En línea')}
                                    </p>
                                </div>
                            </div>

                            {/* Mensajes */}
                            <div className="ch-messages">
                                {mensajesActivos.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', marginTop: '2rem' }}>
                                        Sin mensajes aún. ¡Sé el primero en escribir!
                                    </div>
                                )}
                                {mensajesActivos.map((msg, i) => {
                                    const esPropio = msg.de?.id === miId;
                                    const esStaffMsg = msg.de?.rol !== 'cliente';
                                    const contactId = isStaff ? clienteActivo?.id : (contactoActivo?.id || 'soporte');
                                    const esUltimoPropio = esPropio && mensajesActivos.slice(i + 1).every(m => m.de?.id !== miId);
                                    const visto = esUltimoPropio && vistoIds.has(contactId);
                                    return (
                                        <div key={i} className={`ch-msg-row${esPropio ? ' own' : ''}`}>
                                            <div className={`ch-msg-mini-avatar${esStaffMsg ? ' staff-mini' : ''}`}>
                                                {esStaffMsg ? '🛡️' : initial(msg.de?.nombre)}
                                            </div>
                                            <div className="ch-msg-bubble-wrap">
                                                {!esPropio && (
                                                    <p className="ch-msg-sender">{msg.de?.nombre}</p>
                                                )}
                                                <div className={`ch-msg-bubble${esPropio ? ' own' : ' other'}`}>
                                                    {msg.texto}
                                                </div>
                                                <p className="ch-msg-time">
                                                    {formatTime(msg.timestamp)}
                                                    {visto && <span style={{ color: '#22c55e', marginLeft: '0.4rem', fontWeight: 700 }}>✓✓ Visto</span>}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="ch-input-area">
                                <form onSubmit={handleSubmit(enviar)}>
                                    <div className="ch-input-row">
                                        <textarea
                                            className="ch-input"
                                            placeholder="Escribe un mensaje… (Enter para enviar)"
                                            rows={1}
                                            onKeyDown={handleKey}
                                            {...register('mensaje')}
                                        />
                                        <button
                                            type="submit"
                                            className="ch-send-btn"
                                            disabled={!msgText?.trim()}
                                        >
                                            ➤
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </>
    );
};

export default Chat;

