import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';
import Vendedor from '../models/Vendedor.js';
import Cliente from '../models/Cliente.js';

dotenv.config();

const uri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI_LOCAL;
const objetivo = 'isaac';

const regexNombre = new RegExp(objetivo, 'i');

const main = async () => {
    if (!uri) throw new Error('Define MONGODB_URI_PRODUCTION o MONGODB_URI_LOCAL.');

    await mongoose.connect(uri);

    const [admins, vendedores, clientes] = await Promise.all([
        Administrador.find({ $or: [{ nombre: regexNombre }, { apellido: regexNombre }, { email: regexNombre }] }).select('_id nombre apellido email').lean(),
        Vendedor.find({ $or: [{ nombre: regexNombre }, { apellido: regexNombre }, { email: regexNombre }] }).select('_id nombre apellido email').lean(),
        Cliente.find({ $or: [{ nombre: regexNombre }, { apellido: regexNombre }, { email: regexNombre }] }).select('_id nombre apellido email').lean(),
    ]);

    const adminIds = admins.map(u => u._id);
    const vendedorIds = vendedores.map(u => u._id);
    const condiciones = [
        { mensaje: regexNombre },
        ...(adminIds.length ? [{ administrador: { $in: adminIds } }] : []),
        ...(vendedorIds.length ? [{ vendedor: { $in: vendedorIds } }] : []),
    ];

    const filtro = condiciones.length ? { $or: condiciones } : { mensaje: regexNombre };
    const preview = await Notificacion.find(filtro).select('_id administrador vendedor mensaje createdAt estadoGestion').lean();

    console.log('Usuarios encontrados:', JSON.stringify({ admins, vendedores, clientes }, null, 2));
    console.log(`Notificaciones a eliminar: ${preview.length}`);
    preview.forEach(n => console.log(`${n._id} | ${n.createdAt?.toISOString?.() || n.createdAt} | ${n.mensaje}`));

    if (!preview.length) return;

    const result = await Notificacion.deleteMany({ _id: { $in: preview.map(n => n._id) } });
    console.log(`Notificaciones eliminadas: ${result.deletedCount}`);
};

main()
    .catch((error) => {
        console.error('Error al eliminar notificaciones de Isaac:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
