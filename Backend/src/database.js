import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

const connection = async () => {
    try {
        // Usa directamente la URI de producción si está definida, si no, usa la local
        const connectionUri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI_LOCAL

        const connection = await mongoose.connect(connectionUri)
        console.log(`✅ Database connected: ${connection.connection.host} - ${connection.connection.port}`)
    } catch (error) {
        console.error('❌ Database connection error:', error)
    }
}

export default connection
