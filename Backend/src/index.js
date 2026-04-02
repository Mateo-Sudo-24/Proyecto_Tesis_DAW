import app from './server.js';
import connection from './database.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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
        // Adjuntamos los datos del usuario (id, rol) al objeto 'socket'
        socket.usuario = decoded; 
        next();
    });
});

// 4. Lógica principal que se ejecuta cuando un usuario se conecta exitosamente
io.on('connection', (socket) => {
    console.log(`✅ Usuario conectado al chat: ${socket.id} | Rol: ${socket.usuario.rol}`);

    // --- Organización en Salas (Rooms) ---
    if (socket.usuario.rol === 'cliente') {
        // El cliente se une a su propia sala privada para recibir respuestas directas
        socket.join(socket.usuario.id);
        // Notificar al personal que un cliente está en línea
        io.to('staff_room').emit('nuevo_chat_cliente', { 
            clienteId: socket.usuario.id,
            mensaje: `Un cliente se ha conectado y necesita ayuda.`
        });
    } else if (socket.usuario.rol === 'vendedor' || socket.usuario.rol === 'administrador') {
        // El personal se une a una sala común para recibir todas las consultas de clientes
        socket.join('staff_room');
    }

    // --- Manejo de Eventos (Mensajes) ---

    // Escuchar cuando un cliente envía un mensaje
    socket.on('mensaje_desde_cliente', (payload) => {
        // Reenviar el mensaje a todos en la sala de personal
        io.to('staff_room').emit('mensaje_recibido_de_cliente', {
            de: socket.usuario.id,
            texto: payload.texto,
            timestamp: new Date()
        });
    });

    // Escuchar cuando un miembro del personal envía una respuesta
    socket.on('mensaje_desde_staff', (payload) => {
        // El payload debe contener el ID del cliente al que se responde: { para: '...', texto: '...' }
        if (payload.para) {
            // Enviar el mensaje únicamente a la sala privada de ese cliente
            io.to(payload.para).emit('respuesta_recibida_de_staff', {
                de: 'Soporte Unitex',
                texto: payload.texto,
                timestamp: new Date()
            });
        }
    });

    // Manejar la desconexión
    socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado del chat: ${socket.id}`);
        if (socket.usuario.rol === 'cliente') {
            // Opcional: notificar al personal que un cliente se fue
            io.to('staff_room').emit('cliente_desconectado', { clienteId: socket.usuario.id });
        }
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