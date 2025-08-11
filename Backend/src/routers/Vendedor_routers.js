import { Router } from 'express';
import {
    validateLogin,
    validatePasswordRecovery,
    validatePasswordReset,
    validateVendedorInvitation,
    validateAccountSetup,
    validateProfileUpdate,
    validatePasswordChange,
    validateMongoId
} from '../middlewares/validators.js'; // <-- Importar validadores
import { 
    login,
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword,
    configurarCuentaYPassword,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    crearVendedor,
    obtenerVendedores,
    obtenerVendedorPorId,
    actualizarVendedor,
    eliminarVendedor
} from '../controllers/Vendedor_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS (con validación) ---
router.post('/login', validateLogin, login);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPassword);
router.post('/setup-account/:token', validateAccountSetup, configurarCuentaYPassword);

// --- RUTAS DE PERFIL (con validación) ---
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, validateProfileUpdate, actualizarPerfil);
router.put('/perfil/password', verificarTokenJWT, validatePasswordChange, actualizarPassword);

// --- RUTAS DE GESTIÓN (SÓLO ADMINS, con validación) ---
router.get('/', verificarTokenJWT, esAdmin, obtenerVendedores);
router.post('/', verificarTokenJWT, esAdmin, validateVendedorInvitation, crearVendedor);

router.get('/:id', verificarTokenJWT, esAdmin, validateMongoId, obtenerVendedorPorId);
router.put('/:id', verificarTokenJWT, esAdmin, validateMongoId, validateProfileUpdate, actualizarVendedor);
router.delete('/:id', verificarTokenJWT, esAdmin, validateMongoId, eliminarVendedor);

export default router;