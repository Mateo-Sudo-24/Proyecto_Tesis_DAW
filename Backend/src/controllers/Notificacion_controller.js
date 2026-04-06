import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';

// n8n llama aquí cuando detecta stock crítico
// Endpoint público pero protegido por API key
export const recibirNotificacion = async (req, res) => {
  const { productos, mensaje, tipo, adminId } = req.body;
  
  // Validar API key de n8n
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.N8N_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'No autorizado - API key inválida' });
  }
  
  // Validar que adminId sea proporcionado
  if (!adminId) {
    return res.status(400).json({ error: 'adminId es requerido' });
  }
  
  // Validar que el administrador existe
  const admin = await Administrador.findById(adminId);
  if (!admin) {
    return res.status(404).json({ error: 'Administrador no encontrado' });
  }
  
  try {
    const notif = await Notificacion.create({ 
      administrador: adminId,
      productos, 
      mensaje, 
      tipo: tipo || 'stock_critico',
      leida: false 
    });
    res.status(201).json({ ok: true, notif });
  } catch (error) {
    console.error('Error al recibir notificación de n8n:', error);
    res.status(500).json({ error: 'Error al procesar notificación' });
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