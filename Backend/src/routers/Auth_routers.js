import { Router } from 'express';
import { validateLogin } from '../middlewares/validators.js';
import { loginUnificado } from '../controllers/Auth_controller.js';

const router = Router();

// ✅ RUTA UNIFICADA DE LOGIN - Identifica automáticamente el tipo de usuario
router.post('/login', validateLogin, loginUnificado);

export default router;
