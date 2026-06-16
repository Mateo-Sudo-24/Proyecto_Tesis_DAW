import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';
import Vendedor from '../models/Vendedor.js';
import Cliente from '../models/Cliente.js';
import axios from 'axios';

// ✅ WEBHOOK SIN AUTENTICACIÓN - N8N puede enviar directamente
export const recibirNotificacion = async (req, res) => {
  const { productos, mensaje, tipo, adminId } = req.body;
  
  // Validación básica
  if (!mensaje) {
    return res.status(400).json({ error: 'El campo "mensaje" es requerido', ok: false });
  }

  try {
    // Normalizar productos para asegurar estructura correcta
    let productosNormalizados = [];
    if (Array.isArray(productos) && productos.length > 0) {
      productosNormalizados = productos.map(p => ({
        nombre: p.nombre || 'Producto sin nombre',
        descripcion: p.descripcion || '',
        stock: p.stock || 0,
        umbral: p.umbral || p.umbralCritico || 5,
        productId: p._id || p.productId,
        categoria: p.categoria,
        precioPorMetro: p.precioPorMetro,
        precioPorRollo: p.precioPorRollo
      }));
    }

    // Si se provee un adminId, se crea la notificación solo para ese admin.
    if (adminId) {
      const admin = await Administrador.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      const notif = await Notificacion.crearConCifrado({ 
        administrador: adminId, 
        productos: productosNormalizados, 
        mensaje, 
        tipo: tipo || 'stock_critico', 
        leida: false,
        estadoGestion: 'pendiente',
        metadatos: {
          ipOrigen: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date()
        }
      });
      console.log(`✅ Notificación creada para admin ${adminId}`);
      return res.status(201).json({ ok: true, notificaciones: [notif], id: notif._id });
    } 
    
    // Si no se provee adminId, se crea la notificación para TODOS los administradores.
    else {
      const admins = await Administrador.find().select('_id');
      if (admins.length === 0) {
        console.warn('⚠️ Advertencia: No hay administradores en la base de datos para recibir notificaciones');
        return res.status(201).json({ ok: true, notificaciones: [], warning: 'Sin administradores registrados' });
      }

      const promesasNotificaciones = admins.map(admin => 
        Notificacion.crearConCifrado({ 
          administrador: admin._id, 
          productos: productosNormalizados,
          mensaje, 
          tipo: tipo || 'stock_critico', 
          leida: false,
          estadoGestion: 'pendiente',
          metadatos: {
            ipOrigen: req.ip,
            userAgent: req.get('user-agent'),
            timestamp: new Date()
          }
        })
      );
      
      const notificacionesCreadas = await Promise.all(promesasNotificaciones);
      console.log(`✅ ${notificacionesCreadas.length} notificaciones creadas para ${admins.length} administrador(es)`);
      return res.status(201).json({ 
        ok: true, 
        notificaciones: notificacionesCreadas,
        totalCreadas: notificacionesCreadas.length,
        ids: notificacionesCreadas.map(n => n._id)
      });
    }

  } catch (error) {
    console.error('❌ Error al recibir notificación de n8n:', error.message);
    res.status(500).json({ error: 'Error interno al procesar la notificación.', details: error.message, ok: false });
  }
};

// Obtener notificaciones (Solo Administrador)
export const obtenerNotificaciones = async (req, res) => {
  const { _id, rol } = req.usuario;
  
  // Validar que sea administrador
  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden ver notificaciones.' });
  }
  
  try {
    const limite = parseInt(req.query.limite) || 0;
    // Admin solo ve sus propias notificaciones
    const notifs = await Notificacion.find({ administrador: _id })
      .sort({ createdAt: -1 })
      .limit(limite || 200);
    
    // Descifrar datos sensibles antes de enviar
    const notifsDescifradas = notifs.map(n => {
      const decrypted = n.descifrarDatos();
      return {
        ...n.toObject(),
        mensaje: decrypted.mensaje,
        productos: decrypted.productos
      };
    });

    res.json({ ok: true, notificaciones: notifsDescifradas });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ msg: 'Error al obtener notificaciones', ok: false });
  }
};

// Marcar notificación como leída (Solo Administrador)
export const marcarLeida = async (req, res) => {
  const { id } = req.params;
  const { _id, rol } = req.usuario;
  
  // Validar que sea administrador
  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden modificar notificaciones.' });
  }
  
  try {
    // Verificar que la notificación pertenece a este admin
    const notif = await Notificacion.findById(id);
    if (!notif) {
      return res.status(404).json({ msg: 'Notificación no encontrada' });
    }
    
    if (notif.administrador.toString() !== _id.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta notificación' });
    }
    
    const notifActualizada = await Notificacion.findByIdAndUpdate(
      id, 
      { leida: true }, 
      { new: true }
    );
    res.json({ ok: true, notif: notifActualizada });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ msg: 'Error al actualizar notificación', ok: false });
  }
};

// Marcar notificacion como pendiente de gestion en BDD (Solo Administrador)
export const marcarPendiente = async (req, res) => {
  const { id } = req.params;
  const { _id, rol } = req.usuario;

  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden modificar notificaciones.' });
  }

  try {
    const notif = await Notificacion.findById(id);
    if (!notif) {
      return res.status(404).json({ msg: 'Notificacion no encontrada' });
    }

    if (!notif.administrador || notif.administrador.toString() !== _id.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta notificacion' });
    }

    const notifActualizada = await Notificacion.findByIdAndUpdate(
      id,
      { estadoGestion: 'pendiente', leida: true },
      { new: true }
    );

    const decrypted = notifActualizada.descifrarDatos();
    res.json({
      ok: true,
      notif: {
        ...notifActualizada.toObject(),
        mensaje: decrypted.mensaje,
        productos: decrypted.productos
      }
    });
  } catch (error) {
    console.error('Error al marcar notificacion como pendiente:', error);
    res.status(500).json({ msg: 'Error al actualizar notificacion', ok: false });
  }
};

// ✅ Marcar notificación como leída desde webhook N8N (SIN JWT)
export const marcarLeidaWebhook = async (req, res) => {
  const { id } = req.params;
  
  try {
    const notif = await Notificacion.findById(id);
    if (!notif) {
      return res.status(404).json({ ok: false, error: 'Notificación no encontrada' });
    }
    
    const notifActualizada = await Notificacion.findByIdAndUpdate(
      id, 
      { leida: true, bandejaEnviada: true }, 
      { new: true }
    );

    console.log(`✅ Notificación ${id} marcada como leída desde webhook`);
    res.json({ ok: true, notif: notifActualizada });
  } catch (error) {
    console.error('Error al marcar notificación como leída (webhook):', error);
    res.status(500).json({ ok: false, error: 'Error al actualizar notificación' });
  }
};

const descifrarLista = (notifs = []) => notifs.map(n => {
  const decrypted = n.descifrarDatos();
  return { ...n.toObject(), mensaje: decrypted.mensaje, productos: decrypted.productos };
});

export const obtenerNotificacionesCliente = async (req, res) => {
  const { _id, rol } = req.usuario;
  if (rol !== 'cliente') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes.' });
  }
  try {
    const notifs = await Notificacion.find({ cliente: _id })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, notificaciones: descifrarLista(notifs) });
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener notificaciones', ok: false });
  }
};

export const marcarLeidaCliente = async (req, res) => {
  const { id } = req.params;
  const { _id, rol } = req.usuario;
  if (rol !== 'cliente') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo clientes.' });
  }
  try {
    const notif = await Notificacion.findById(id);
    if (!notif) return res.status(404).json({ msg: 'Notificacion no encontrada' });
    if (!notif.cliente || notif.cliente.toString() !== _id.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta notificacion' });
    }
    await Notificacion.findByIdAndUpdate(id, { leida: true });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar notificacion', ok: false });
  }
};

export const limpiarNotificacionesChat = async (req, res) => {
  const { _id, rol } = req.usuario;
  try {
    const filtro = { tipo: 'mensaje_chat', leida: false };
    if (rol === 'administrador') filtro.administrador = _id;
    else if (rol === 'vendedor') filtro.vendedor = _id;
    else if (rol === 'cliente') filtro.cliente = _id;
    else return res.status(403).json({ msg: 'Rol no permitido.' });

    const result = await Notificacion.updateMany(filtro, { $set: { leida: true } });
    res.json({ ok: true, modificadas: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ msg: 'Error al limpiar notificaciones de chat', ok: false });
  }
};

// Obtener notificaciones no leídas del administrador (más optimizado para dashboard)
export const obtenerNotificacionesNoLeidas = async (req, res) => {
  const { _id, rol } = req.usuario;
  
  // Validar que sea administrador
  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden ver notificaciones.' });
  }
  
  try {
    const notifs = await Notificacion.find({ administrador: _id, leida: false })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const contador = await Notificacion.countDocuments({ administrador: _id, leida: false });
    
    // Descifrar datos sensibles
    const notifsDescifradas = notifs.map(n => {
      const decrypted = n.descifrarDatos();
      return {
        ...n.toObject(),
        mensaje: decrypted.mensaje,
        productos: decrypted.productos
      };
    });

    res.json({ 
      ok: true, 
      notificaciones: notifsDescifradas,
      totalNoLeidas: contador
    });
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ msg: 'Error al obtener notificaciones' });
  }
};

// Eliminar notificación
export const eliminarNotificacion = async (req, res) => {
  const { id } = req.params;
  const { _id, rol } = req.usuario;
  
  // Validar que sea administrador
  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado.' });
  }
  
  try {
    const notif = await Notificacion.findById(id);
    if (!notif) {
      return res.status(404).json({ msg: 'Notificación no encontrada' });
    }
    
    if (notif.administrador.toString() !== _id.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar esta notificación' });
    }
    
    await Notificacion.findByIdAndDelete(id);
    console.log(`✅ Notificación ${id} eliminada`);
    res.json({ ok: true, msg: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ msg: 'Error al eliminar notificación' });
  }
};

// ✅ Obtener notificaciones NO leídas desde WEBHOOK N8N (SIN JWT)
export const obtenerNotificacionesNoLeidasWebhook = async (req, res) => {
  // RUTA DE WEBHOOK → SIN VERIFICACIÓN 
  try {
    const notifs = await Notificacion.find({ leida: false })
      .sort({ createdAt: -1 })
      .limit(100);
    
    const totalNoLeidas = await Notificacion.countDocuments({ leida: false });
    
    // Descifrar datos para N8N
    const notifsDescifradas = notifs.map(n => {
      const decrypted = n.descifrarDatos();
      return {
        ...n.toObject(),
        mensaje: decrypted.mensaje,
        productos: decrypted.productos
      };
    });

    console.log(`✅ Webhook: Obtenidas ${totalNoLeidas} notificaciones sin leer`);
    res.json({ 
      ok: true, 
      notificaciones: notifsDescifradas,
      totalNoLeidas: totalNoLeidas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obtener notificaciones sin leer (webhook):', error);
    res.status(500).json({ error: 'Error al obtener notificaciones', ok: false });
  }
};

// ✅ Obtener notificaciones APROBADAS pendientes de procesar (polling n8n - SIN JWT)
export const obtenerAprobadasPendientesWebhook = async (req, res) => {
  try {
    // Soporta tanto 'completado' (nuevo) como 'aprobado' (legacy) para no romper el flujo
    const notifs = await Notificacion.find({
      estadoGestion: { $in: ['completado', 'aprobado'] }
    })
      .sort({ createdAt: -1 })
      .limit(200);

    const notifsDescifradas = notifs.map(n => {
      const decrypted = n.descifrarDatos();
      return {
        _id: n._id,
        mensaje: decrypted.mensaje || '',
        productos: decrypted.productos || [],
        estadoGestion: n.estadoGestion,
        createdAt: n.createdAt
      };
    });

    console.log(`✅ Polling aprobadas: ${notifsDescifradas.length} pendientes`);
    res.json({ ok: true, notificaciones: notifsDescifradas, total: notifsDescifradas.length });
  } catch (error) {
    console.error('Error obtener aprobadas pendientes (webhook):', error);
    res.status(500).json({ ok: false, error: 'Error al obtener notificaciones aprobadas' });
  }
};

// ✅ Verificar estado de notificación desde webhook N8N (SIN JWT) — usado por n8n para confirmar decisión
export const verificarEstadoNotificacionWebhook = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await Notificacion.findById(id).select('estadoGestion leida tipo');
    if (!notif) {
      return res.status(404).json({ ok: false, error: 'Notificación no encontrada' });
    }
    return res.json({ ok: true, estadoGestion: notif.estadoGestion, idNotificacion: id, leida: notif.leida });
  } catch (error) {
    console.error('Error verificar estado notificación webhook:', error);
    return res.status(500).json({ ok: false, error: 'Error interno' });
  }
};

// ✅ Gestionar notificación (Admin con JWT)
export const gestionarNotificacion = async (req, res) => {
  const { id } = req.params;
  const { estadoGestion } = req.body;
  const { _id, rol } = req.usuario;

  if (rol !== 'administrador') {
    return res.status(403).json({ msg: 'Acceso denegado.' });
  }

  const estadosValidos = ['pendiente', 'completado', 'rechazado'];
  if (!estadosValidos.includes(estadoGestion)) {
    return res.status(400).json({ msg: 'Estado de gestión no válido' });
  }

  try {
    const notif = await Notificacion.findById(id);
    if (!notif) return res.status(404).json({ ok: false, msg: 'Notificación no encontrada' });
    if (notif.administrador.toString() !== _id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No tienes permiso para gestionar esta notificación' });
    }

    const notifActualizada = await Notificacion.findByIdAndUpdate(
      id,
      {
        estadoGestion,
        ...(estadoGestion !== 'pendiente' ? { leida: true } : {})
      },
      { new: true }
    );

    const decision = estadoGestion === 'completado' ? 'aprobado' : 'rechazado';

    // Notificar a vendedores si se aprueba
    if (estadoGestion === 'completado') {
      try {
        const vendedores = await Vendedor.find({ status: 'activo' }).select('_id');
        const datosDescifrados = notif.descifrarDatos();
        const msgProductos = (datosDescifrados.productos || []).map(p => p.nombre).join(', ');
        await Promise.all(vendedores.map(v =>
          Notificacion.crearConCifrado({
            vendedor: v._id,
            tipo: 'confirmacion_pedido',
            mensaje: `✅ Reposición de stock aprobada por administración${msgProductos ? `: ${msgProductos}` : ''}. Por favor procede con el pedido al proveedor.`,
            leida: false,
            estadoGestion: 'completado',
            metadatos: { timestamp: new Date() }
          })
        ));
      } catch (vErr) {
        console.warn('⚠️ Error al notificar vendedores sobre aprobación:', vErr.message);
      }
    }

    // Webhook n8n
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        const datosDescifrados = notif.descifrarDatos();
        await axios.post(n8nUrl, {
          decision,
          idNotificacion: id,
          mensaje: datosDescifrados.mensaje || notif.mensaje,
          productos: datosDescifrados.productos || notif.productos || []
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
      } catch (webhookErr) {
        console.warn('⚠️ No se pudo contactar n8n:', webhookErr.message);
      }
    }

    res.json({ ok: true, msg: `Notificación ${decision}`, notif: notifActualizada });
  } catch (error) {
    console.error('Error al gestionar notificación:', error);
    res.status(500).json({ ok: false, msg: 'Error al gestionar notificación' });
  }
};

// ─── Notificaciones para VENDEDOR ────────────────────────────────────────────

// GET /api/notificaciones/vendedor → Todas las notificaciones del vendedor autenticado
export const obtenerNotificacionesVendedor = async (req, res) => {
  const { _id, rol } = req.usuario;
  if (rol !== 'vendedor') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo vendedores.' });
  }
  try {
    const limite = parseInt(req.query.limite) || 0;
    const notifs = await Notificacion.find({ vendedor: _id })
      .sort({ createdAt: -1 })
      .limit(limite || 200);
    const notifsDescifradas = notifs.map(n => {
      const decrypted = n.descifrarDatos();
      return { ...n.toObject(), mensaje: decrypted.mensaje, productos: decrypted.productos };
    });
    res.json({ ok: true, notificaciones: notifsDescifradas });
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener notificaciones', ok: false });
  }
};

// PATCH /api/notificaciones/vendedor/:id/leida → Marcar notificación de vendedor como leída
export const marcarLeidaVendedor = async (req, res) => {
  const { id } = req.params;
  const { _id, rol } = req.usuario;
  if (rol !== 'vendedor') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo vendedores.' });
  }
  try {
    const notif = await Notificacion.findById(id);
    if (!notif) return res.status(404).json({ msg: 'Notificación no encontrada' });
    if (!notif.vendedor || notif.vendedor.toString() !== _id.toString()) {
      return res.status(403).json({ msg: 'No tienes permiso para modificar esta notificación' });
    }
    await Notificacion.findByIdAndUpdate(id, { leida: true });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar notificación', ok: false });
  }
};
