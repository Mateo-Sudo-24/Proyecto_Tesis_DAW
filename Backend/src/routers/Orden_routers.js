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

// TODAS las rutas de órdenes requieren token
router.use(verificarTokenJWT);

// Cliente crea una orden, Vendedores/Admins gestionan
router.route('/')
    .post(registrarOrden)
    .get(listarOrdenes);

// Vendedores/Admins gestionan órdenes específicas
router.route('/:id')
    .get(detalleOrden)
    .patch(esVendedor, actualizarEstadoOrden)
    .delete(esVendedor, eliminarOrden);

export default router;