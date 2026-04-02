import { Router } from 'express';
import { recibirNotificacion, obtenerNotificaciones, marcarLeida } from '../controllers/Notificacion_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// n8n llama a este endpoint (con API key propia, sin autenticación JWT)
router.post('/webhook', recibirNotificacion);

// Rutas protegidas - Solo administrador puede acceder
router.get('/', verificarTokenJWT, esAdmin, obtenerNotificaciones);
router.patch('/:id/leida', verificarTokenJWT, esAdmin, marcarLeida);

export default router;