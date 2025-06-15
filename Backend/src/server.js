// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerAdministrador from './routers/Administrador_routers.js'
import routerClientes from './routers/Clientes_routers.js'
import routerVendedores from './routers/Vendedor_routers.js'
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
app.set('port', process.env.PORT || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())

// Rutas principales
app.get('/', (req, res) => {
    res.send("Server on")
})

// Rutas específicas
app.use('/api/admin', routerAdministrador)   // Aquí va el login del administrador: POST /api/admin/login
app.use('/api/clientes', routerClientes)
app.use('/api/vendedores', routerVendedores)

// Middleware 404 al final
app.use((req, res) => res.status(404).send("❌ Endpoint no encontrado - 404"))

// Exportar la instancia de express
export default app
