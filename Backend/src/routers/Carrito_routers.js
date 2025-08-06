import { Router } from 'express';
import {
    obtenerMiCarrito,
    agregarItem,
    eliminarItem,
    vaciarCarrito
} from '../controllers/Carrito_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// =======================================================================
// ==      RUTAS DEL CARRITO DE COMPRAS (REQUIEREN AUTENTICACIÓN)       ==
// =======================================================================
// GET /api/carrito/ -> Obtener el carrito completo del usuario autenticado
router.get('/', verificarTokenJWT, obtenerMiCarrito);

// POST /api/carrito/items -> Agregar un item al carrito
router.post('/items', verificarTokenJWT, agregarItem);

// DELETE /api/carrito/items/:productoId -> Eliminar un item específico del carrito
router.delete('/items/:productoId', verificarTokenJWT, eliminarItem);

// DELETE /api/carrito/ -> Vaciar todos los items del carrito del usuario
router.delete('/', verificarTokenJWT, vaciarCarrito);

export default router;