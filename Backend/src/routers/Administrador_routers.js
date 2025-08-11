import { Router } from 'express';
import {
    validateLogin,
    validatePasswordRecovery,
    validatePasswordReset,
    validateAdminCreation,
    validateProfileUpdate,
    validatePasswordChange
} from '../middlewares/validators.js';
import {
    login,
    crearAdministrador,
    perfil, // <-- Importar nueva función
    obtenerAdministradores, // <-- Importar nueva función
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

// --- RUTAS PÚBLICAS ---
router.post('/login', validateLogin, login);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPassword);
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPassword);

// --- RUTAS DE CREACIÓN ---
// POST /api/admin -> Será pública la primera vez, y privada las siguientes.
router.post('/', validateAdminCreation, protegerRutaCrearAdmin, crearAdministrador);


// --- RUTAS PRIVADAS (Requieren ser ADMIN) ---
// Aplicamos los middlewares a todas las rutas de abajo

// GET /api/admin/ -> Obtener lista de todos los administradores
router.get('/', verificarTokenJWT, esAdmin, obtenerAdministradores);

// GET /api/admin/perfil -> Obtener el perfil del admin autenticado
router.get('/perfil', verificarTokenJWT, esAdmin, perfil);

// PUT /api/admin/perfil -> Actualizar el perfil del admin autenticado
router.put('/perfil', verificarTokenJWT, esAdmin, validateProfileUpdate, actualizar);

// PUT /api/admin/perfil/password -> Cambiar la contraseña del admin autenticado
router.put('/perfil/password', verificarTokenJWT, esAdmin, validatePasswordChange, cambiarPassword);


export default router;