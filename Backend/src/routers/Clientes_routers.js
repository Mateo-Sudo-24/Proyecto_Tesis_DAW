import { Router } from 'express';
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

// =======================================================================
// ==                RUTAS PÚBLICAS (PARA CUALQUIER VISITANTE)          ==
// =======================================================================
router.post('/registro', registro);
router.get('/confirmar/:token', confirmarEmail);
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', crearNuevoPassword);

// =======================================================================
// ==                RUTAS DE PERFIL (PARA EL CLIENTE LOGUEADO)         ==
// =======================================================================
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, actualizarPerfil);
router.put('/password', verificarTokenJWT, actualizarPassword);

// =======================================================================
// ==                RUTAS DE GESTIÓN (SÓLO PARA ADMINS)                ==
// =======================================================================
// GET /api/clientes/ -> Obtener todos los clientes
router.get('/', verificarTokenJWT, esAdmin, obtenerClientes);
// POST /api/clientes/ -> Crear un cliente (por un admin)
router.post('/', verificarTokenJWT, esAdmin, crearClientePorAdmin);

// GET /api/clientes/:id -> Obtener un cliente por su ID
router.get('/:id', verificarTokenJWT, esAdmin, obtenerClientePorId);
// PUT /api/clientes/:id -> Actualizar un cliente por su ID
router.put('/:id', verificarTokenJWT, esAdmin, actualizarClientePorAdmin);
// DELETE /api/clientes/:id -> Eliminar un cliente por su ID
router.delete('/:id', verificarTokenJWT, esAdmin, eliminarCliente);

export default router;