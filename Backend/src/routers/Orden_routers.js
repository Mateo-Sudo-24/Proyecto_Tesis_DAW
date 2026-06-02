import { Router } from "express";
import {
  registrarOrden,
  registrarOrdenTienda,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  procesarPagoOrden,
  registrarOrdenPagadaTarjeta,
  reporteVentas,
  solicitarCancelacion,
  aprobarCancelacion,
  rechazarCancelacion
} from "../controllers/Orden_controller.js";
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin, esVendedor } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarTokenJWT);

// --- REPORTES (solo admin) ---
// GET /api/ordenes/reporte
router.get('/reporte', esAdmin, reporteVentas);

// --- RUTA DE PAGO ---
// POST /api/ordenes/pagar
router.post('/pagar', procesarPagoOrden);
router.post('/pagar-tarjeta', registrarOrdenPagadaTarjeta);

// --- RUTAS CRUD DE ÓRDENES Y CANCELACIÓN ---
router.post('/tienda', esVendedor, registrarOrdenTienda);
router.post('/', registrarOrden);
router.get('/', listarOrdenes);
router.get('/:id', detalleOrden);
router.patch('/:id', esVendedor, actualizarEstadoOrden);
router.delete('/:id', esAdmin, eliminarOrden);

// --- RUTAS DE CANCELACIÓN DE ÓRDENES ---
// Solicitar cancelación (cliente o vendedor)
router.post('/:id/solicitar-cancelacion', solicitarCancelacion);
// Aprobar cancelación (el otro rol aprueba)
router.post('/:id/aprobar-cancelacion', aprobarCancelacion);
// Rechazar cancelación (el otro rol rechaza)
router.post('/:id/rechazar-cancelacion', rechazarCancelacion);

export default router;
