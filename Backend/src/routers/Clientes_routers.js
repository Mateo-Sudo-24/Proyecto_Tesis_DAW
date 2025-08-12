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
} from '../middlewares/validators.js';
import { 
    registro, 
    confirmarEmail, 
    recuperarPassword, 
    comprobarTokenPassword, 
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
// Se importan ambos middlewares para que estén disponibles
import { esAdmin, esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// =======================================================================
// ==                RUTAS PÚBLICAS (PARA CUALQUIER VISITANTE)          ==
// =======================================================================
router.post('/registro', validateClienteRegistro, registro);
router.get('/confirmar/:token', confirmarEmail);
router.post('/login', validateLogin, login);
router.post('/recuperar-password', validatePasswordRecovery, recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPassword);
router.post('/nuevo-password/:token', validatePasswordReset, crearNuevoPassword);

// =======================================================================
// ==                RUTAS DE PERFIL (PARA EL CLIENTE LOGUEADO)         ==
// =======================================================================
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, validateProfileUpdate, actualizarPerfil);
router.put('/password', verificarTokenJWT, validatePasswordChange, actualizarPassword);


// =======================================================================
// ==         RUTAS DE GESTIÓN (AHORA PARA VENDEDORES Y ADMINS)         ==
// =======================================================================

// GET /api/clientes/ -> Listar todos los clientes
//                       
router.get('/', verificarTokenJWT, esVendedor, obtenerClientes); // <-- ¡CORREGIDO!

// POST /api/clientes/ -> Crear un cliente
//                       
router.post('/', verificarTokenJWT, esVendedor, validateAdminClienteCreation, crearClientePorAdmin); // <-- ¡CORREGIDO!

// GET /api/clientes/:id -> Obtener un cliente por su ID
//                       
router.get('/:id', verificarTokenJWT, esVendedor, validateMongoId, obtenerClientePorId); // <-- ¡CORREGIDO!

// PUT /api/clientes/:id -> Actualizar un cliente por su ID
//                       
router.put('/:id', verificarTokenJWT, esVendedor, validateMongoId, validateProfileUpdate, actualizarClientePorAdmin); // <-- ¡CORREGIDO!

// DELETE /api/clientes/:id -> Eliminar un cliente por su ID
//                       
router.delete('/:id', verificarTokenJWT, esVendedor, validateMongoId, eliminarCliente); // <-- ¡CORREGIDO!


export default router;