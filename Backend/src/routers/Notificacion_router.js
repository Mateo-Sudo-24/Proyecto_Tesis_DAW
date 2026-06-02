import { Router } from 'express';
import { 
  recibirNotificacion, 
  obtenerNotificaciones, 
  marcarLeida,
  marcarPendiente,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionesNoLeidasWebhook,
  obtenerAprobadasPendientesWebhook,
  eliminarNotificacion,
  marcarLeidaWebhook,
  aprobarPedido,
  rechazarPedido,
  verificarEstadoNotificacionWebhook,
  obtenerNotificacionesVendedor,
  marcarLeidaVendedor,
  obtenerNotificacionesCliente,
  marcarLeidaCliente,
  limpiarNotificacionesChat
} from '../controllers/Notificacion_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin, esVendedor, esCliente } from '../middlewares/AuthMiddleware.js';

const router = Router();

// =======================================================================
// ==            RUTAS WEBHOOK (SIN AUTENTICACIÓN - CONFIABLES)        ==
// =======================================================================

router.post('/webhook', recibirNotificacion);

router.get('/webhook/no-leidas', obtenerNotificacionesNoLeidasWebhook);

// GET /api/notificaciones/webhook/aprobadas -> Polling n8n: notificaciones aprobadas pendientes de email
router.get('/webhook/aprobadas', obtenerAprobadasPendientesWebhook);

// Marcar notificación como leída desde webhook N8N (sin JWT)
router.patch('/webhook/:id/leida', marcarLeidaWebhook);

// GET /api/notificaciones/webhook/:id -> Verificar estado de notificación (n8n verification step)
router.get('/webhook/:id', verificarEstadoNotificacionWebhook);

// =======================================================================
// ==         RUTAS PROTEGIDAS (SOLO ADMINISTRADOR CON JWT)            ==
// =======================================================================

// GET /api/notificaciones -> Obtener todas las notificaciones del admin
router.get('/', verificarTokenJWT, esAdmin, obtenerNotificaciones);

router.patch('/chat/limpiar', verificarTokenJWT, limpiarNotificacionesChat);

// GET /api/notificaciones/no-leidas -> Obtener notificaciones sin leer (optimizado para dashboard)
router.get('/no-leidas', verificarTokenJWT, esAdmin, obtenerNotificacionesNoLeidas);

// PATCH /api/notificaciones/:id/leida -> Marcar notificación como leída (CON JWT)
router.patch('/:id/leida', verificarTokenJWT, esAdmin, marcarLeida);
router.patch('/:id/pendiente', verificarTokenJWT, esAdmin, marcarPendiente);

// PATCH /api/notificaciones/:id/aprobar -> Aprobar pedido de reposición (llama n8n webhook)
router.patch('/:id/aprobar', verificarTokenJWT, esAdmin, aprobarPedido);

// PATCH /api/notificaciones/:id/rechazar -> Rechazar pedido de reposición (llama n8n webhook)
router.patch('/:id/rechazar', verificarTokenJWT, esAdmin, rechazarPedido);

// DELETE /api/notificaciones/:id -> Eliminar notificación
router.delete('/:id', verificarTokenJWT, esAdmin, eliminarNotificacion);

// =======================================================================
// ==         RUTAS PROTEGIDAS PARA VENDEDOR                           ==
// =======================================================================

// GET /api/notificaciones/vendedor -> Obtener notificaciones del vendedor
router.get('/vendedor', verificarTokenJWT, esVendedor, obtenerNotificacionesVendedor);

// PATCH /api/notificaciones/vendedor/:id/leida -> Marcar notificación como leída
router.patch('/vendedor/:id/leida', verificarTokenJWT, esVendedor, marcarLeidaVendedor);

router.get('/cliente', verificarTokenJWT, esCliente, obtenerNotificacionesCliente);
router.patch('/cliente/:id/leida', verificarTokenJWT, esCliente, marcarLeidaCliente);

export default router;
