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

// TODAS las rutas de órdenes requieren que el usuario esté autenticado.
// La diferencia de permisos se maneja en cada ruta.

// =======================================================================
// ==                RUTAS DE ORDEN (NIVEL COLECCIÓN)                   ==
// =======================================================================
// POST /api/ordenes/ -> Un cliente crea una orden para sí mismo
router.post('/', verificarTokenJWT, registrarOrden);
// GET /api/ordenes/ -> Un cliente ve sus órdenes, un vendedor/admin ve todas (con filtros)
router.get('/', verificarTokenJWT, listarOrdenes);

// =======================================================================
// ==                RUTAS DE ORDEN (NIVEL ITEM INDIVIDUAL)             ==
// =======================================================================
// GET /api/ordenes/:id -> Ver el detalle de una orden específica
router.get('/:id', verificarTokenJWT, detalleOrden);

// PATCH /api/ordenes/:id -> Actualizar el estado de una orden (solo Vendedor/Admin)
router.patch('/:id', verificarTokenJWT, esVendedor, actualizarEstadoOrden);

// DELETE /api/ordenes/:id -> Eliminar una orden (solo Vendedor/Admin)
router.delete('/:id', verificarTokenJWT, esVendedor, eliminarOrden);

export default router;