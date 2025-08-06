import Orden from "../models/Orden.js";
import Cliente from "../models/Cliente.js";
import Carrito from '../models/Carrito.js'; // <-- Importante
import Producto from '../models/Producto.js'; // <-- Importante
import mongoose from "mongoose";
import shortid from "shortid";

/**
 * @desc    Crear una nueva orden a partir del carrito del usuario.
 * @route   POST /api/ordenes
 * @access  Private (Cliente)
 */
const registrarOrden = async (req, res) => {
    const clienteId = req.usuario._id;
    const { direccionEnvio, metodoPago } = req.body;

    if (!direccionEnvio || !metodoPago) {
        return res.status(400).json({ msg: "La dirección de envío y el método de pago son obligatorios." });
    }

    try {
        const carrito = await Carrito.findOne({ cliente: clienteId }).populate('items.producto');
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).json({ msg: "Tu carrito está vacío. No se puede crear una orden." });
        }

        let precioTotal = 0;
        const productosPedido = [];
        
        // Validar stock y construir la lista de productos para la orden
        for (const item of carrito.items) {
            if (item.producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto: ${item.producto.nombre}`);
            }
            precioTotal += item.cantidad * item.producto.precio;
            productosPedido.push({
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                imagen: item.producto.imagenUrl,
                precio: item.producto.precio,
                producto: item.producto._id
            });
        }
        
        const orden = new Orden({
            cliente: clienteId,
            productoPedido: productosPedido,
            direccionEnvio,
            metodoPago,
            precioTotal, // Total calculado de forma segura en el backend
            codigoOrden: shortid.generate()
        });
        
        await orden.save();
        
        // Descontar el stock de los productos
        for (const item of carrito.items) {
            await Producto.findByIdAndUpdate(item.producto._id, {
                $inc: { stock: -item.cantidad }
            });
        }

        // Vaciar el carrito después de una orden exitosa
        carrito.items = [];
        await carrito.save();

        res.status(201).json({ msg: "Orden creada exitosamente", orden });

    } catch (error) {
        if (error.message.startsWith('Stock insuficiente')) {
            return res.status(400).json({ msg: error.message });
        }
        console.error("Error al registrar la orden:", error);
        res.status(500).json({ msg: "Error en el servidor al registrar la orden." });
    }
}


// Listar órdenes con filtros y seguridad por rol
const listarOrdenes = async (req, res) => {
  const { rol, _id } = req.usuario;
  const { nombreCliente, estado } = req.query;

  try {
    let filtro = {};

    if (rol === 'cliente') {
      filtro.cliente = _id;
    } else if (rol === 'administrador' || rol === 'vendedor') {
      if (estado) filtro.estadoOrden = estado;
      if (nombreCliente) {
        const clientesEncontrados = await Cliente.find({
          nombre: { $regex: nombreCliente, $options: 'i' }
        }).select('_id');
        filtro.cliente = { $in: clientesEncontrados.map(c => c._id) };
      }
    }

    const ordenes = await Orden.find(filtro)
      .populate("cliente", "nombre apellido email")
      .populate("productoPedido.producto", "nombre precio");

    res.status(200).json(ordenes);
  } catch (error) {
    res.status(500).json({ msg: "Error en el servidor al listar las órdenes." });
  }
};

// Ver el detalle de una orden específica
const detalleOrden = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findById(id)
      .populate("cliente", "nombre apellido email")
      .populate("productoPedido.producto", "nombre imagenUrl precio");

    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });
    if (req.usuario.rol === 'cliente' && orden.cliente._id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ msg: "Acceso no autorizado." });
    }

    res.status(200).json(orden);
  } catch (error) {
    res.status(500).json({ msg: "Error en el servidor al obtener la orden." });
  }
};

// Actualizar el estado de una orden
const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });

    const { estadoPago, estadoEnvio, estadoOrden } = req.body;
    if (estadoPago !== undefined) {
      orden.estadoPago = estadoPago;
      orden.fechaPago = estadoPago ? new Date() : null;
    }
    if (estadoEnvio !== undefined) {
      orden.estadoEnvio = estadoEnvio;
      orden.fechaEnvio = estadoEnvio ? new Date() : null;
    }
    if (estadoOrden) orden.estadoOrden = estadoOrden;

    const ordenActualizada = await orden.save();
    res.status(200).json({ msg: "Estado de la orden actualizado.", orden: ordenActualizada });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar la orden." });
  }
};

// Eliminar una orden
const eliminarOrden = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findByIdAndDelete(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });
    res.status(200).json({ msg: "Orden eliminada exitosamente." });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar la orden." });
  }
};

export {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden
}