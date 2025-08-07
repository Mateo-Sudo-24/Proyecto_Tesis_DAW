import { Router } from "express";
import {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden
} from "../controllers/Orden_controller.js";
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Todas las rutas de órdenes requieren que el usuario esté autenticado.
router.use(verificarTokenJWT);

// POST /api/ordenes -> Un cliente (o vendedor) crea una orden
router.post('/', registrarOrden);

// GET /api/ordenes -> Un cliente ve sus órdenes, un vendedor/admin ve todas
router.get('/', listarOrdenes);

// GET /api/ordenes/:id -> Ver el detalle de una orden específica
router.get('/:id', detalleOrden);

// PATCH /api/ordenes/:id -> Actualizar el estado (solo Vendedor/Admin)
router.patch('/:id', esVendedor, actualizarEstadoOrden);

// DELETE /api/ordenes/:id -> Eliminar una orden (solo Vendedor/Admin)
router.delete('/:id', esVendedor, eliminarOrden);

export default router;