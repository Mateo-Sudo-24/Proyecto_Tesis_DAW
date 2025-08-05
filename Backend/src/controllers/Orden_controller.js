import Orden from "../models/Orden.js";
import mongoose from "mongoose";
import shortid from "shortid";

// POST - Crear nueva orden
const registrarOrden = async (req, res) => {
  const {
    cliente,
    productoPedido,
    direccionEnvio,
    metodoPago,
    precioImpuesto,
    precioEnvio,
    precioTotal,
  } = req.body;

  if (
    !cliente ||
    !productoPedido || productoPedido.length === 0 ||
    !direccionEnvio ||
    !metodoPago ||
    precioImpuesto == null ||
    precioEnvio == null ||
    precioTotal == null
  ) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(cliente)) {
      return res.status(400).json({ msg: "ID de cliente no válido" });
    }

    for (const item of productoPedido) {
      if (
        !item.nombre ||
        item.cantidad == null ||
        !item.imagen ||
        item.precio == null ||
        !item.producto ||
        !mongoose.Types.ObjectId.isValid(item.producto)
      ) {
        return res.status(400).json({ msg: "Información de productos incompleta o incorrecta" });
      }
    }

    const orden = new Orden({
      cliente,
      productoPedido,
      direccionEnvio,
      metodoPago,
      precioImpuesto,
      precioEnvio,
      precioTotal,
      codigoOrden: shortid.generate()
    });

    await orden.save();
    res.status(201).json({ msg: "Orden registrada correctamente", orden });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar la orden" });
  }
};

// GET - Listar todas las órdenes
const listarOrdenes = async (req, res) => {
  try {
    const ordenes = await Orden.find()
      .populate("cliente", "nombre apellido email")
      .populate("productoPedido.producto", "nombre imagenUrl precio");
    res.status(200).json(ordenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al listar las órdenes" });
  }
};

// GET - Ver detalle de una orden
const detalleOrden = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID no válido" });
    }

    const orden = await Orden.findById(id)
      .populate("cliente", "nombre apellido email")
      .populate("productoPedido.producto", "nombre imagenUrl precio");

    if (!orden) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    res.status(200).json(orden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener detalle de la orden" });
  }
};

// PATCH - Actualizar estado de la orden (envío o pago)
const actualizarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoPago, estadoEnvio, estadoOrden } = req.body;

    const orden = await Orden.findById(id);
    if (!orden) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    if (estadoPago != null) {
      orden.estadoPago = estadoPago;
      orden.fechaPago = estadoPago ? new Date() : null;
    }

    if (estadoEnvio != null) {
      orden.estadoEnvio = estadoEnvio;
      orden.fechaEnvio = estadoEnvio ? new Date() : null;
    }

    if (estadoOrden) {
      orden.estadoOrden = estadoOrden;
    }

    await orden.save();
    res.status(200).json({ msg: "Estado de orden actualizado", orden });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar estado de orden" });
  }
};

// DELETE - Eliminar orden (opcional)
const eliminarOrden = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID no válido" });
    }

    const orden = await Orden.findByIdAndDelete(id);
    if (!orden) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    res.status(200).json({ msg: "Orden eliminada exitosamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar orden" });
  }
};
const buscarOrdenId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID de orden no válido" });
  }

  try {
    const orden = await Orden.findById(id).populate('cliente').populate('productoPedido.producto');

    if (!orden) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    res.status(200).json(orden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al buscar orden" });
  }
};
const buscarOrdenNombre = async (req, res) => {
  const { nombre } = req.query;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ msg: "Debe proporcionar un nombre de cliente" });
  }

  try {
    // Buscar clientes que coincidan con el nombre
    const ordenes = await Orden.find()
      .populate({
        path: 'cliente',
        match: { nombre: { $regex: nombre, $options: 'i' } } // insensible a mayúsculas
      })
      .populate('productoPedido.producto');

    // Filtrar las que realmente tienen cliente
    const filtradas = ordenes.filter(o => o.cliente);

    if (filtradas.length === 0) {
      return res.status(404).json({ msg: "No se encontraron órdenes para ese cliente" });
    }

    res.status(200).json(filtradas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al buscar órdenes por nombre" });
  }
};


export {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden
};
