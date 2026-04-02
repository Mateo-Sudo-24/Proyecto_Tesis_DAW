import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

const connection = async () => {
    const uriProduction = process.env.MONGODB_URI_PRODUCTION
    const uriLocal = process.env.MONGODB_URI_LOCAL

    // Intentar PRODUCTION primero
    try {
        console.log('Conectando a PRODUCTION...')
        await mongoose.connect(uriProduction, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
        })
        console.log('✅ PRODUCTION')
        return
    } catch (error) {
        console.log(`❌ PRODUCTION falló: ${error.message}`)
    }

    // Fallback a LOCAL
    try {
        console.log('Conectando a LOCAL...')
        await mongoose.connect(uriLocal, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
        })
        console.log('✅ LOCAL')
        return
    } catch (error) {
        console.log(`❌ LOCAL falló: ${error.message}`)
        throw new Error('No se pudo conectar a PRODUCTION ni LOCAL')
    }
}

export default connection
