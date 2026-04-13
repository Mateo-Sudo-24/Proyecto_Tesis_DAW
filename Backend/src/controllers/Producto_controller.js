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

// ✅ FUNCIÓN MEJORADA: Crear notificación Y enviar webhook
const crearNotificacionStockCritico = async (producto) => {
    try {
        console.log(`📢 Creando notificación de stock crítico para: ${producto.nombre} (Stock: ${producto.stock})`);
        
        // 1️⃣ GUARDAR EN BD
        const admins = await Administrador.find();
        console.log(`👥 Encontrados ${admins.length} administradores`);
        
        if (admins.length === 0) {
            console.warn('⚠️ No hay administradores registrados');
        }

        for (const admin of admins) {
            const notificacion = await Notificacion.create({
                administrador: admin._id,
                tipo: 'stock_critico',
                mensaje: `El producto "${producto.nombre}" tiene stock crítico (${producto.stock} unidades)`,
                productos: [
                    {
                        nombre: producto.nombre,
                        productId: producto._id,
                        stock: producto.stock,
                        umbral: STOCK_CRITICO
                    }
                ],
                leida: false
            });
            console.log(`✅ Notificación creada en BD para admin: ${admin._id}`);
        }

        // 2️⃣ ENVIAR WEBHOOK A N8N
        const webHookUrl = process.env.N8N_WEBHOOK_URL;
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET || 'unitex_secret_2024';
        
        if (webHookUrl) {
            try {
                const payloadN8N = {
                    tipo: 'stock_critico',
                    timestamp: new Date().toISOString(),
                    producto: {
                        id: producto._id,
                        nombre: producto.nombre,
                        stock: producto.stock,
                        umbralCritico: STOCK_CRITICO,
                        categoria: producto.categoria,
                        precio: producto.precio
                    },
                    accion: 'notificar_administrador'
                };

                console.log(`🔗 Enviando webhook a n8n: ${webHookUrl}`);
                
                const response = await axios.post(webHookUrl, payloadN8N, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': webhookSecret,
                        'Authorization': `Bearer ${webhookSecret}`
                    },
                    timeout: 5000
                });
                
                console.log(`✅ Webhook enviado exitosamente a n8n. Status: ${response.status}`);
            } catch (webhookError) {
                console.error(`❌ Error al enviar webhook a n8n:`, webhookError.message);
                // No lanzar error, continuar aunque falle el webhook
            }
        } else {
            console.warn('⚠️ N8N_WEBHOOK_URL no configurada');
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
        
        console.log(`📦 Actualizando producto: ${producto.nombre}`);
        console.log(`📊 Stock anterior: ${stockAnterior}, Nuevo stock: ${nuevoStock}`);
        
        // Actualizar campos
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
            // Asignar a los campos CORRECTOS
            producto.imagenUrl = resultadoCloudinary.secure_url;
            producto.imagenID = resultadoCloudinary.public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }

        await producto.save();
        
        // ✅ MEJORADO: Crear notificación si stock es crítico Y hubo cambio de stock
        const ahora_es_critico = nuevoStock <= STOCK_CRITICO;
        const antes_era_critico = stockAnterior <= STOCK_CRITICO;
        
        console.log(`🔍 Análisis de stock: Antes crítico=${antes_era_critico}, Ahora crítico=${ahora_es_critico}`);
        
        if (nuevoStock !== stockAnterior && ahora_es_critico) {
            console.log(`⚠️ ¡ALERTA! Stock del producto ${producto.nombre} es crítico (${nuevoStock})`);
            await crearNotificacionStockCritico(producto);
        } else if (nuevoStock === stockAnterior && ahora_es_critico) {
            console.log(`ℹ️ Stock ya estaba crítico, no se envía notificación duplicada`);
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
  const umbral = parseInt(req.query.umbral) || 5;
  const productos = await Producto.find({ stock: { $lte: umbral } });
  res.json(productos);
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