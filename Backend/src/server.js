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

// --- Tus Routers ---
// ... (importa todos tus routers aquí)

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
// Selecciona la URL base dependiendo del entorno
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
        // Selecciona la URI de la base de datos dependiendo del entorno
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
// Permite que solo tu frontend de producción o local se conecten.
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
  secret: process.env.SESSION_SECRET, // Es vital que esto esté en .env
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// =======================================================================
// ==                              RUTAS                                ==
// =======================================================================
// ... (tu bloque de app.use('/api/admin', ...) aquí)


// =======================================================================
// ==                 MANEJO DE ERRORES Y EXPORTACIÓN                   ==
// =======================================================================
app.use((req, res) => {
    res.status(404).send("❌ Endpoint no encontrado - 404");
});

export default app;