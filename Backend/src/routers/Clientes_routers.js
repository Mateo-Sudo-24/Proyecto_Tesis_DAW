import { Router } from 'express';
import {
    validateClienteRegistro,
    validateLogin,
    validatePasswordRecovery,
    validatePasswordReset,
    validateProfileUpdate,
    validatePasswordChange,
    validateAdminClienteCreation,
    validateMongoId
} from '../middlewares/validators.js'; // <-- Importar validadores
import { 
    registro, 
    confirmarEmail, 
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword, 
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    crearClientePorAdmin,
    obtenerClientes,
    obtenerClientePorId,
    actualizarClientePorAdmin,
    eliminarCliente
} from '../controllers/Cliente_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS (con validación) ---
router.post('/registro', validateClienteRegistro, registro);
router.get('/confirmar/:token', confirmarEmail);
router.post('/login', validateLogin, login);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPassword);

// --- RUTAS DE PERFIL (con validación) ---
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, validateProfileUpdate, actualizarPerfil);
router.put('/password', verificarTokenJWT, validatePasswordChange, actualizarPassword);

// --- RUTAS DE GESTIÓN (SÓLO ADMINS, con validación) ---
router.get('/', verificarTokenJWT, esAdmin, obtenerClientes);
router.post('/', verificarTokenJWT, esAdmin, validateAdminClienteCreation, crearClientePorAdmin);

router.get('/:id', verificarTokenJWT, esAdmin, validateMongoId, obtenerClientePorId);
router.put('/:id', verificarTokenJWT, esAdmin, validateMongoId, validateProfileUpdate, actualizarClientePorAdmin);
router.delete('/:id', verificarTokenJWT, esAdmin, validateMongoId, eliminarCliente);

export default router;