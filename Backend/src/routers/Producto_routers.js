import { Router } from 'express';
import {
  registrarProducto,
  actualizarProducto,
  listarProducto,
  eliminarProducto,
  eliminarImagenProducto,
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

router.get('/categorias', async (req, res) => {
  try {
    const categorias = [
      { _id: '1', nombre: 'Telas Premium' },
      { _id: '2', nombre: 'Telas Básicas' },
      { _id: '3', nombre: 'Accesorios' },
      { _id: '4', nombre: 'Especiales' }
    ];
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener categorías' });
  }
});

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

// DELETE /api/productos/:id/imagen -> Eliminar solo la imagen del producto
router.delete('/:id/imagen', verificarTokenJWT, esVendedor, eliminarImagenProducto);


export default router;
