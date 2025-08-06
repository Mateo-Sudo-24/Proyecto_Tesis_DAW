// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerAdministrador from './routers/Administrador_routers.js';
import routerClientes from './routers/Clientes_routers.js';
import routerVendedores from './routers/Vendedor_routers.js';
import routerProductos from './routers/Producto_routers.js';
import routerOrdenes from './routers/Orden_routers.js'; // AÑADIR/VERIFICAR
import routerCarrito from './routers/Carrito_routers.js'; // AÑADIR/VERIFICAR
import routerBot from './routers/Bot_routers.js'; // AÑADIR/VERIFICAR
import oAuthRoutes from './routers/Oauth_routers.js';
import mongoose from 'mongoose'

// Inicializaciones
const app = express()
dotenv.config()

// Conexión a la base de datos
mongoose.set('strictQuery', true)

const connectToDatabase = async () => {
    try {
        const connectionUri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI_LOCAL
        const connection = await mongoose.connect(connectionUri)
        const isProduction = connectionUri === process.env.MONGODB_URI_PRODUCTION

        console.log(`✅ Conectado a la base de datos (${isProduction ? 'PRODUCCIÓN' : 'LOCAL'})`)
        console.log(`   Host: ${connection.connection.host} - Puerto: ${connection.connection.port}`)
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error)
        process.exit(1)
    }
}

// Ejecutar la conexión antes de iniciar el servidor
await connectToDatabase()

// Configuraciones
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.URL_BACKEND || `http://localhost:${PORT}`

app.set('port', PORT)
app.use(cors())
app.use(express.json())

// Ruta principal
app.get('/', (req, res) => {
    res.send("✅ API Activa - Unitex Backend")
})

// Rutas específicas
app.use('/api/admin', routerAdministrador);
app.use('/api/clientes', routerClientes);
app.use('/api/vendedores', routerVendedores);
app.use('/api/productos', routerProductos);
app.use('/api/ordenes', routerOrdenes); // AÑADIR/VERIFICAR
app.use('/api/carrito', routerCarrito); // AÑADIR/VERIFICAR
app.use('/api/bot', routerBot); // AÑADIR/VERIFICAR
app.use('/api/auth', oAuthRoutes);

// Middleware 404
app.use((req, res) => res.status(404).send("❌ Endpoint no encontrado - 404"))

// Exportar (opcional)
export default app
