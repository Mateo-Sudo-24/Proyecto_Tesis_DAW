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
        process.exit(1) // Cierra el servidor si no hay conexión
    }
}

// Ejecutar la conexión antes de iniciar el servidor
await connectToDatabase()

// Configuraciones 
app.set('port', process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())

// Rutas 
app.get('/', (req, res) => {
    res.send("Server on")
})
// Rutas para administradores
app.use('/api', routerAdministrador)
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"))

// Rutas para clientes
app.use('/api',routerClientes)
// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))

//Rutas para vendedores
app.use('/api', routerVendedores)
// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))

// Exportar la instancia de express
export default app
