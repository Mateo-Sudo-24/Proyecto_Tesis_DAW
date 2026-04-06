import { Router } from 'express';
import { 
  recibirNotificacion, 
  obtenerNotificaciones, 
  marcarLeida,
  obtenerNotificacionesNoLeidas,
  eliminarNotificacion 
} from '../controllers/Notificacion_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// =======================================================================
// ==            RUTAS PÚBLICAS (PROTEGIDAS POR API KEY)               ==
// =======================================================================

// POST /api/notificaciones/webhook -> n8n envía alertas de stock crítico
router.post('/webhook', recibirNotificacion);

// =======================================================================
// ==         RUTAS PROTEGIDAS (SOLO ADMINISTRADOR CON JWT)            ==
// =======================================================================

// GET /api/notificaciones -> Obtener todas las notificaciones del admin
router.get('/', verificarTokenJWT, esAdmin, obtenerNotificaciones);

// GET /api/notificaciones/no-leidas -> Obtener notificaciones sin leer (optimizado para dashboard)
router.get('/no-leidas', verificarTokenJWT, esAdmin, obtenerNotificacionesNoLeidas);

// PATCH /api/notificaciones/:id/leida -> Marcar notificación como leída
router.patch('/:id/leida', verificarTokenJWT, esAdmin, marcarLeida);

// DELETE /api/notificaciones/:id -> Eliminar notificación
router.delete('/:id', verificarTokenJWT, esAdmin, eliminarNotificacion);

export default router;