import { Router } from 'express';
import { 
    login,
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword,
    configurarCuentaYPassword, // Asegúrate de tener este controlador
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

// =======================================================================
// ==          RUTAS PÚBLICAS (AUTENTICACIÓN Y CONFIGURACIÓN)           ==
// =======================================================================
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPasword);
router.post('/nuevo-password/:token', crearNuevoPassword);
// Ruta para que el vendedor invitado establezca su contraseña por primera vez
router.post('/setup-account/:token', configurarCuentaYPassword);

// =======================================================================
// ==             RUTAS DE PERFIL (PARA EL VENDEDOR LOGUEADO)           ==
// =======================================================================
router.get('/perfil', verificarTokenJWT, perfil);
router.put('/perfil', verificarTokenJWT, actualizarPerfil);
router.put('/perfil/password', verificarTokenJWT, actualizarPassword);

// =======================================================================
// ==             RUTAS DE GESTIÓN (SÓLO PARA ADMINS)                   ==
// =======================================================================
// GET /api/vendedores/ -> Obtener todos los vendedores
router.get('/', verificarTokenJWT, esAdmin, obtenerVendedores);
// POST /api/vendedores/ -> Crear un vendedor (invitación)
router.post('/', verificarTokenJWT, esAdmin, crearVendedor);

// GET /api/vendedores/:id -> Obtener un vendedor por ID
router.get('/:id', verificarTokenJWT, esAdmin, obtenerVendedorPorId);
// PUT /api/vendedores/:id -> Actualizar un vendedor por ID
router.put('/:id', verificarTokenJWT, esAdmin, actualizarVendedor);
// DELETE /api/vendedores/:id -> Eliminar un vendedor por ID
router.delete('/:id', verificarTokenJWT, esAdmin, eliminarVendedor);

export default router;