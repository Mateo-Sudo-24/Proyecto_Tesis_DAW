import { Router } from "express";
import {
  registrarOrden,
  listarOrdenes,
  detalleOrden,
  actualizarEstadoOrden,
  eliminarOrden
} from "../controllers/Orden_controller.js";

const router = Router();

router.post("/orden/registro", registrarOrden);
router.get("/orden/lista", listarOrdenes);
router.get("/orden/:id", detalleOrden);
router.patch("/orden/actualizar/:id", actualizarEstadoOrden);
router.get("/orden/id/:id", buscarOrdenId);
router.get("/orden/nombre", buscarOrdenNombre);
router.delete("/orden/eliminar/:id", eliminarOrden);

export default router;
