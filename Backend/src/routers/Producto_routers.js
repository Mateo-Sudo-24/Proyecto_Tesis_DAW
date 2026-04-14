import { Router } from 'express';
import {
  registrarProducto,
  actualizarProducto,
  listarProducto,
  eliminarProducto,
  detalleProducto,
  detalleProductoEditable,
  productosRecientes,
  getStockCritico,
  buscarProductosSimilares
} from '../controllers/Producto_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// =======================================================================
// ==      RUTAS PÚBLICAS (CUALQUIER VISITANTE PUEDE ACCEDER)           ==
// =======================================================================

router.get('/', listarProducto);

router.get('/recientes', productosRecientes);

router.get('/stock-critico', getStockCritico);

router.post('/buscar-similares', buscarProductosSimilares);

// =======================================================================
// ==   RUTAS PRIVADAS (SOLO VENDEDORES O ADMINS PUEDEN ACCEDER)        ==
// =======================================================================

// GET /api/productos/editar/:id -> Obtener un producto para editar (sin restricción de estado)
// DEBE IR ANTES de /:id para que no sea interpretado como /:id
router.get('/editar/:id', verificarTokenJWT, esVendedor, detalleProductoEditable);

// GET /api/productos/:id -> Obtener el detalle de un solo producto por su ID
router.get('/:id', detalleProducto);

// POST /api/productos -> Crear un nuevo producto
router.post('/', verificarTokenJWT, esVendedor, registrarProducto);

// PUT /api/productos/:id -> Actualizar un producto existente
router.put('/:id', verificarTokenJWT, esVendedor, actualizarProducto);

// DELETE /api/productos/:id -> Eliminar un producto
router.delete('/:id', verificarTokenJWT, esVendedor, eliminarProducto);


export default router;