import app from './server.js';
import connection from './database.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Administrador from './models/Administrador.js';
import Cliente from './models/Cliente.js';
import Vendedor from './models/Vendedor.js';
import ChatMessage from './models/ChatMessage.js';

// 1. Crear un servidor HTTP a partir de nuestra aplicación de Express
const server = http.createServer(app);

// 2. Inicializar Socket.IO, pasándole el servidor HTTP y la configuración de CORS
const io = new Server(server, {
    cors: {
        // Permitir conexiones desde tus frontends de desarrollo y producción
        origin: [process.env.URL_FRONTEND, process.env.FRONTEND_URL],
        methods: ["GET", "POST"]
    }
});

// =======================================================================
// ==                LÓGICA DEL CHAT EN TIEMPO REAL                     ==
// =======================================================================

// Mapa de usuarios conectados: userId → { id, rol, nombre, socketId }
const usuariosConectados = new Map();

// Helper: conversationId canónico entre dos usuarios
const convId = (a, b) => [String(a), String(b)].sort().join('_');

// Devuelve todos los clientes, vendedores y admins ACTIVOS con su estado online
const getListaCompletaUsuarios = async () => {
    const [clientes, vendedores, admins] = await Promise.all([
        Cliente.find({ status: true }).select('_id nombre email').lean(),
        Vendedor.find({ status: true }).select('_id nombre email').lean(),
        Administrador.find({}).select('_id nombre email').lean(),
    ]);
    const todos = [
        ...clientes.map(u => ({ id: String(u._id), nombre: u.nombre, email: u.email, rol: 'cliente' })),
        ...vendedores.map(u => ({ id: String(u._id), nombre: u.nombre, email: u.email, rol: 'vendedor' })),
        ...admins.map(u => ({ id: String(u._id), nombre: u.nombre, email: u.email, rol: 'administrador' })),
    ];
    return todos.map(u => ({ ...u, online: usuariosConectados.has(u.id) }));
};

// Emite la lista completa actualizada a todo el staff
const emitirListaStaff = async () => {
    try {
        const lista = await getListaCompletaUsuarios();
        io.to('staff_room').emit('lista_usuarios', lista);
    } catch (e) { console.error('Error emitiendo lista usuarios:', e); }
};

// 3. Middleware de autenticación para cada nueva conexión de socket
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Autenticación fallida: no se proporcionó token."));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Autenticación fallida: el token es inválido o ha expirado."));
        }
        socket.usuario = decoded; 
        next();
    });
});

// 4. Lógica principal cuando un usuario se conecta
io.on('connection', async (socket) => {
    // Buscar nombre del usuario en la BD
    let nombre = 'Usuario';
    try {
        let doc;
        if (socket.usuario.rol === 'administrador') {
            doc = await Administrador.findById(socket.usuario.id).select('nombre').lean();
        } else if (socket.usuario.rol === 'cliente') {
            doc = await Cliente.findById(socket.usuario.id).select('nombre').lean();
        } else if (socket.usuario.rol === 'vendedor') {
            doc = await Vendedor.findById(socket.usuario.id).select('nombre').lean();
        }
        if (doc?.nombre) nombre = doc.nombre;
    } catch (e) { /* usar nombre por defecto */ }

    socket.usuario.nombre = nombre;
    console.log(`✅ Chat: ${nombre} (${socket.usuario.rol}) conectado — ${socket.id}`);

    // Registrar en el mapa
    usuariosConectados.set(socket.usuario.id, {
        id: socket.usuario.id,
        rol: socket.usuario.rol,
        nombre,
        socketId: socket.id,
    });

    if (socket.usuario.rol === 'cliente') {
        socket.join(socket.usuario.id);
    } else {
        socket.join('staff_room');
        socket.join(socket.usuario.id); // sala propia para recibir mensajes directos
    }

    // Notificar a todo el staff la lista actualizada (incluyendo al recién conectado)
    await emitirListaStaff();

    // Si el recién conectado es staff, enviarle la lista al instante
    if (socket.usuario.rol !== 'cliente') {
        try {
            const lista = await getListaCompletaUsuarios();
            socket.emit('lista_usuarios', lista);
        } catch (e) { /* ignorar */ }
    }

    // ── Cliente envía mensaje a soporte o a vendedor específico ──
    socket.on('mensaje_cliente', async ({ texto, para }) => {
        if (!texto?.trim()) return;
        const cid = convId(socket.usuario.id, para || 'staff');
        const msg = {
            de: { id: socket.usuario.id, nombre: socket.usuario.nombre, rol: 'cliente' },
            texto: texto.trim(),
            timestamp: new Date(),
        };
        // Persistir en BD
        try {
            await ChatMessage.create({ conversationId: cid, de: msg.de, texto: msg.de.texto || msg.texto });
        } catch { /* no bloquear chat si falla la persistencia */ }

        if (para) {
            io.to(para).emit('mensaje_de_cliente', { clienteId: socket.usuario.id, msg });
        } else {
            io.to('staff_room').emit('mensaje_de_cliente', { clienteId: socket.usuario.id, msg });
        }
    });

    // ── Staff envía mensaje a un cliente o vendedor específico ──
    socket.on('mensaje_staff', async ({ para, texto }) => {
        if (!texto?.trim() || !para) return;
        const cid = convId(socket.usuario.id, para);
        const msg = {
            de: { id: socket.usuario.id, nombre: socket.usuario.nombre, rol: socket.usuario.rol },
            texto: texto.trim(),
            timestamp: new Date(),
        };
        // Persistir en BD
        try {
            await ChatMessage.create({ conversationId: cid, de: msg.de, texto: msg.texto });
        } catch { /* no bloquear */ }

        io.to(para).emit('mensaje_de_staff', msg);
        io.to('staff_room').emit('mensaje_de_cliente', { clienteId: para, msg });
    });

    // ── Staff solicita historial de una conversación ──
    socket.on('solicitar_historial', async ({ clienteId }) => {
        try {
            const cid = convId(socket.usuario.id, clienteId);
            const mensajes = await ChatMessage.find({ conversationId: cid })
                .sort({ createdAt: 1 })
                .limit(200)
                .lean();
            const historial = mensajes.map(m => ({
                de: m.de,
                texto: m.texto,
                timestamp: m.createdAt,
                visto: m.visto,
            }));
            socket.emit('historial_chat', { clienteId, historial });
        } catch { socket.emit('historial_chat', { clienteId, historial: [] }); }
    });

    // ── Marcar mensajes como vistos ──
    socket.on('marcar_visto', async ({ para }) => {
        if (!para) return;
        const cid = convId(socket.usuario.id, para);
        // Marcar como vistos en BD los mensajes enviados por "para"
        try {
            await ChatMessage.updateMany(
                { conversationId: cid, 'de.id': para, visto: { $ne: true } },
                { $set: { visto: true } }
            );
        } catch (dbErr) {
            console.error('Error al marcar mensajes como vistos en BD:', dbErr.message);
        }
        // Notifica al usuario "para" que sus mensajes fueron vistos por quien emitió
        io.to(para).emit('visto_por', { de: socket.usuario.id });
    });

    // ── Desconexión ──
    socket.on('disconnect', () => {
        const { id, rol, nombre: n } = socket.usuario;
        console.log(`❌ Chat: ${n} (${rol}) desconectado`);
        usuariosConectados.delete(id);
        // Actualizar lista para todo el staff
        emitirListaStaff();
    });
});


// =======================================================================
// ==                 INICIO DEL SERVIDOR                               ==
// =======================================================================

const initServer = async () => {
    try {
        // 1. Conectar a la base de datos PRIMERO
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║        INICIANDO CONEXIÓN A BASE DE DATOS             ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');
        await connection();
        
        // 2. Si la conexión fue exitosa, iniciar el servidor
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║           INICIANDO SERVIDOR BACKEND                   ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');
        
        const PORT = app.get('port');
        const BASE_URL = process.env.NODE_ENV === 'production' 
                       ? process.env.URL_BACKEND_PRODUCTION 
                       : `http://localhost:${PORT}`;

        server.listen(PORT, () => {
            console.log(`\n🚀 Servidor HTTP y WebSocket corriendo en ${BASE_URL}`);
            console.log(`✅ Servidor LISTO para recibir solicitudes\n`);
        });
    } catch (error) {
        console.error('\n❌ Error fatal al inicializar servidor:', error);
        console.error('⛔ El servidor NO se iniciará sin conexión a la base de datos\n');
        process.exit(1);
    }
};

// Ejecutar función de inicialización
initServer();