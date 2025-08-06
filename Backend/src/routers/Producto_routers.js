import { Router } from 'express';
import {
  registrarProducto,
  actualizarProducto,
  listarProducto,
  eliminarProducto,
  detalleProducto,
  buscarProducto,
  productosRecientes
} from '../controllers/Producto_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.get('/', listarProducto);
router.get('/recientes', productosRecientes);
router.get('/buscar', buscarProducto);
router.get('/:id', detalleProducto);

// --- RUTAS PRIVADAS (Vendedor o Admin) ---
router.post('/', verificarTokenJWT, esVendedor, registrarProducto);
router.put('/:id', verificarTokenJWT, esVendedor, actualizarProducto);
router.delete('/:id', verificarTokenJWT, esVendedor, eliminarProducto);

export default router;