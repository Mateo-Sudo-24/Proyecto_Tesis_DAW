import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js';
import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';
import axios from 'axios';

// Umbral de stock crítico
const STOCK_CRITICO = 5;

// Función interna para centralizar la creación de notificaciones de stock.
const crearNotificacionStockCritico = async (producto) => {
    try {
        const admins = await Administrador.find().select('_id');
        if (admins.length === 0) {
            console.warn('Advertencia: No hay administradores registrados para recibir notificaciones de stock.');
            return;
        }

        for (const admin of admins) {
            await Notificacion.create({
                administrador: admin._id,
                tipo: 'stock_critico',
                mensaje: `El producto "${producto.nombre}" tiene stock crítico (${producto.stock} unidades)`,
                productos: [{ productId: producto._id, nombre: producto.nombre, stock: producto.stock, umbral: STOCK_CRITICO }],
                leida: false
            });
        }

        const webHookUrl = process.env.N8N_WEBHOOK_URL;
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
        
        if (webHookUrl && webhookSecret) {
            try {
                const payloadN8N = {
                    tipo: 'stock_critico',
                    timestamp: new Date().toISOString(),
                    producto: { id: producto._id, nombre: producto.nombre, stock: producto.stock, umbralCritico: STOCK_CRITICO, categoria: producto.categoria, precio: producto.precio },
                    accion: 'notificar_administrador'
                };

                await axios.post(webHookUrl, payloadN8N, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': webhookSecret
                    },
                    timeout: 5000
                });
            } catch (webhookError) {
                console.error(`Error al enviar webhook a n8n: ${webhookError.message}`);
            }
        } else {
            console.warn('Advertencia: N8N_WEBHOOK_URL o N8N_WEBHOOK_SECRET no están configuradas. No se enviará webhook.');
        }

    } catch (error) {
        console.error('❌ Error al crear notificación de stock crítico:', error);
    }
};

// POST /api/productos
// Crear un nuevo producto
const registrarProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, imagenUrl } = req.body;
    if (!nombre || !descripcion || !precio || !stock || !categoria) {
        return res.status(400).json({ msg: "Todos los campos de texto son obligatorios." });
    }

    try {
        const nuevoProducto = new Producto({
            ...req.body,
            creadoPor: req.usuario._id
        });

        if (req.files?.imagen) {
            const resultadoCloudinary = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
                folder: 'Productos'
            });
            nuevoProducto.imagenUrl = resultadoCloudinary.secure_url;
            nuevoProducto.imagenID = resultadoCloudinary.public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        } else if (imagenUrl) {
            nuevoProducto.imagenUrl = imagenUrl;
        }

        await nuevoProducto.save();

        res.status(201).json({ msg: "Producto registrado exitosamente", producto: nuevoProducto });
    } catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({ msg: "Error en el servidor al registrar el producto." });
    }
};

// PUT /api/productos/:id
// Actualizar un producto existente
const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de producto no válido." });
    }

    try {
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado." });
        }

        const stockAnterior = producto.stock;
        const nuevoStock = req.body.stock !== undefined ? parseInt(req.body.stock) : stockAnterior;

        Object.assign(producto, req.body);
        producto.stock = nuevoStock; // Asegurar que sea número
        producto.ultimaModificacionPor = req.usuario._id;

        // Si se envió una nueva imagen
        if (req.files?.imagen) {
            if (producto.imagenID) {
                await cloudinary.uploader.destroy(producto.imagenID);
            }
            const resultadoCloudinary = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
                folder: 'Productos'
            });
            producto.imagenUrl = resultadoCloudinary.secure_url;
            producto.imagenID = resultadoCloudinary.public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        await producto.save();

        // Crear notificación si el stock ha cambiado y ahora es crítico.
        const ahora_es_critico = nuevoStock <= STOCK_CRITICO;
        
        if (nuevoStock !== stockAnterior && ahora_es_critico) {
            await crearNotificacionStockCritico(producto);
        }
        
        res.status(200).json({ 
            msg: "Producto actualizado correctamente", 
            producto,
            stockCritico: ahora_es_critico,
            umbralStockCritico: STOCK_CRITICO
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ msg: "Error en el servidor al actualizar el producto." });
    }
};

// --- EL RESTO DE TUS FUNCIONES SE MANTIENEN IGUAL ---

// GET /api/productos (con la versión de filtros)
const listarProducto = async (req, res) => {
    try {
        const { categoria, precioMin, precioMax, busqueda, enStock, ordenarPor, orden, pagina = 1, limite = 10 } = req.query;
        let filtro = { estado: { $ne: "inactivo" } };
        
        if (busqueda) {
            filtro.$or = [
                { nombre: { $regex: busqueda, $options: "i" } },
                { descripcion: { $regex: busqueda, $options: "i" } }
            ];
        }
        if (categoria) filtro.categoria = categoria;
        if (precioMin || precioMax) {
            filtro.precio = {};
            if (precioMin) filtro.precio.$gte = parseFloat(precioMin);
            if (precioMax) filtro.precio.$lte = parseFloat(precioMax);
        }
        if (enStock === 'true') filtro.stock = { $gt: 0 };
        
        let sort = {};
        if (ordenarPor) {
            sort[ordenarPor] = orden === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const skip = (pagina - 1) * limite;
        const productos = await Producto.find(filtro).sort(sort).skip(skip).limit(limite).select("-etiquetas -__v");
        const totalProductos = await Producto.countDocuments(filtro);

        res.status(200).json({
            totalProductos,
            paginaActual: parseInt(pagina),
            totalPaginas: Math.ceil(totalProductos / limite),
            productos
        });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor al listar productos" });
    }
};

// DELETE /api/productos/:id
const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID de producto no válido." });
  }

  try {
    const productoEliminado = await Producto.findByIdAndDelete(id);
    if (!productoEliminado) {
      return res.status(404).json({ msg: "Producto no encontrado." });
    }

    if (productoEliminado.imagenID) {
      await cloudinary.uploader.destroy(productoEliminado.imagenID);
    }
    
    await Carrito.updateMany(
      { 'items.producto': id },
      { $pull: { items: { producto: id } } }
    );

    res.status(200).json({ msg: "Producto eliminado exitosamente y carritos actualizados." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ msg: "Error en el servidor al eliminar el producto." });
  }
};

// GET /api/productos/:id
const detalleProducto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID no válido" });
  }

  try {
    const producto = await Producto.findById(id).populate('categoria', 'nombre');
    if (!producto || producto.estado === 'inactivo') {
        return res.status(404).json({ msg: "Producto no encontrado o inactivo" });
    }
    res.status(200).json(producto);
  } catch (error) {
      res.status(500).json({ msg: "Error en el servidor al obtener el producto." });
  }
};

// GET /api/productos/:id/editar - Solo para vendedores/admins, permite ver productos en cualquier estado
const detalleProductoEditable = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID no válido" });
  }

  try {
    const producto = await Producto.findById(id).populate('categoria', 'nombre');
    if (!producto) {
        return res.status(404).json({ msg: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
      res.status(500).json({ msg: "Error en el servidor al obtener el producto." });
  }
};

// GET /api/productos/recientes
const productosRecientes = async (req, res) => {
  try {
    const productos = await Producto.find({ estado: "activo" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-etiquetas -updatedAt -__v");
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener productos recientes" });
  }
};

// En Producto_controller.js - agregar este método
export const getStockCritico = async (req, res) => {
  try {
    const umbral = parseInt(req.query.umbral) || 5;
    const productos = await Producto.find({ stock: { $lte: umbral } });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener productos con stock crítico' });
  }
};

export const buscarProductosSimilares = async (req, res) => {
  try {
    const { nombre, color, textura } = req.body;
    
    if (!nombre && !color && !textura) {
      return res.status(400).json({ msg: 'Proporciona al menos nombre, color o textura para buscar.' });
    }

    let filtro = { estado: { $ne: 'inactivo' } };
    
    if (nombre) {
      filtro.$or = [
        { nombre: { $regex: nombre, $options: 'i' } },
        { descripcion: { $regex: nombre, $options: 'i' } }
      ];
    }
    
    if (color) {
      filtro.color = { $regex: color, $options: 'i' };
    }
    
    if (textura) {
      filtro.$or = filtro.$or || [];
      filtro.$or.push(
        { descripcion: { $regex: textura, $options: 'i' } },
        { etiquetas: { $elemMatch: { $regex: textura, $options: 'i' } } }
      );
    }

    const productos = await Producto.find(filtro)
      .select('-etiquetas -__v')
      .limit(10);

    res.json({ 
      ok: true, 
      resultados: productos.length,
      productos 
    });
  } catch (error) {
    console.error('Error en búsqueda de productos similares:', error);
    res.status(500).json({ msg: 'Error al buscar productos similares.' });
  }
};

export {
    registrarProducto,
    actualizarProducto,
    listarProducto,
    eliminarProducto,
    detalleProducto,
    detalleProductoEditable,
    productosRecientes
};