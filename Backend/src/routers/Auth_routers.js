import { Router } from 'express';
import { validateLogin, validatePasswordRecovery, validatePasswordReset } from '../middlewares/validators.js';
import {
    loginUnificado,
    recuperarPasswordUnificado,
    comprobarTokenPasswordUnificado,
    crearNuevoPasswordUnificado,
    verificarEmail
} from '../controllers/Auth_controller.js';
import { confirmarEmail } from '../controllers/Cliente_controller.js';

const router = Router();

router.post('/login', validateLogin, loginUnificado);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPasswordUnificado);
router.get('/recuperar-password/:token', comprobarTokenPasswordUnificado);
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPasswordUnificado);
router.post('/check-email', verificarEmail);
router.get('/confirm/:token', confirmarEmail);
router.get('/confirmar/:token', confirmarEmail);

export default router;
