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

// --- RUTAS PÚBLICAS ---
router.post('/registro', registro);
router.get('/confirmar/:token', confirmarEmail);
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', crearNuevoPassword);

// --- PERFIL DEL CLIENTE LOGUEADO ---
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, actualizarPerfil);
router.put('/password', verificarTokenJWT, actualizarPassword);

// --- GESTIÓN (SÓLO ADMINS) ---
router.route('/')
    .get(verificarTokenJWT, esAdmin, obtenerClientes)
    .post(verificarTokenJWT, esAdmin, crearClientePorAdmin);

router.route('/:id')
    .get(verificarTokenJWT, esAdmin, obtenerClientePorId)
    .put(verificarTokenJWT, esAdmin, actualizarClientePorAdmin)
    .delete(verificarTokenJWT, esAdmin, eliminarCliente);

export default router;