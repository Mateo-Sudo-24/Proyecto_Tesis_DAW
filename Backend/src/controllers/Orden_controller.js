import Orden from "../models/Orden.js";
import Cliente from "../models/Cliente.js";
import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js';
import mongoose from "mongoose";
import stripe from '../config/stripe.js';

// POST /api/ordenes
// Crear una nueva orden
const registrarOrden = async (req, res) => {
    const clienteId = req.usuario._id;
    const { direccionEnvio, metodoPago } = req.body;

    // --- ¡VALIDACIÓN AÑADIDA! ---
    // Verificar que direccionEnvio sea un objeto antes de continuar.
    if (typeof direccionEnvio !== 'object' || direccionEnvio === null) {
        return res.status(400).json({ msg: "El campo 'direccionEnvio' debe ser un objeto con los detalles de la dirección." });
    }
    // --- FIN DE LA VALIDACIÓN ---

    if (!direccionEnvio || !metodoPago) {
        return res.status(400).json({ msg: "La dirección de envío y el método de pago son obligatorios." });
    }

    try {
        const carrito = await Carrito.findOne({ cliente: clienteId }).populate('items.producto');
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).json({ msg: "Tu carrito está vacío. No se puede crear una orden." });
        }

        let precioTotal = 0;
        const productosPedido = carrito.items.map(item => {
            if (!item.producto) throw new Error(`Un producto en tu carrito ya no está disponible.`);
            if (item.producto.stock < item.cantidad) throw new Error(`Stock insuficiente para: ${item.producto.nombre}`);
            
            precioTotal += item.cantidad * item.producto.precio;
            return {
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                imagen: item.producto.imagenUrl,
                precio: item.producto.precio,
                producto: item.producto._id
            };
        });
        
        const orden = new Orden({
            cliente: clienteId,
            productoPedido: productosPedido,
            direccionEnvio,
            metodoPago,
            precioTotal,
        });
        
        await orden.save();
        
        for (const item of carrito.items) {
            await Producto.findByIdAndUpdate(item.producto._id, {
                $inc: { stock: -item.cantidad }
            });
        }

        carrito.items = [];
        await carrito.save();

        res.status(201).json({ msg: "Orden creada exitosamente", orden });
    } catch (error) {
        if (error.message.startsWith('Stock insuficiente') || error.message.startsWith('Un producto en tu carrito')) {
            return res.status(400).json({ msg: error.message });
        }
        console.error("Error al registrar la orden:", error);
        res.status(500).json({ msg: "Error en el servidor al registrar la orden." });
    }
};

// GET /api/ordenes
// Listar órdenes (con filtros y seguridad por rol)
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
      .populate("productoPedido.producto", "nombre");

    res.status(200).json(ordenes);
  } catch (error) {
    res.status(500).json({ msg: "Error en el servidor al listar las órdenes." });
  }
};

// GET /api/ordenes/:id
// Ver el detalle de una orden (Cliente ve solo sus órdenes, Vendedor/Admin ven cualquiera)
const detalleOrden = async (req, res) => {
  const { id } = req.params;
  const { rol, _id } = req.usuario;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findById(id).populate("cliente", "nombre apellido email");
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });
    
    // Cliente solo puede ver sus propias órdenes
    if (rol === 'cliente' && orden.cliente._id.toString() !== _id.toString()) {
      return res.status(403).json({ msg: "Acceso no autorizado." });
    }
    // Vendedor y Admin pueden ver cualquier orden
    
    res.status(200).json(orden);
  } catch (error) {
    res.status(500).json({ msg: "Error en el servidor al obtener la orden." });
  }
};

// PATCH /api/ordenes/:id
// Actualizar el estado de una orden (Admin: control total, Vendedor: solo envío)
const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.usuario;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });

    // Validar: No hay solicitud de cancelación pendiente
    if (orden.solicitudCancelacion.estado === 'pendiente') {
      return res.status(400).json({ msg: "No se puede actualizar una orden con solicitud de cancelación pendiente." });
    }

    const { estadoPago, estadoEnvio, estadoOrden } = req.body;

    // ADMIN: Control total sobre todos los campos
    if (rol === 'administrador') {
      if (estadoPago !== undefined) {
        orden.estadoPago = estadoPago;
        orden.fechaPago = estadoPago ? new Date() : null;
      }
      if (estadoEnvio !== undefined) {
        orden.estadoEnvio = estadoEnvio;
        orden.fechaEnvio = estadoEnvio ? new Date() : null;
      }
      if (estadoOrden) orden.estadoOrden = estadoOrden;
    }
    // VENDEDOR: Solo puede actualizar estadoEnvio y estadoOrden (envío)
    else if (rol === 'vendedor') {
      if (estadoPago !== undefined) {
        return res.status(403).json({ msg: "Los vendedores no pueden actualizar el estado de pago." });
      }
      if (estadoEnvio !== undefined) {
        orden.estadoEnvio = estadoEnvio;
        orden.fechaEnvio = estadoEnvio ? new Date() : null;
      }
      if (estadoOrden) {
        // Vendedor solo puede establecer estados relacionados con envío: 'procesando', 'enviado'
        if (!['procesando', 'enviado'].includes(estadoOrden)) {
          return res.status(403).json({ msg: "Los vendedores solo pueden actualizar a estados: 'procesando', 'enviado'." });
        }
        orden.estadoOrden = estadoOrden;
      }
    }

    const ordenActualizada = await orden.save();
    res.status(200).json({ msg: "Estado de la orden actualizado.", orden: ordenActualizada });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar la orden." });
  }
};

// DELETE /api/ordenes/:id
// Eliminar una orden (Solo administrador)
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

// POST /api/ordenes/:id/solicitar-cancelacion
// Solicitar cancelación de orden (Cliente o Vendedor)
const solicitarCancelacion = async (req, res) => {
  const { id } = req.params;
  const { rol, _id } = req.usuario;
  const { razon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });
  if (!razon || razon.trim().length === 0) {
    return res.status(400).json({ msg: "La razón de cancelación es obligatoria." });
  }

  try {
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });

    // Validar: Cliente solo puede solicitar cancelación de sus propias órdenes
    if (rol === 'cliente' && orden.cliente.toString() !== _id.toString()) {
      return res.status(403).json({ msg: "No tienes permiso para solicitar cancelación de esta orden." });
    }

    // Validar: No se puede cancelar orden ya completada/entregada/cancelada
    if (['entregado', 'completado', 'cancelado'].includes(orden.estadoOrden)) {
      return res.status(400).json({ msg: `No se puede cancelar una orden en estado '${orden.estadoOrden}'.` });
    }

    // Validar: No puede haber otra solicitud de cancelación pendiente
    if (orden.solicitudCancelacion.estado === 'pendiente') {
      return res.status(400).json({ msg: "Ya existe una solicitud de cancelación pendiente para esta orden." });
    }

    // Crear solicitud de cancelación
    orden.solicitudCancelacion = {
      estado: 'pendiente',
      solicitadoEn: new Date(),
      solicitadoPor: rol,
      razon: razon.trim()
    };

    await orden.save();
    res.status(200).json({ msg: "Solicitud de cancelación creada. Aguardando respuesta...", orden });
  } catch (error) {
    console.error("Error al solicitar cancelación:", error);
    res.status(500).json({ msg: "Error al solicitar cancelación de la orden." });
  }
};

// POST /api/ordenes/:id/aprobar-cancelacion
// Aprobar cancelación de orden (El otro rol aprueba)
const aprobarCancelacion = async (req, res) => {
  const { id } = req.params;
  const { rol, _id } = req.usuario;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });

  try {
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });

    // Validar: Hay una solicitud pendiente
    if (orden.solicitudCancelacion.estado !== 'pendiente') {
      return res.status(400).json({ msg: "No hay solicitud de cancelación pendiente para esta orden." });
    }

    // Validar: Solo puede aprobar quien NO hizo la solicitud
    if (orden.solicitudCancelacion.solicitadoPor === rol) {
      return res.status(403).json({ msg: "No puedes aprobar tu propia solicitud de cancelación." });
    }

    // Validar: Si es cliente, solo aprueba si vendedor solicitó
    if (rol === 'cliente' && orden.cliente.toString() !== _id.toString()) {
      return res.status(403).json({ msg: "No tienes permiso para responder a esta solicitud de cancelación." });
    }

    // Aprobar cancelación
    orden.solicitudCancelacion.estado = 'aprobada';
    orden.solicitudCancelacion.aprobadoPor = rol;
    orden.solicitudCancelacion.respondidoEn = new Date();
    orden.estadoOrden = 'cancelado';

    await orden.save();
    res.status(200).json({ msg: "Cancelación aprobada. Orden cancela.", orden });
  } catch (error) {
    console.error("Error al aprobar cancelación:", error);
    res.status(500).json({ msg: "Error al aprobar cancelación de la orden." });
  }
};

// POST /api/ordenes/:id/rechazar-cancelacion
// Rechazar cancelación de orden (El otro rol rechaza)
const rechazarCancelacion = async (req, res) => {
  const { id } = req.params;
  const { rol, _id } = req.usuario;
  const { motivo } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden no válido." });
  if (!motivo || motivo.trim().length === 0) {
    return res.status(400).json({ msg: "El motivo del rechazo es obligatorio." });
  }

  try {
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });

    // Validar: Hay una solicitud pendiente
    if (orden.solicitudCancelacion.estado !== 'pendiente') {
      return res.status(400).json({ msg: "No hay solicitud de cancelación pendiente para esta orden." });
    }

    // Validar: Solo puede rechazar quien NO hizo la solicitud
    if (orden.solicitudCancelacion.solicitadoPor === rol) {
      return res.status(403).json({ msg: "No puedes rechazar tu propia solicitud de cancelación." });
    }

    // Validar: Si es cliente, solo rechaza si vendedor solicitó
    if (rol === 'cliente' && orden.cliente.toString() !== _id.toString()) {
      return res.status(403).json({ msg: "No tienes permiso para responder a esta solicitud de cancelación." });
    }

    // Rechazar cancelación
    orden.solicitudCancelacion.estado = 'rechazada';
    orden.solicitudCancelacion.aprobadoPor = rol;
    orden.solicitudCancelacion.motivoRechazo = motivo.trim();
    orden.solicitudCancelacion.respondidoEn = new Date();

    await orden.save();
    res.status(200).json({ msg: "Cancelación rechazada. Orden se mantiene activa.", orden });
  } catch (error) {
    console.error("Error al rechazar cancelación:", error);
    res.status(500).json({ msg: "Error al rechazar cancelación de la orden." });
  }
};


// POST /api/pagos/crear-intento-pago
// Procesar un pago de orden con Stripe
const procesarPagoOrden = async (req, res) => {
    const { ordenId, paymentMethodId } = req.body;
    const clienteId = req.usuario._id;

    if (!ordenId || !paymentMethodId) {
        return res.status(400).json({ msg: "Se requiere el ID de la orden" });
    }

    // Validar que Stripe está configurado
    if (!stripe) {
        return res.status(503).json({ msg: "Servicio de pagos no disponible. STRIPE_PRIVATE_KEY no está configurada." });
    }

    try {
        const orden = await Orden.findById(ordenId).populate('cliente');
        if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });
        if (orden.cliente._id.toString() !== clienteId.toString()) return res.status(403).json({ msg: "No tienes permiso para pagar esta orden." });
        if (orden.estadoPago) return res.status(400).json({ msg: "Esta orden ya ha sido pagada." });

        let clienteStripe;
        const clientesStripe = await stripe.customers.list({ email: orden.cliente.email, limit: 1 });
        if (clientesStripe.data.length > 0) {
            clienteStripe = clientesStripe.data[0];
        } else {
            clienteStripe = await stripe.customers.create({ name: `${orden.cliente.nombre} ${orden.cliente.apellido}`, email: orden.cliente.email });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(orden.precioTotal * 100),
            currency: "usd",
            description: `Pago por Orden #${orden.codigoOrden}`,
            payment_method: paymentMethodId,
            customer: clienteStripe.id,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" }
        });

        if (paymentIntent.status === 'succeeded') {
            orden.estadoPago = true;
            orden.estadoOrden = 'pagado';
            orden.fechaPago = new Date();
            orden.pagoStripeId = paymentIntent.id;
            await orden.save();
            return res.status(200).json({ msg: "El pago se realizó exitosamente." });
        } else {
            return res.status(400).json({ msg: "El pago no pudo ser procesado por Stripe." });
        }
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        return res.status(500).json({ msg: "Error en el servidor al procesar el pago.", error: error.message });
    }
};

export {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  procesarPagoOrden,
  solicitarCancelacion,
  aprobarCancelacion,
  rechazarCancelacion
};