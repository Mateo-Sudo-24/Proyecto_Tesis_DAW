import { Router } from "express";
import {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  procesarPagoOrden // <-- ¡LA IMPORTACIÓN ES CORRECTA!
} from "../controllers/Orden_controller.js";
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarTokenJWT);

// --- RUTA DE PAGO ---
// POST /api/ordenes/pagar
router.post('/pagar', procesarPagoOrden); // <-- ¡LA RUTA ESTÁ DEFINIDA!

// --- RUTAS CRUD DE ÓRDENES ---
router.post('/', registrarOrden);
router.get('/', listarOrdenes);
router.get('/:id', detalleOrden);
router.patch('/:id', esVendedor, actualizarEstadoOrden);
router.delete('/:id', esVendedor, eliminarOrden);

export default router;