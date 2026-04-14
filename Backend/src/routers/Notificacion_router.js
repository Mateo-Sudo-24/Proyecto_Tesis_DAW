import { Router } from 'express';
import { 
  recibirNotificacion, 
  obtenerNotificaciones, 
  marcarLeida,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionesNoLeidasWebhook,
  eliminarNotificacion,
  marcarLeidaWebhook 
} from '../controllers/Notificacion_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// =======================================================================
// ==            RUTAS WEBHOOK (SIN AUTENTICACIÓN - CONFIABLES)        ==
// =======================================================================

router.post('/webhook', recibirNotificacion);

router.get('/webhook/no-leidas', obtenerNotificacionesNoLeidasWebhook);

// Marcar notificación como leída desde webhook N8N (sin JWT)
router.patch('/webhook/:id/leida', marcarLeidaWebhook);

// =======================================================================
// ==         RUTAS PROTEGIDAS (SOLO ADMINISTRADOR CON JWT)            ==
// =======================================================================

// GET /api/notificaciones -> Obtener todas las notificaciones del admin
router.get('/', verificarTokenJWT, esAdmin, obtenerNotificaciones);

// GET /api/notificaciones/no-leidas -> Obtener notificaciones sin leer (optimizado para dashboard)
router.get('/no-leidas', verificarTokenJWT, esAdmin, obtenerNotificacionesNoLeidas);

// PATCH /api/notificaciones/:id/leida -> Marcar notificación como leída (CON JWT)
router.patch('/:id/leida', verificarTokenJWT, esAdmin, marcarLeida);

// DELETE /api/notificaciones/:id -> Eliminar notificación
router.delete('/:id', verificarTokenJWT, esAdmin, eliminarNotificacion);

export default router;