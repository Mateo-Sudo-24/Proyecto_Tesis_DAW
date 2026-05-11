import { Router } from 'express';
import { validateLogin, validatePasswordRecovery } from '../middlewares/validators.js';
import { loginUnificado, recuperarPasswordUnificado } from '../controllers/Auth_controller.js';

const router = Router();

// ✅ RUTA UNIFICADA DE LOGIN - Identifica automáticamente el tipo de usuario
router.post('/login', validateLogin, loginUnificado);

// ✅ RUTA UNIFICADA DE RECUPERACIÓN - Busca el email en todos los modelos
router.post('/recuperar-password', validatePasswordRecovery, recuperarPasswordUnificado);

export default router;
