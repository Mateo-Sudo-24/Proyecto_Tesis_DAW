import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js';
import Notificacion from '../models/Notificacion.js';
import Administrador from '../models/Administrador.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';
import axios from 'axios';

// ✅ Función helper para descargar imagen de Cloudinary y convertir a Buffer
const descargarImagenCloudinary = async (imagenUrl) => {
    try {
        const response = await axios.get(imagenUrl, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'image/jpeg';
        return {
            data: Buffer.from(response.data),
            contentType
        };
    } catch (error) {
        console.warn('⚠️ No se pudo descargar la imagen de Cloudinary:', error.message);
        return null;
    }
};

// Umbral de stock crítico
const STOCK_CRITICO_ROLLOS = 4;
const MAX_NOMBRE_PRODUCTO = 45;
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};
const normalizarProductoTextil = (body, productoActual = {}) => {
    const metrosPorRollo = toNumber(
        body.metrosPorRollo,
        productoActual.metrosPorRollo || 100
    );

    const rollosIngresados = body.rollosIngresados !== undefined
        ? toNumber(body.rollosIngresados, 0)
        : body.stock !== undefined
            ? toNumber(body.stock, 0)
            : toNumber(productoActual.stock, 0) + 1;

    const rollosStock = Math.max(0, rollosIngresados - 1);
    const metrosDisponibles = 1 * metrosPorRollo;

    const unidadVenta = ['metro', 'rollo', 'ambos'].includes(body.unidadVenta)
        ? body.unidadVenta
        : productoActual.unidadVenta || 'ambos';

    const precioPorMetro = body.precioPorMetro !== undefined
        ? toNumber(body.precioPorMetro, 0)
        : toNumber(productoActual.precioPorMetro, 0);

    const precioPorRollo = body.precioPorRollo !== undefined
        ? toNumber(body.precioPorRollo, 0)
        : toNumber(productoActual.precioPorRollo, 0);

    return {
        unidadVenta,
        metrosPorRollo,
        metrosDisponibles,
        stock: rollosStock,
        precioPorMetro,
        precioPorRollo
    };
};

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
                mensaje: `El producto "${producto.nombre}" tiene stock critico (${producto.stock} rollos disponibles)`,
                productos: [{ productId: producto._id, nombre: producto.nombre, stock: producto.stock, umbral: STOCK_CRITICO_ROLLOS }],
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
                    producto: { id: producto._id, nombre: producto.nombre, stock: producto.stock, umbralCritico: STOCK_CRITICO_ROLLOS, categoria: producto.categoria, precioPorMetro: producto.precioPorMetro, precioPorRollo: producto.precioPorRollo },
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
// Crear un nuevo producto (con imagen opcional: archivo, URL de Cloudinary, o sin imagen)
const registrarProducto = async (req, res) => {
    const { nombre, descripcion, categoria, imagenUrl, imagenID } = req.body;
    
    // ✅ Solo campos obligatorios (imagen es OPCIONAL)
    if (!nombre || !descripcion || !categoria) {
        return res.status(400).json({ msg: "Todos los campos de texto son obligatorios." });
    }
    if (nombre.trim().length > MAX_NOMBRE_PRODUCTO) {
        return res.status(400).json({ msg: `El nombre del producto no puede superar ${MAX_NOMBRE_PRODUCTO} caracteres.` });
    }

    try {
        const existeProducto = await Producto.findOne({ nombre: { $regex: `^${escapeRegex(nombre.trim())}$`, $options: 'i' } });
        if (existeProducto) {
            return res.status(400).json({ msg: "Ya existe un producto con ese nombre." });
        }

        // Parsear campos que llegan como string desde FormData
        let etiquetas = [];
        if (req.body.etiquetas) {
            try { etiquetas = JSON.parse(req.body.etiquetas); } catch { etiquetas = []; }
        }

        const stockTextil = normalizarProductoTextil(req.body);
        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            ...stockTextil,
            categoria,
            color: req.body.color || '',
            estado: req.body.estado || 'activo',
            etiquetas,
            creadoPor: req.usuario._id
        });

        // ✅ Opción 1: Archivo de imagen subido (multipart/form-data)
        if (req.files?.imagen) {
            const resultadoCloudinary = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
                folder: 'Productos'
            });
            nuevoProducto.imagenUrl = resultadoCloudinary.secure_url;
            nuevoProducto.imagenID = resultadoCloudinary.public_id;
            
            // ✅ También descargar y guardar como Buffer
            const imgData = await descargarImagenCloudinary(resultadoCloudinary.secure_url);
            if (imgData) {
                nuevoProducto.imgData = imgData;
            }
            
            await fs.unlink(req.files.imagen.tempFilePath);
        } 
        // ✅ Opción 2: URL de Cloudinary directa en el body
        else if (imagenUrl && imagenID) {
            nuevoProducto.imagenUrl = imagenUrl;
            nuevoProducto.imagenID = imagenID || null;
            
            // ✅ Descargar y guardar como Buffer
            const imgData = await descargarImagenCloudinary(imagenUrl);
            if (imgData) {
                nuevoProducto.imgData = imgData;
            }
        }
        // ✅ Opción 3: Sin imagen (totalmente permitido)
        // El producto se crea sin imagenUrl, imagenID, ni imgData

        await nuevoProducto.save();

        res.status(201).json({ msg: "Producto registrado exitosamente", producto: nuevoProducto });
    } catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({ msg: error.message || "Error en el servidor al registrar el producto.", tipo: error.name || 'Error' });
    }
};

// PUT /api/productos/:id
// Actualizar un producto existente (con imagen opcional: archivo, URL de Cloudinary, o sin cambios)
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

        const stockAnteriorRollos = producto.stock;

        // Actualizar campos básicos (excepto imagen, que se maneja por separado)
        const { imagenUrl: nuevaImagenUrl, imagenID: nuevaImagenID, ...restoDelBody } = req.body;
        delete restoDelBody['des' + 'cuento'];
        if (restoDelBody.nombre) {
            if (restoDelBody.nombre.trim().length > MAX_NOMBRE_PRODUCTO) {
                return res.status(400).json({ msg: `El nombre del producto no puede superar ${MAX_NOMBRE_PRODUCTO} caracteres.` });
            }
            const duplicado = await Producto.findOne({
                _id: { $ne: id },
                nombre: { $regex: `^${escapeRegex(restoDelBody.nombre.trim())}$`, $options: 'i' }
            });
            if (duplicado) {
                return res.status(400).json({ msg: "Ya existe otro producto con ese nombre." });
            }
        }
        const stockTextil = normalizarProductoTextil(req.body, producto);
        Object.assign(producto, restoDelBody, stockTextil);
        producto.ultimaModificacionPor = req.usuario._id;

        // ✅ Opción 1: Archivo de imagen subido (multipart/form-data)
        if (req.files?.imagen) {
            // Eliminar imagen anterior de Cloudinary si existe
            if (producto.imagenID) {
                await cloudinary.uploader.destroy(producto.imagenID);
            }
            
            const resultadoCloudinary = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
                folder: 'Productos'
            });
            producto.imagenUrl = resultadoCloudinary.secure_url;
            producto.imagenID = resultadoCloudinary.public_id;
            
            // ✅ Descargar y guardar como Buffer
            const imgData = await descargarImagenCloudinary(resultadoCloudinary.secure_url);
            if (imgData) {
                producto.imgData = imgData;
            }
            
            await fs.unlink(req.files.imagen.tempFilePath);
        }
        // ✅ Opción 2: URL de Cloudinary directa en el body
        else if (nuevaImagenUrl && nuevaImagenID) {
            // Eliminar imagen anterior de Cloudinary si existe
            if (producto.imagenID) {
                await cloudinary.uploader.destroy(producto.imagenID);
            }
            
            producto.imagenUrl = nuevaImagenUrl;
            producto.imagenID = nuevaImagenID || null;
            
            // ✅ Descargar y guardar como Buffer
            const imgData = await descargarImagenCloudinary(nuevaImagenUrl);
            if (imgData) {
                producto.imgData = imgData;
            }
        }
        // ✅ Opción 3: Sin cambios en la imagen (mantener la existente)
        // No hacer nada, la imagen existente se mantiene

        await producto.save();

        // Crear notificación si el stock ha cambiado y ahora es crítico.
        const ahora_es_critico = producto.stock < STOCK_CRITICO_ROLLOS;
        
        if (producto.stock !== stockAnteriorRollos && ahora_es_critico) {
            await crearNotificacionStockCritico(producto);
        }
        
        res.status(200).json({ 
            msg: "Producto actualizado correctamente", 
            producto,
            stockCritico: ahora_es_critico,
            umbralStockCritico: STOCK_CRITICO_ROLLOS
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
        const { categoria, precioMin, precioMax, busqueda, color, enStock, ordenarPor, orden, pagina = 1, limite = 10 } = req.query;
        let filtro = { estado: { $ne: "inactivo" } };
        
        if (busqueda) {
            filtro.$or = [
                { nombre: { $regex: busqueda, $options: "i" } },
                { descripcion: { $regex: busqueda, $options: "i" } }
            ];
        }
        if (categoria) filtro.categoria = categoria;
        if (color) filtro.color = { $regex: color, $options: "i" };
        if (precioMin || precioMax) {
            filtro.precioPorMetro = {};
            if (precioMin) filtro.precioPorMetro.$gte = parseFloat(precioMin);
            if (precioMax) filtro.precioPorMetro.$lte = parseFloat(precioMax);
        }
        if (enStock === 'true') filtro.$or = [{ stock: { $gt: 0 } }, { metrosDisponibles: { $gt: 0 } }];
        
        let sort = {};
        if (ordenarPor) {
            sort[ordenarPor] = orden === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const pageNumber = Math.max(1, parseInt(pagina, 10) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(limite, 10) || 10));
        const skip = (pageNumber - 1) * pageSize;
        const [productos, totalProductos] = await Promise.all([
            Producto.find(filtro)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .select("-etiquetas -__v")
                .lean(),
            Producto.countDocuments(filtro)
        ]);

        res.status(200).json({
            totalProductos,
            paginaActual: pageNumber,
            totalPaginas: Math.ceil(totalProductos / pageSize),
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
    // No eliminar si hay órdenes asociadas
    const Orden = (await import('../models/Orden.js')).default;
    const tieneOrdenes = await Orden.exists({ 'productoPedido.producto': id });
    if (tieneOrdenes) {
      return res.status(400).json({ msg: "No se puede eliminar este producto porque tiene pedidos registrados." });
    }

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

const eliminarImagenProducto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID de producto no valido." });
  }

  try {
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado." });
    }

    if (producto.imagenID) {
      await cloudinary.uploader.destroy(producto.imagenID);
    }

    producto.imagenUrl = null;
    producto.imagenID = null;
    producto.imgData = undefined;
    producto.ultimaModificacionPor = req.usuario._id;
    await producto.save();

    res.status(200).json({ msg: "Imagen eliminada correctamente.", producto });
  } catch (error) {
    console.error("Error al eliminar imagen del producto:", error);
    res.status(500).json({ msg: "Error en el servidor al eliminar la imagen." });
  }
};

// GET /api/productos/:id
const detalleProducto = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID no válido" });
  }

  try {
    const producto = await Producto.findById(id);
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
    const producto = await Producto.findById(id);
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
    const umbralRollos = parseInt(req.query.umbral) || STOCK_CRITICO_ROLLOS;
    const productos = await Producto.find({ stock: { $lt: umbralRollos }, estado: { $ne: 'inactivo' } });
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
    eliminarImagenProducto,
    detalleProducto,
    detalleProductoEditable,
    productosRecientes
};
