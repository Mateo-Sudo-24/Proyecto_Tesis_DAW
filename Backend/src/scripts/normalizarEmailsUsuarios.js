import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Administrador from '../models/Administrador.js';
import Vendedor from '../models/Vendedor.js';
import Cliente from '../models/Cliente.js';

dotenv.config();

const uri = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI_LOCAL;

const normalizarEmail = (email = '') => String(email).toLowerCase().trim();

const normalizarModelo = async (Model, nombre) => {
    const usuarios = await Model.find({ email: { $exists: true, $ne: null } }).select('_id email').lean();
    const vistos = new Map();
    const duplicados = [];

    for (const usuario of usuarios) {
        const emailNorm = normalizarEmail(usuario.email);
        if (!emailNorm) continue;
        if (vistos.has(emailNorm) && vistos.get(emailNorm) !== String(usuario._id)) {
            duplicados.push({ email: emailNorm, ids: [vistos.get(emailNorm), String(usuario._id)] });
        }
        vistos.set(emailNorm, String(usuario._id));
    }

    if (duplicados.length) {
        console.error(`[${nombre}] Emails duplicados al normalizar. Resuelve estos casos antes de ejecutar:`);
        console.error(JSON.stringify(duplicados, null, 2));
        return { actualizados: 0, duplicados: duplicados.length };
    }

    let actualizados = 0;
    for (const usuario of usuarios) {
        const emailNorm = normalizarEmail(usuario.email);
        if (emailNorm && emailNorm !== usuario.email) {
            await Model.updateOne({ _id: usuario._id }, { $set: { email: emailNorm } });
            actualizados += 1;
        }
    }

    console.log(`[${nombre}] Emails normalizados: ${actualizados}`);
    return { actualizados, duplicados: 0 };
};

const main = async () => {
    if (!uri) throw new Error('Define MONGODB_URI_PRODUCTION o MONGODB_URI_LOCAL.');

    await mongoose.connect(uri);
    const resultados = await Promise.all([
        normalizarModelo(Administrador, 'administradores'),
        normalizarModelo(Vendedor, 'vendedores'),
        normalizarModelo(Cliente, 'clientes'),
    ]);

    const totalDuplicados = resultados.reduce((total, item) => total + item.duplicados, 0);
    if (totalDuplicados) process.exitCode = 1;
};

main()
    .catch((error) => {
        console.error('Error al normalizar emails:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
