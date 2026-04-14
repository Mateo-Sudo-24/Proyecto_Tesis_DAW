import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';

// n8n llama aquí cuando detecta stock crítico
// Endpoint para webhooks (ej. n8n) para crear notificaciones.
// RUTAS DE WEBHOOK → SIN VERIFICACIÓN (confiable desde N8N)
export const recibirNotificacion = async (req, res) => {
  const { productos, mensaje, tipo, adminId } = req.body;
  
  // Validación básica
  if (!mensaje) {
    return res.status(400).json({ error: 'El campo "mensaje" es requerido' });
  }

  try {
    // Normalizar productos para asegurar estructura correcta
    let productosNormalizados = [];
    if (Array.isArray(productos) && productos.length > 0) {
      productosNormalizados = productos.map(p => ({
        nombre: p.nombre || 'Producto sin nombre',
        stock: p.stock || 0,
        umbral: p.umbral || p.umbralCritico || 5
      }));
    }

    // Si se provee un adminId, se crea la notificación solo para ese admin.
    if (adminId) {
      const admin = await Administrador.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      const notif = await Notificacion.create({ 
        administrador: adminId, 
        productos: productosNormalizados, 
        mensaje, 
        tipo: tipo || 'stock_critico', 
        leida: false 
      });
      return res.status(201).json({ ok: true, notificaciones: [notif] });
    } 
    
    // Si no se provee adminId, se crea la notificación para TODOS los administradores.
    else {
      const admins = await Administrador.find().select('_id');
      if (admins.length === 0) {
        console.warn('⚠️ Advertencia: No hay administradores en la base de datos para recibir notificaciones');
        return res.status(201).json({ ok: true, notificaciones: [], warning: 'Sin administradores registrados' });
      }

      const promesasNotificaciones = admins.map(admin => 
        Notificacion.create({ 
          administrador: admin._id, 
          productos: productosNormalizados,
          mensaje, 
          tipo: tipo || 'stock_critico', 
          leida: false 
        })
      );
      
      const notificacionesCreadas = await Promise.all(promesasNotificaciones);
      console.log(`✅ ${notificacionesCreadas.length} notificaciones creadas para ${admins.length} administrador(es)`);
      return res.status(201).json({ ok: true, notificaciones: notificacionesCreadas });
    }

  } catch (error) {
    console.error('❌ Error al recibir notificación de n8n:', error.message);
    res.status(500).json({ error: 'Error interno al procesar la notificación.', details: error.message });
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
    // Admin solo ve sus propias notificaciones
    const notifs = await Notificacion.find({ administrador: _id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifs);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ msg: 'Error al obtener notificaciones' });
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
    res.status(500).json({ msg: 'Error al actualizar notificación' });
  }
};

// Marcar notificación como leída desde webhook N8N (sin verificación JWT)
// RUTA WEBHOOK → SIN AUTENTICACIÓN
export const marcarLeidaWebhook = async (req, res) => {
  const { id } = req.params;
  
  try {
    const notif = await Notificacion.findById(id);
    if (!notif) {
      return res.status(404).json({ ok: false, error: 'Notificación no encontrada' });
    }
    
    const notifActualizada = await Notificacion.findByIdAndUpdate(
      id, 
      { leida: true }, 
      { new: true }
    );
    res.json({ ok: true, notif: notifActualizada });
  } catch (error) {
    console.error('Error al marcar notificación como leída (webhook):', error);
    res.status(500).json({ ok: false, error: 'Error al actualizar notificación' });
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
    
    res.json({ 
      ok: true, 
      notificaciones: notifs,
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
    res.json({ ok: true, msg: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ msg: 'Error al eliminar notificación' });
  }
};

export const obtenerNotificacionesNoLeidasWebhook = async (req, res) => {
  // RUTA DE WEBHOOK → SIN VERIFICACIÓN 
  try {
    const notifs = await Notificacion.find({ leida: false })
      .sort({ createdAt: -1 })
      .limit(100);
    
    const totalNoLeidas = await Notificacion.countDocuments({ leida: false });
    
    res.json({ 
      ok: true, 
      notificaciones: notifs,
      totalNoLeidas: totalNoLeidas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obtener notificaciones sin leer (webhook):', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};