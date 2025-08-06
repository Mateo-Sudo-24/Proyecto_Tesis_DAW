import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js';
import mongoose from 'mongoose';

//Obtener el carrito del usuario autenticado. Si no existe, crea uno vacío.

const obtenerMiCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ cliente: req.usuario._id })
                                     .populate('items.producto', 'nombre precio imagenUrl stock');

        if (!carrito) {
            // Si el usuario no tiene carrito, devolvemos una estructura de carrito válida y vacía.
            // Esto es mejor para el frontend que manejar un error 404.
            return res.status(200).json({
                cliente: req.usuario._id,
                items: [],
                subtotal: 0
            });
        }
        res.status(200).json(carrito);
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ msg: "Error en el servidor al obtener el carrito." });
    }
};

//Agregar un item al carrito o actualizar su cantidad si ya existe.

const agregarItem = async (req, res) => {
    const { productoId, cantidad } = req.body;
    const clienteId = req.usuario._id;

    if (!productoId || !cantidad || cantidad < 1) {
        return res.status(400).json({ msg: "Se requiere un ID de producto y una cantidad válida." });
    }

    try {
        const producto = await Producto.findById(productoId);
        if (!producto) return res.status(404).json({ msg: "Producto no encontrado." });
        if (producto.stock < cantidad) return res.status(400).json({ msg: "Stock insuficiente para la cantidad solicitada." });

        let carrito = await Carrito.findOne({ cliente: clienteId });

        if (carrito) {
            const itemIndex = carrito.items.findIndex(p => p.producto.equals(productoId));
            if (itemIndex > -1) {
                carrito.items[itemIndex].cantidad = cantidad; // O puedes hacer += si prefieres
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
        const carritoActualizado = await carrito.populate('items.producto', 'nombre precio imagenUrl stock');
        res.status(200).json(carritoActualizado);

    } catch (error) {
        console.error("Error al agregar item al carrito:", error);
        res.status(500).json({ msg: "Error en el servidor al agregar el item." });
    }
};

//Eliminar un item del carrito.
const eliminarItem = async (req, res) => {
    const { productoId } = req.params;
    const clienteId = req.usuario._id;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
        return res.status(400).json({ msg: "ID de producto no válido." });
    }

    try {
        const carrito = await Carrito.findOneAndUpdate(
            { cliente: clienteId },
            { $pull: { items: { producto: productoId } } },
            { new: true }
        ).populate('items.producto', 'nombre precio imagenUrl stock');

        if (!carrito) return res.status(404).json({ msg: "Carrito no encontrado." });
        res.status(200).json(carrito);

    } catch (error) {
        console.error("Error al eliminar item del carrito:", error);
        res.status(500).json({ msg: "Error en el servidor al eliminar el item." });
    }
};

//Vaciar completamente el carrito del usuario.

const vaciarCarrito = async (req, res) => {
    try {
        await Carrito.updateOne({ cliente: req.usuario._id }, { $set: { items: [] } });
        res.status(200).json({ msg: "El carrito ha sido vaciado." });
    } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        res.status(500).json({ msg: "Error en el servidor al vaciar el carrito." });
    }
};

export {
    obtenerMiCarrito,
    agregarItem,
    eliminarItem,
    vaciarCarrito
};