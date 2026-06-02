import Orden from "../models/Orden.js";
import Cliente from "../models/Cliente.js";
import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js';
import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';
import Vendedor from '../models/Vendedor.js';
import mongoose from "mongoose";
import stripe from '../config/stripe.js';

const limpiarTexto = (valor) => String(valor ?? '').trim();
const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');
const nombreRegex = /^(?=.{2,60}$)(?=(?:.*[\p{L}]){2,})[\p{L}\p{M}]+(?:[\s.'-][\p{L}\p{M}]+)*$/u;
const nombreOrdenRegex = /^(?=.{5,60}$)(?=(?:.*[\p{L}]){5,})[\p{L}\p{M}]+(?:[\s.'-][\p{L}\p{M}]+)*$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;
const telefonoRegex = /^0\d{9}$/;
const documentoRegex = /^(\d{10}|\d{13})$/;
const flujoManualOrden = ['pagado', 'procesando', 'listo', 'entregado'];
const esPagoTarjetaOnline = (metodo = '') => {
    const normalizado = String(metodo).toLowerCase();
    return normalizado.includes('tarjeta en linea')
        || normalizado.includes('tarjeta en l')
        || normalizado === 'stripe';
};

const esPaymentMethodDemo = (paymentMethodId = '') => (
    ['demo_card_4242', 'pm_card_visa', 'pm_card_mastercard'].includes(String(paymentMethodId))
);

const pagosDemoHabilitados = () => (
    process.env.STRIPE_DEMO_MODE === 'true'
    || !process.env.STRIPE_PRIVATE_KEY
    || String(process.env.STRIPE_PRIVATE_KEY).startsWith('sk_test_')
);

const esPagoPresencial = (metodo = '') => {
    const normalizado = String(metodo).toLowerCase();
    return normalizado.includes('efectivo')
        || normalizado.includes('debito')
        || normalizado.includes('dÃ©bito');
};

const getTotalOrden = (orden = {}) => {
    const totalFinal = Number(orden.totalFinal);
    if (Number.isFinite(totalFinal) && totalFinal > 0) return totalFinal;
    const precioTotal = Number(orden.precioTotal);
    if (Number.isFinite(precioTotal) && precioTotal > 0) return precioTotal;
    const total = Number(orden.total);
    if (Number.isFinite(total) && total > 0) return total;
    return 0;
};

const validarAvanceManualOrden = (estadoActualRaw, estadoSiguiente) => {
    const estadoActual = estadoActualRaw === 'pendiente' ? 'pagado' : estadoActualRaw;
    const indiceActual = flujoManualOrden.indexOf(estadoActual);
    const indiceSiguiente = flujoManualOrden.indexOf(estadoSiguiente);

    return ['procesando', 'listo', 'entregado'].includes(estadoSiguiente)
        && indiceActual !== -1
        && indiceSiguiente === indiceActual + 1;
};

const crearEmailGuest = () => `guest.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@intex.local`;

const validarDatosFacturacion = (datos = {}, { minLetras = 5 } = {}) => {
    const nombre = limpiarTexto(datos.nombre);
    const apellido = limpiarTexto(datos.apellido);
    const correo = limpiarTexto(datos.correo || datos.email).toLowerCase();
    const direccion = limpiarTexto(datos.direccion);
    const ruc = soloDigitos(datos.ruc);
    const telefono = soloDigitos(datos.telefono);
    const regexNombre = minLetras >= 5 ? nombreOrdenRegex : nombreRegex;

    if (!regexNombre.test(nombre)) return `El nombre debe tener al menos ${minLetras} letras y solo caracteres validos.`;
    if (!regexNombre.test(apellido)) return `El apellido debe tener al menos ${minLetras} letras y solo caracteres validos.`;
    if (!emailRegex.test(correo)) return 'Ingresa un correo valido.';
    if (!documentoRegex.test(ruc)) return 'Usa cedula de 10 digitos o RUC de 13.';
    if (!telefonoRegex.test(telefono)) return 'El telefono debe tener 10 digitos y empezar con 0.';
    if (direccion.length < 5) return 'La direccion debe tener al menos 5 caracteres.';
    return null;
};

const normalizarDatosFacturacion = (datos = {}) => {
    const ruc = soloDigitos(datos.ruc);
    const telefono = soloDigitos(datos.telefono);
    return {
        nombre: limpiarTexto(datos.nombre),
        apellido: limpiarTexto(datos.apellido),
        correo: limpiarTexto(datos.correo).toLowerCase(),
        direccion: limpiarTexto(datos.direccion),
        ruc: /^(\d{10}|\d{13})$/.test(ruc) ? ruc : undefined,
        telefono: /^0\d{8,9}$/.test(telefono) ? telefono : '',
    };
};

const seleccionarVendedorRotativo = async () => {
    const vendedoresActivos = await Vendedor.find({ status: 'activo' }).select('_id').sort({ createdAt: 1 }).lean();
    if (vendedoresActivos.length === 0) return undefined;
    if (vendedoresActivos.length === 1) return vendedoresActivos[0]._id;

    const ultimaOrdenConVendedor = await Orden.findOne({ vendedor: { $exists: true, $ne: null } })
        .select('vendedor')
        .sort({ createdAt: -1 })
        .lean();
    const ultimoIndex = vendedoresActivos.findIndex(v => String(v._id) === String(ultimaOrdenConVendedor?.vendedor));
    const siguienteIndex = ultimoIndex === -1 ? 0 : (ultimoIndex + 1) % vendedoresActivos.length;
    return vendedoresActivos[siguienteIndex]._id;
};

// ─── Helper: crear notificación de pago para todos los admins ───────────────
const crearNotificacionNuevaOrden = async (orden) => {
    try {
        const admins = await Administrador.find().select('_id');
        const codigo = orden.codigoOrden ?? orden._id.toString().slice(-6).toUpperCase();
        const total = getTotalOrden(orden).toFixed(2);
        const tipoE = orden.tipoEntrega ?? 'N/D';
        const metodo = orden.metodoPago ?? 'N/D';
        const clienteNombre = orden.datosFacturacion
            ? `${orden.datosFacturacion.nombre ?? ''} ${orden.datosFacturacion.apellido ?? ''}`.trim()
            : 'Cliente';
        await Promise.all(admins.map(admin =>
            Notificacion.crearConCifrado({
                administrador: admin._id,
                tipo: 'pago_completado',
                mensaje: `🛒 Nueva orden #${codigo} — $${total} — Entrega: ${tipoE} — Método: ${metodo} — Cliente: ${clienteNombre}`,
                leida: false,
                estadoGestion: 'pendiente',
                metadatos: { timestamp: new Date() }
            })
        ));
    } catch (err) {
        console.error('❌ Error al crear notificación de nueva orden:', err.message);
    }
};

const crearNotificacionPago = async (orden) => {
    try {
        const admins = await Administrador.find().select('_id');
        const codigo = orden.codigoOrden ?? orden._id.toString().slice(-6).toUpperCase();
        const total = getTotalOrden(orden).toFixed(2);
        const tipoE = orden.tipoEntrega ?? 'N/D';
        const clienteNombre = orden.datosFacturacion
            ? `${orden.datosFacturacion.nombre ?? ''} ${orden.datosFacturacion.apellido ?? ''}`.trim()
            : 'Cliente';
        await Promise.all(admins.map(admin =>
            Notificacion.crearConCifrado({
                administrador: admin._id,
                tipo: 'pago_completado',
                mensaje: `💳 Pago completado: Orden #${codigo} — $${total} — Entrega: ${tipoE} — Método: ${orden.metodoPago} — Cliente: ${clienteNombre}`,
                leida: false,
                estadoGestion: 'pendiente',
                metadatos: { timestamp: new Date() }
            })
        ));
    } catch (err) {
        console.error('❌ Error al crear notificación de pago:', err.message);
    }
};

// ─── Helper: crear notificación de confirmación para vendedor asignado o todos ──
const crearNotificacionConfirmacionVendedores = async (orden) => {
    try {
        const codigoOrden = orden.codigoOrden ?? orden._id.toString().slice(-6).toUpperCase();
        const total = getTotalOrden(orden).toFixed(2);
        const entrega = orden.tipoEntrega ?? 'N/D';
        const msgVendedor = `✅ Orden #${codigoOrden} confirmada y pagada — $${total} — Entrega: ${entrega}. Por favor procesa el pedido.`;
        const msgAdmin = `✅ Confirmaste el pago de la Orden #${codigoOrden} por $${total} — Entrega: ${entrega}. Los vendedores han sido notificados.`;

        // Notificar al vendedor asignado o a todos los activos
        let vendedorIds = [];
        if (orden.vendedor) {
            vendedorIds = [{ _id: orden.vendedor }];
        } else {
            vendedorIds = await Vendedor.find({ status: 'activo' }).select('_id');
        }

        const admins = await Administrador.find().select('_id');

        await Promise.all([
            ...vendedorIds.map(v =>
                Notificacion.crearConCifrado({
                    vendedor: v._id,
                    tipo: 'confirmacion_pedido',
                    mensaje: msgVendedor,
                    leida: false,
                    estadoGestion: 'pendiente',
                    metadatos: { timestamp: new Date() }
                })
            ),
            ...admins.map(admin =>
                Notificacion.crearConCifrado({
                    administrador: admin._id,
                    tipo: 'confirmacion_pedido',
                    mensaje: msgAdmin,
                    leida: false,
                    estadoGestion: 'pendiente',
                    metadatos: { timestamp: new Date() }
                })
            )
        ]);
    } catch (err) {
        console.error('❌ Error al crear notificación de confirmación:', err.message);
    }
};

// POST /api/ordenes
// Crear una nueva orden
const registrarOrden = async (req, res) => {
    const clienteId = req.usuario._id;
    const { direccionEnvio, metodoPago, tipoEntrega, datosFacturacion, desglose } = req.body;

    // Para venta_local o establecimiento, direccionEnvio puede ser null/vacío
    const tipoEntregaFinal = tipoEntrega || 'domicilio';
    const requiereDireccion = ['domicilio'].includes(tipoEntregaFinal);

    if (requiereDireccion && (typeof direccionEnvio !== 'object' || direccionEnvio === null)) {
        return res.status(400).json({ msg: "El campo 'direccionEnvio' es obligatorio para entregas a domicilio." });
    }

    if (!metodoPago) {
        return res.status(400).json({ msg: "El método de pago es obligatorio." });
    }

    try {
        const carrito = await Carrito.findOne({ cliente: clienteId }).populate('items.producto');
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).json({ msg: "Tu carrito está vacío. No se puede crear una orden." });
        }

        const productosPedido = carrito.items.map(item => {
            if (!item.producto) throw new Error(`Un producto en tu carrito ya no está disponible.`);
            const unidad = item.unidadSeleccionada || 'metro';
            const precioUnitario = unidad === 'rollo'
                ? (item.producto.precioPorRollo || item.producto.precio)
                : (item.producto.precioPorMetro || item.producto.precio);
            const descuentoPct = item.producto.descuento || 0;
            const precioConDesc = precioUnitario * (1 - descuentoPct / 100);
            const subtotalItem = item.cantidad * precioConDesc;

            // Validación de stock en metros
            const metrosRequeridos = unidad === 'rollo'
                ? item.cantidad * (item.producto.metrosPorRollo || 100)
                : item.cantidad;
            if ((item.producto.metrosDisponibles ?? 0) < metrosRequeridos) {
                throw new Error(`Stock insuficiente para: ${item.producto.nombre}`);
            }

            return {
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                unidadSeleccionada: unidad,
                imagen: item.producto.imagenUrl,
                precio: precioUnitario,
                precioUnitario,
                descuento: descuentoPct,
                subtotal: subtotalItem,
                producto: item.producto._id
            };
        });

        // Desglose financiero: usar el enviado por frontend o recalcular
        const IVA_RATE = 0.15;
        const COMISION_STRIPE_PCT = 0.054;
        const COMISION_STRIPE_FIJA = 0.30;
        const subtotalBase = productosPedido.reduce((s, i) => s + i.subtotal, 0);
        const descuentoTotal = desglose?.descuentoTotal ?? 0;
        const subtotal = desglose?.subtotal ?? subtotalBase;
        const iva = desglose?.iva ?? parseFloat((subtotal * IVA_RATE).toFixed(2));
        const envio = desglose?.envio ?? 0;
        const comisionPago = desglose?.comisionPago ?? (
            esPagoTarjetaOnline(metodoPago)
                ? parseFloat(((subtotal + iva) * COMISION_STRIPE_PCT + COMISION_STRIPE_FIJA).toFixed(2))
                : 0
        );
        const totalFinal = desglose?.totalFinal ?? parseFloat((subtotal + iva + envio + comisionPago).toFixed(2));

        const datosFacturacionLimpios = datosFacturacion && typeof datosFacturacion === 'object'
            ? {
                nombre: limpiarTexto(datosFacturacion.nombre),
                apellido: limpiarTexto(datosFacturacion.apellido),
                correo: limpiarTexto(datosFacturacion.correo).toLowerCase(),
                direccion: limpiarTexto(datosFacturacion.direccion),
                ruc: soloDigitos(datosFacturacion.ruc),
                telefono: soloDigitos(datosFacturacion.telefono),
            }
            : undefined;

        const errorFacturacion = validarDatosFacturacion(datosFacturacionLimpios, { minLetras: 5 });
        if (errorFacturacion) {
            return res.status(400).json({ msg: errorFacturacion });
        }

        const vendedorAsignado = req.usuario.rol === 'vendedor'
            ? req.usuario._id
            : await seleccionarVendedorRotativo();

        const orden = new Orden({
            cliente: clienteId,
            vendedor: vendedorAsignado,
            productoPedido: productosPedido,
            direccionEnvio: requiereDireccion ? direccionEnvio : undefined,
            metodoPago,
            precioTotal: totalFinal,
            subtotal,
            descuentoTotal,
            iva,
            envio,
            comisionPago,
            totalFinal,
            tipoEntrega: tipoEntregaFinal,
            datosFacturacion: datosFacturacionLimpios,
        });

        await orden.save();

        // Notificar al admin sobre nueva orden creada
        crearNotificacionNuevaOrden(orden).catch(() => {});

        // Descontar stock en metros
        for (const item of carrito.items) {
            const unidad = item.unidadSeleccionada || 'metro';
            const metros = unidad === 'rollo'
                ? item.cantidad * ((await Producto.findById(item.producto._id).select('metrosPorRollo'))?.metrosPorRollo || 100)
                : item.cantidad;
            await Producto.findByIdAndUpdate(item.producto._id, {
                $inc: { metrosDisponibles: -metros }
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

const registrarOrdenTienda = async (req, res) => {
    if (req.usuario.rol !== 'vendedor') {
        return res.status(403).json({ msg: "Solo los vendedores pueden registrar pedidos en tienda." });
    }

    const {
        items = [],
        cliente = {},
        metodoPago = 'Pago efectivo / tarjeta debito',
        desglose,
        tipoEntrega = 'venta_local',
        direccionEnvio,
        datosFacturacion: datosFacturacionBody,
    } = req.body;
    const tipoEntregaFinal = tipoEntrega === 'domicilio' ? 'domicilio' : 'venta_local';
    const esVentaLocal = tipoEntregaFinal === 'venta_local';
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ msg: "Agrega al menos un producto para registrar la venta." });
    }

    const nombreCliente = limpiarTexto(cliente.nombre);
    if (!nombreCliente) {
        return res.status(400).json({ msg: "El nombre del cliente es obligatorio." });
    }
    const errorClienteTienda = validarDatosFacturacion({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.email,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        ruc: cliente.ruc
    }, { minLetras: 2 });
    if (errorClienteTienda) {
        return res.status(400).json({ msg: errorClienteTienda });
    }
    if (tipoEntregaFinal === 'domicilio' && (typeof direccionEnvio !== 'object' || direccionEnvio === null)) {
        return res.status(400).json({ msg: "La direccion de envio es obligatoria para pedidos a domicilio." });
    }

    const emailCliente = limpiarTexto(cliente.email).toLowerCase();

    try {
        const ids = items.map(item => item.productoId).filter(Boolean);
        const productos = await Producto.find({ _id: { $in: ids } });
        const productosMap = new Map(productos.map(producto => [String(producto._id), producto]));

        const productosPedido = items.map(item => {
            const producto = productosMap.get(String(item.productoId));
            if (!producto) throw new Error("Uno de los productos seleccionados ya no existe.");

            const cantidad = Number(item.cantidad);
            const unidad = item.unidadSeleccionada === 'rollo' ? 'rollo' : 'metro';
            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                throw new Error(`Cantidad inválida para ${producto.nombre}.`);
            }

            const cantidadFinal = unidad === 'rollo' ? Math.ceil(cantidad) : cantidad;
            const metrosRequeridos = unidad === 'rollo'
                ? cantidadFinal * (producto.metrosPorRollo || 100)
                : cantidadFinal;
            if ((producto.metrosDisponibles ?? 0) < metrosRequeridos) {
                throw new Error(`Stock insuficiente para: ${producto.nombre}`);
            }

            const precioUnitario = unidad === 'rollo'
                ? (producto.precioPorRollo || producto.precio)
                : (producto.precioPorMetro || producto.precio);
            const descuentoPct = producto.descuento || 0;
            const precioConDesc = precioUnitario * (1 - descuentoPct / 100);

            return {
                nombre: producto.nombre,
                cantidad: cantidadFinal,
                unidadSeleccionada: unidad,
                imagen: producto.imagenUrl,
                precio: precioUnitario,
                precioUnitario,
                descuento: descuentoPct,
                subtotal: cantidadFinal * precioConDesc,
                producto: producto._id,
                metrosRequeridos
            };
        });

        let clienteOrden = emailCliente
            ? await Cliente.findOne({ email: emailCliente })
            : null;

        if (emailCliente && !clienteOrden) {
            const [adminConCorreo, vendedorConCorreo] = await Promise.all([
                Administrador.findOne({ email: emailCliente }).lean(),
                Vendedor.findOne({ email: emailCliente }).lean()
            ]);
            if (adminConCorreo || vendedorConCorreo) {
                const rolExistente = adminConCorreo ? 'administrador' : 'vendedor';
                return res.status(400).json({ msg: `Este correo ya está registrado como ${rolExistente}. Usa otro correo para el cliente guest.` });
            }
        }

        if (!clienteOrden) {
            clienteOrden = new Cliente({
                nombre: nombreCliente,
                apellido: limpiarTexto(cliente.apellido),
                email: emailCliente || crearEmailGuest(),
                telefono: soloDigitos(cliente.telefono),
                direccion: limpiarTexto(cliente.direccion),
                password: Math.random().toString(36).slice(2) + Date.now(),
                confirmEmail: false,
                creadoPor: req.usuario._id
            });
            clienteOrden.crearToken();
            await clienteOrden.save();
        }

        const IVA_RATE = 0.15;
        const subtotalBase = productosPedido.reduce((s, item) => s + item.subtotal, 0);
        const subtotal = Number(desglose?.subtotal) || subtotalBase;
        const descuentoTotal = Number(desglose?.descuentoTotal) || 0;
        const iva = Number(desglose?.iva) || Number((subtotal * IVA_RATE).toFixed(2));
        const envio = Number(desglose?.envio) || 0;
        const comisionPago = Number(desglose?.comisionPago) || 0;
        const totalFinal = Number(desglose?.totalFinal) || Number((subtotal + iva + envio + comisionPago).toFixed(2));

        const datosFacturacion = normalizarDatosFacturacion(datosFacturacionBody && typeof datosFacturacionBody === 'object' ? datosFacturacionBody : {
            nombre: clienteOrden.nombre,
            apellido: clienteOrden.apellido,
            correo: clienteOrden.email,
            direccion: clienteOrden.direccion,
            telefono: clienteOrden.telefono,
            ruc: cliente.ruc
        });

        const orden = await Orden.create({
            cliente: clienteOrden._id,
            vendedor: req.usuario._id,
            productoPedido: productosPedido.map(({ metrosRequeridos, ...item }) => item),
            metodoPago,
            precioTotal: totalFinal,
            subtotal,
            descuentoTotal,
            iva,
            envio,
            comisionPago,
            totalFinal,
            tipoEntrega: tipoEntregaFinal,
            direccionEnvio: tipoEntregaFinal === 'domicilio' ? direccionEnvio : undefined,
            origenPedido: 'tienda',
            clienteGuest: !emailCliente || !clienteOrden.confirmEmail,
            datosFacturacion,
            estadoPago: esVentaLocal ? 'completado' : 'pendiente',
            estadoOrden: esVentaLocal ? 'pagado' : 'pendiente',
            fechaPago: esVentaLocal ? new Date() : undefined
        });

        await Promise.all(productosPedido.map(item =>
            Producto.findByIdAndUpdate(item.producto, { $inc: { metrosDisponibles: -item.metrosRequeridos } })
        ));

        crearNotificacionNuevaOrden(orden).catch(() => {});

        const ordenPopulada = await Orden.findById(orden._id)
            .populate("cliente", "nombre apellido email")
            .populate("vendedor", "nombre apellido nombrePropietario email")
            .populate("productoPedido.producto", "nombre");

        res.status(201).json({ msg: "Pedido en tienda registrado correctamente.", orden: ordenPopulada, cliente: clienteOrden });
    } catch (error) {
        if (error.message.includes('Stock insuficiente') || error.message.includes('inválida') || error.message.includes('ya no existe')) {
            return res.status(400).json({ msg: error.message });
        }
        console.error("Error al registrar la orden en tienda:", error);
        res.status(500).json({ msg: "Error en el servidor al registrar el pedido en tienda." });
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
      .populate("vendedor", "nombre apellido nombrePropietario email")
      .populate("productoPedido.producto", "nombre")
      .sort({ createdAt: -1 });

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
    if (orden.solicitudCancelacion?.estado === 'pendiente') {
      return res.status(400).json({ msg: "No se puede actualizar una orden con solicitud de cancelación pendiente." });
    }

    const { estadoPago, estadoEnvio, estadoOrden } = req.body;

    // ADMIN: Control total sobre todos los campos
    if (rol === 'administrador') {
      if (estadoPago !== undefined) {
        // Aceptar string ('completado', 'pendiente', 'fallido') o legacy boolean
        const nuevoEstadoPago = estadoPago === true || estadoPago === 'completado' ? 'completado'
                              : estadoPago === false || estadoPago === 'pendiente' ? 'pendiente'
                              : estadoPago;
        orden.estadoPago = nuevoEstadoPago;
        orden.fechaPago = nuevoEstadoPago === 'completado' ? new Date() : null;
      }
      if (estadoEnvio !== undefined) {
        orden.estadoEnvio = estadoEnvio;
        orden.fechaEnvio = estadoEnvio ? new Date() : null;
      }
      if (estadoOrden) {
        if (!validarAvanceManualOrden(orden.estadoOrden, estadoOrden)) {
          return res.status(400).json({ msg: "El estado de la orden solo puede avanzar al siguiente paso: procesando, listo, entregado." });
        }
        orden.estadoOrden = estadoOrden;
      }
    }
    // VENDEDOR: Solo puede actualizar estadoEnvio y estadoOrden (envío)
    else if (rol === 'vendedor') {
      if (estadoPago !== undefined) {
        const nuevoEstadoPago = estadoPago === true || estadoPago === 'completado' ? 'completado'
                              : estadoPago === false || estadoPago === 'pendiente' ? 'pendiente'
                              : estadoPago;
        if (nuevoEstadoPago !== 'completado') {
          return res.status(403).json({ msg: "El vendedor solo puede confirmar pagos pendientes." });
        }
        if (orden.estadoPago !== 'completado') {
          orden.estadoPago = 'completado';
          orden.fechaPago = new Date();
          if (orden.estadoOrden === 'pendiente') orden.estadoOrden = 'pagado';
        }
      }
      if (estadoEnvio !== undefined) {
        orden.estadoEnvio = estadoEnvio;
        orden.fechaEnvio = estadoEnvio ? new Date() : null;
      }
      if (estadoOrden) {
        if (orden.estadoPago !== 'completado') {
          return res.status(400).json({ msg: "Primero marca el pago como realizado para avanzar el pedido." });
        }
        // Vendedor gestiona manualmente el flujo pagado -> procesando -> listo -> entregado.
        if (!validarAvanceManualOrden(orden.estadoOrden, estadoOrden)) {
          return res.status(400).json({ msg: "El estado de la orden solo puede avanzar al siguiente paso: procesando, listo, entregado." });
        }
        orden.estadoOrden = estadoOrden;
      }
    }

    const ordenActualizada = await orden.save();

    // Notificar a vendedores cuando admin confirma pago
    if (rol === 'administrador' && (estadoPago === true || estadoPago === 'completado')) {
      crearNotificacionConfirmacionVendedores(ordenActualizada).catch(() => {});
    }

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

    if (!ordenId) {
        return res.status(400).json({ msg: "Se requiere el ID de la orden" });
    }

    try {
        const orden = await Orden.findById(ordenId).populate('cliente');
        if (!orden) return res.status(404).json({ msg: "Orden no encontrada." });
        if (orden.cliente._id.toString() !== clienteId.toString()) {
            return res.status(403).json({ msg: "No tienes permiso para pagar esta orden." });
        }
        if (orden.estadoPago === 'completado') {
            return res.status(400).json({ msg: "Esta orden ya ha sido pagada." });
        }

        // ─── Métodos que no requieren pasarela externa ───────────────────────
        const metodosInmediatos = ['Transferencia Bancaria', 'Efectivo', 'Contra Entrega', 'PayPal', 'De Una',
                                   'Pago contra entrega', 'Pago efectivo / tarjeta débito', 'Pago efectivo / tarjeta debito'];
        if (metodosInmediatos.includes(orden.metodoPago) || esPagoPresencial(orden.metodoPago)) {
            orden.estadoPago = 'pendiente';
            orden.estadoOrden = 'pendiente';
            orden.fechaPago = null;
            await orden.save();
            return res.status(200).json({
                msg: "Pedido registrado. El vendedor debe comprobar el pago antes de marcarlo como realizado.",
                orden,
                estadoPago: 'pendiente',
                estadoOrden: 'pendiente'
            });
        }

        // ─── Pago con Stripe (Tarjeta de Crédito / Stripe) ──────────────────
        if (!paymentMethodId) {
            return res.status(400).json({ msg: "Se requiere el ID del método de pago de Stripe." });
        }
        if (esPaymentMethodDemo(paymentMethodId) && pagosDemoHabilitados()) {
            orden.estadoPago = 'completado';
            orden.estadoOrden = 'pagado';
            orden.fechaPago = new Date();
            orden.pagoStripeId = paymentMethodId;
            await orden.save();
            await crearNotificacionPago(orden);
            return res.status(200).json({
                msg: "Pago demo aprobado correctamente.",
                orden,
                estadoPago: 'completado',
                estadoOrden: 'pagado'
            });
        }
        if (!stripe) {
            return res.status(503).json({ msg: "Servicio de pagos no disponible. STRIPE_PRIVATE_KEY no está configurada." });
        }

        let clienteStripe;
        const clientesStripe = await stripe.customers.list({ email: orden.cliente.email, limit: 1 });
        if (clientesStripe.data.length > 0) {
            clienteStripe = clientesStripe.data[0];
        } else {
            clienteStripe = await stripe.customers.create({
                name: `${orden.cliente.nombre} ${orden.cliente.apellido}`,
                email: orden.cliente.email
            });
        }

        const montoPago = Number(orden.totalFinal) > 0
            ? Number(orden.totalFinal)
            : Number(orden.precioTotal) || 0;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(montoPago * 100),
            currency: "usd",
            description: `Pago por Orden #${orden.codigoOrden}`,
            payment_method: paymentMethodId,
            customer: clienteStripe.id,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" }
        });

        if (paymentIntent.status === 'succeeded') {
            orden.estadoPago = 'completado';
            orden.estadoOrden = 'pagado';
            orden.fechaPago = new Date();
            orden.pagoStripeId = paymentIntent.id;
            await orden.save();
            await crearNotificacionPago(orden);
            return res.status(200).json({ msg: "El pago se realizó exitosamente.", estadoPago: 'completado', estadoOrden: 'pagado' });
        } else {
            orden.estadoPago = 'fallido';
            await orden.save();
            return res.status(400).json({ msg: "El pago no pudo ser procesado por Stripe." });
        }
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        return res.status(500).json({ msg: "Error en el servidor al procesar el pago.", error: error.message });
    }
};

// GET /api/ordenes/reporte
// Reporte consolidado de ventas para el administrador (con filtros de fecha, estado y método de pago)
const reporteVentas = async (req, res) => {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ msg: "Acceso exclusivo para administradores." });
    }

    const { desde, hasta, estadoOrden, metodoPago, estadoPago } = req.query;

    try {
        let filtro = {};
        if (desde || hasta) {
            filtro.createdAt = {};
            if (desde) filtro.createdAt.$gte = new Date(desde);
            if (hasta) filtro.createdAt.$lte = new Date(hasta);
        }
        if (estadoOrden) filtro.estadoOrden = estadoOrden;
        if (metodoPago)  filtro.metodoPago  = metodoPago;
        if (estadoPago !== undefined) filtro.estadoPago = estadoPago;

        const ordenes = await Orden.find(filtro)
            .populate('cliente', 'nombre apellido email')
            .sort({ createdAt: -1 });

        // Estadísticas agregadas
        const totalVentas    = ordenes.length;
        const cuentaComoIngreso = (o) =>
            o.estadoOrden === 'entregado' ||
            (o.tipoEntrega === 'venta_local' && o.estadoPago === 'completado');
        const ingresoTotal = ordenes.reduce((acc, o) => acc + (cuentaComoIngreso(o) ? getTotalOrden(o) : 0), 0);
        const ordenesPagadas    = ordenes.filter(o => o.estadoPago === 'completado').length;
        const ordenesPendientes = ordenes.filter(o => o.estadoPago !== 'completado').length;

        const ventasPorMetodo = ordenes.reduce((acc, o) => {
            acc[o.metodoPago] = (acc[o.metodoPago] || 0) + 1;
            return acc;
        }, {});

        const ventasPorEstado = ordenes.reduce((acc, o) => {
            acc[o.estadoOrden] = (acc[o.estadoOrden] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            resumen: {
                totalVentas,
                ingresoTotal: parseFloat(ingresoTotal.toFixed(2)),
                ordenesPagadas,
                ordenesPendientes,
                ventasPorMetodo,
                ventasPorEstado,
            },
            ordenes,
        });
    } catch (error) {
        console.error("Error al generar reporte:", error);
        res.status(500).json({ msg: "Error en el servidor al generar el reporte." });
    }
};

export {
  registrarOrden,
  registrarOrdenTienda,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  procesarPagoOrden,
  reporteVentas,
  solicitarCancelacion,
  aprobarCancelacion,
  rechazarCancelacion
};
