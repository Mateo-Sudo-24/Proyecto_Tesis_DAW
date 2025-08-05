import { Router } from 'express';
import {
  registrarProducto,
  listarProducto,
  eliminarProducto,
  detalleProducto,
  buscarProducto,
  productosRecientes
} from '../controllers/Producto_controller.js';

const router = Router();

// Crear producto
router.post("/producto/registro", registrarProducto);

//Actualizar producto
router.put("/producto/actualizar/:id", actualizarProducto);

// Listar todos los productos (excepto los inactivos)
router.get("/producto/lista", listarProducto);

// Obtener productos más recientes
router.get("/producto/recientes", productosRecientes);

// Buscar productos por término
router.get("/producto/buscar", buscarProducto); // ej: /producto/buscar?termino=camisa

// Obtener detalle de un producto por ID
router.get("/producto/:id", detalleProducto);

// Eliminar producto por ID
router.delete("/producto/eliminar/:id", eliminarProducto);

export default router;
