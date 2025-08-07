// =======================================================================
// ==                           IMPORTACIONES                           ==
// =======================================================================
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';
import passport from 'passport';
import session from 'express-session';

// --- Tus Routers --- ¡ESTA ES LA SECCIÓN QUE FALTABA! ---
import routerAdministrador from './routers/Administrador_routers.js';
import routerClientes from './routers/Clientes_routers.js';
import routerVendedores from './routers/Vendedor_routers.js';
import routerProductos from './routers/Producto_routers.js';
import routerOrdenes from './routers/Orden_routers.js';
import routerCarrito from './routers/Carrito_routers.js';
import routerBot from './routers/Bot_routers.js';
import oAuthRoutes from './routers/Oauth_routers.js';

// --- Configuración de Passport ---
import './config/passport.js';


// =======================================================================
// ==                         INICIALIZACIONES                          ==
// =======================================================================
dotenv.config(); // Carga las variables de .env
const app = express();


// =======================================================================
// ==                         CONFIGURACIONES                           ==
// =======================================================================
// --- Selección de Entorno (La Clave de la Flexibilidad) ---
const isProduction = process.env.NODE_ENV === 'production';

// --- Puerto y URL Base Dinámicos ---
const PORT = process.env.PORT || 3000;
const BASE_URL = isProduction ? process.env.URL_BACKEND_PRODUCTION : process.env.URL_BACKEND_LOCAL;
app.set('port', PORT);

// --- Configuración de Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Conexión a la Base de Datos Dinámica ---
mongoose.set('strictQuery', true);
const connectToDatabase = async () => {
    try {
        const connectionUri = isProduction ? process.env.MONGODB_URI_PRODUCTION : process.env.MONGODB_URI_LOCAL;
        
        if (!connectionUri) {
            throw new Error(`La URI de la base de datos para el entorno '${process.env.NODE_ENV}' no está definida.`);
        }

        const connection = await mongoose.connect(connectionUri);
        console.log(`✅ Conectado a la base de datos (${isProduction ? 'PRODUCCIÓN' : 'LOCAL'})`);
        console.log(`   Host: ${connection.connection.host}:${connection.connection.port}`);
    } catch (error) {
        console.error(`❌ Error al conectar a la base de datos: ${error.message}`);
        process.exit(1);
    }
};
await connectToDatabase();


// =======================================================================
// ==                           MIDDLEWARES                             ==
// =======================================================================
// --- Configuración de CORS Dinámica ---
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [process.env.URL_FRONTEND, process.env.FRONTEND_URL];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: './uploads' }));

// --- Middlewares de Sesión y Passport ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ // ¡AÑADIDO PARA SESIONES PERSISTENTES!
    mongoUrl: isProduction ? process.env.MONGODB_URI_PRODUCTION : process.env.MONGODB_URI_LOCAL
  })
}));
app.use(passport.initialize());
app.use(passport.session());


// =======================================================================
// ==                              RUTAS                                ==
// =======================================================================
// --- Ruta principal de bienvenida ---
app.get('/', (req, res) => {
    res.send("✅ API Activa - Unitex Backend");
});

// --- Rutas específicas de la API --- ¡ESTE ES EL BLOQUE QUE FALTABA! ---
app.use('/api/admin', routerAdministrador);
app.use('/api/clientes', routerClientes);
app.use('/api/vendedores', routerVendedores);
app.use('/api/productos', routerProductos);
app.use('/api/ordenes', routerOrdenes);
app.use('/api/carrito', routerCarrito);
app.use('/api/bot', routerBot);
app.use('/api/auth', oAuthRoutes); // Rutas para OAuth (Google, etc.)


// =======================================================================
// ==                 MANEJO DE ERRORES Y EXPORTACIÓN                   ==
// =======================================================================
app.use((req, res) => {
    res.status(404).send("❌ Endpoint no encontrado - 404");
});

export default app;