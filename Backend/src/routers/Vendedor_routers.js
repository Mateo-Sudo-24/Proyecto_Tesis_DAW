import { Router } from 'express';
import { 
    login,
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword,
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

// --- AUTH ---
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', crearNuevoPassword);

// --- PERFIL DEL VENDEDOR LOGUEADO ---
router.use(verificarTokenJWT); // Middleware para las rutas de abajo
router.get('/perfil', perfil);
router.put('/perfil', actualizarPerfil);
router.put('/perfil/password', actualizarPassword);

// --- GESTIÓN DE VENDEDORES (SÓLO ADMINS) ---
router.route('/')
    .get(esAdmin, obtenerVendedores)
    .post(esAdmin, crearVendedor);

router.route('/:id')
    .get(esAdmin, obtenerVendedorPorId)
    .put(esAdmin, actualizarVendedor)
    .delete(esAdmin, eliminarVendedor);

export default router;