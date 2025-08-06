import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js';

//(Habilidad del Bot) Busca productos basado en una consulta de texto.

const buscarProductos = async (req, res) => {
    const { q } = req.query; // q = query
    if (!q) return res.status(400).json({ msg: "Se requiere un término de búsqueda 'q'." });

    try {
        const productos = await Producto.find({
            estado: { $ne: "inactivo" },
            $or: [
                { nombre: { $regex: q, $options: "i" } },
                { descripcion: { $regex: q, $options: "i" } }
            ]
        }).select("nombre precio stock imagenUrl").limit(5); // Limitar a 5 para no saturar el chat

        res.status(200).json({
            count: productos.length,
            productos: productos
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al buscar productos." });
    }
};

//(Habilidad del Bot) Agrega un producto al carrito de un usuario autenticado.

const agregarAlCarrito = async (req, res) => {
    const clienteId = req.usuario._id;
    const { productoId, cantidad = 1 } = req.body;

    if (!productoId) return res.status(400).json({ msg: "Se requiere productoId." });

    try {
        // Reutilizamos la misma lógica segura del Carrito_controller
        const producto = await Producto.findById(productoId);
        if (!producto || producto.stock < cantidad) return res.status(404).json({ msg: "Producto no encontrado o sin stock." });

        let carrito = await Carrito.findOne({ cliente: clienteId });
        if (carrito) {
            const itemIndex = carrito.items.findIndex(p => p.producto.equals(productoId));
            if (itemIndex > -1) {
                carrito.items[itemIndex].cantidad += cantidad;
            } else {
                carrito.items.push({ producto: productoId, cantidad });
            }
        } else {
            carrito = await Carrito.create({
                cliente: clienteId,
                items: [{ producto: productoId, cantidad }]
            });
        }
        await carrito.save();
        res.status(200).json({ msg: `"${producto.nombre}" fue agregado a tu carrito.` });
    } catch (error) {
        res.status(500).json({ msg: "Error al agregar al carrito." });
    }
};

//(Habilidad del Bot) Obtiene el estado actual del carrito para resumirlo.
 
const obtenerResumenCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ cliente: req.usuario._id }).populate('items.producto', 'precio');
        if (!carrito || carrito.items.length === 0) {
            return res.status(200).json({ itemCount: 0, total: 0, isEmpty: true });
        }
        
        let total = 0;
        carrito.items.forEach(item => {
            total += item.cantidad * item.producto.precio;
        });

        res.status(200).json({
            itemCount: carrito.items.length,
            total: total.toFixed(2),
            isEmpty: false
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el resumen del carrito." });
    }
};

export {
    buscarProductos,
    agregarAlCarrito,
    obtenerResumenCarrito
};