import Producto from '../models/Producto.js';
import { consultarGroq } from '../services/groqService.js';

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizar = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const DICCIONARIO_TEXTIL = [
    'algodon', 'pima', 'lino', 'seda', 'poliester', 'polyester', 'lana', 'nylon',
    'viscosa', 'rayon', 'terciopelo', 'denim', 'jean', 'jersey', 'saten', 'gasa',
    'tul', 'encaje', 'polar', 'fleece', 'gabardina', 'tafetan', 'lycra', 'spandex',
    'microfibra', 'canvas', 'loneta', 'popelina', 'chiffon', 'organza', 'dril',
];

const COLORES = [
    'blanco', 'negro', 'azul', 'rojo', 'verde', 'amarillo', 'beige', 'gris',
    'marron', 'cafe', 'rosado', 'morado', 'naranja', 'celeste', 'crema', 'vino',
];

const TEXTURAS = [
    'suave', 'rugoso', 'brillante', 'opaco', 'elastico', 'rigido', 'transpirable',
    'ligero', 'pesado', 'liso', 'estampado', 'grueso', 'delgado',
];

const extraerTerminos = (...texts) => {
    const base = normalizar(texts.filter(Boolean).join(' '));
    const tokens = [...DICCIONARIO_TEXTIL, ...COLORES, ...TEXTURAS];
    return [...new Set(tokens.filter(term => base.includes(term)))].slice(0, 10);
};

const buscarProductosCoincidentes = async (mensaje, respuesta) => {
    const terminos = extraerTerminos(mensaje, respuesta);
    if (terminos.length === 0) return [];

    const or = terminos.flatMap(term => {
        const rx = new RegExp(escapeRegex(term), 'i');
        return [
            { nombre: rx },
            { descripcion: rx },
            { categoria: rx },
            { color: rx },
            { etiquetas: { $elemMatch: rx } },
        ];
    });

    const productos = await Producto.find({
        estado: { $ne: 'inactivo' },
        $or: or,
    })
        .select('nombre descripcion precio precioPorMetro precioPorRollo unidadVenta metrosDisponibles metrosPorRollo imagenUrl color categoria descuento etiquetas')
        .limit(6)
        .lean();

    return productos.map(producto => {
        const textoProducto = normalizar([
            producto.nombre,
            producto.descripcion,
            producto.categoria,
            producto.color,
            ...(producto.etiquetas || []),
        ].join(' '));

        return {
            ...producto,
            verificadoBDD: true,
            coincidencias: terminos.filter(term => textoProducto.includes(term)),
        };
    });
};

const responderConProductos = async (res, mensaje, respuesta) => {
    const productosCoincidentes = await buscarProductosCoincidentes(mensaje, respuesta);
    res.json({
        respuesta,
        productosCoincidentes,
        verificacionBDD: {
            consultada: true,
            total: productosCoincidentes.length,
        },
    });
};

export const consultarGroqPublic = async (req, res) => {
    try {
        const { mensaje, imagenBase64, imagenesBase64 = [], historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial, imagenesBase64);
        await responderConProductos(res, mensaje, respuesta);
    } catch (error) {
        console.error('Error en consultarGroqPublic:', error);
        res.status(500).json({ error: error.message });
    }
};

export const consultarGroqAuth = async (req, res) => {
    try {
        const { mensaje, imagenBase64, imagenesBase64 = [], historial = [] } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje es requerido' });
        }

        const respuesta = await consultarGroq(mensaje, imagenBase64, historial, imagenesBase64);
        await responderConProductos(res, mensaje, respuesta);
    } catch (error) {
        console.error('Error en consultarGroqAuth:', error);
        res.status(500).json({ error: error.message });
    }
};
