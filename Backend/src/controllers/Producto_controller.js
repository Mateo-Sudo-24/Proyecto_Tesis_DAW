import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';

// POST /api/productos
// Crear un nuevo producto
const registrarProducto = async (req, res) => {
    // Validación explícita de campos
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    if (!nombre || !descripcion || !precio || !stock || !categoria) {
        return res.status(400).json({ msg: "Todos los campos de texto son obligatorios." });
    }
    if (!req.files?.imagen) {
        return res.status(400).json({ msg: "La imagen del producto es obligatoria." });
    }

    try {
        // Crear instancia del producto con datos del body y del token
        const nuevoProducto = new Producto({
            ...req.body,
            creadoPor: req.usuario._id
        });

        // Subir imagen a Cloudinary
        const resultadoCloudinary = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
            folder: 'Productos'
        });
        
        // Asignar datos de la imagen
        nuevoProducto.imagenUrl = resultadoCloudinary.secure_url;
        nuevoProducto.imagenID = resultadoCloudinary.public_id;
        
        await nuevoProducto.save();
        await fs.unlink(req.files.imagen.tempFilePath);

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

        // Actualizar campos
        Object.assign(producto, req.body);
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
        res.status(200).json({ msg: "Producto actualizado correctamente", producto });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ msg: "Error en el servidor al actualizar el producto." });
    }
};

// GET /api/productos
// Listar productos con filtros, paginación y ordenamiento
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
            sort.createdAt = -1; // Ordenar por más nuevos por defecto
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
// Eliminar un producto
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
    
    // Actualizar todos los carritos que contengan este producto
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
// Obtener el detalle de un solo producto
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

// GET /api/productos/recientes
// Obtener los productos más recientes
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

export {
    registrarProducto,
    actualizarProducto,
    listarProducto,
    eliminarProducto,
    detalleProducto,
    productosRecientes
};

