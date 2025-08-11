import { Router } from 'express';
import {
    validateLogin,
    validatePasswordRecovery,
    validatePasswordReset,
    validateAdminCreation,
    validateProfileUpdate,
    validatePasswordChange
} from '../middlewares/validators.js'; // <-- Importar validadores
import {
    login,
    crearAdministrador,
    actualizar,
    cambiarPassword,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword
} from '../controllers/Administrador_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';
import { protegerRutaCrearAdmin } from '../middlewares/setupMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS (con validación) ---
router.post('/login', validateLogin, login);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPassword); // No necesita validación de body
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPassword);

// --- RUTA ESPECIAL DE CREACIÓN DE ADMIN (con validación) ---
router.post('/', validateAdminCreation, protegerRutaCrearAdmin, crearAdministrador);

// --- RUTAS PRIVADAS (con validación) ---
router.put('/perfil', verificarTokenJWT, esAdmin, validateProfileUpdate, actualizar);
router.put('/perfil/password', verificarTokenJWT, esAdmin, validatePasswordChange, cambiarPassword);

export default router;