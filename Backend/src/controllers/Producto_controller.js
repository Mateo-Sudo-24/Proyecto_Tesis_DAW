import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js'; // <-- AÑADIR IMPORTACIÓN
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';


const registrarProducto = async (req, res) => {
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })

    try {
        const nuevoProducto = new Producto({ ...req.body })

        // Si viene imagen, subir a Cloudinary
        if (req.files?.imagen) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
                folder: 'Productos'
            })
            nuevoProducto.imagenUrl = secure_url
            nuevoProducto.imagenID = public_id
            await fs.unlink(req.files.imagen.tempFilePath)
        }

        await nuevoProducto.save()
        res.status(200).json({ msg: "Registro exitoso del producto" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error en el servidor" })
    }
}
const actualizarProducto = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID de producto no válido" });
  }

  try {
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    // Actualizar campos permitidos
    const campos = ["nombre", "descripcion", "precio", "stock", "estado", "etiquetas"];
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        producto[campo] = req.body[campo];
      }
    });

    // Si se envió una nueva imagen
    if (req.files?.imagen) {
      // Eliminar la imagen anterior
      if (producto.imagenID) {
        await cloudinary.uploader.destroy(producto.imagenID);
      }

      // Subir nueva imagen
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
        folder: 'Productos'
      });

      producto.imagenUrl = secure_url;
      producto.imagenID = public_id;
      await fs.unlink(req.files.imagen.tempFilePath);
    }

    await producto.save();
    res.status(200).json({ msg: "Producto actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar producto" });
  }
};

const listarProducto = async (req, res) => {
    try {
        const productos = await Producto.find({ estado: { $ne: "inactivo" } }).select("-etiquetas -createdAt -updatedAt -__v")
        res.status(200).json(productos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error al listar productos" })
    }
}

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "El formato del ID del producto no es válido." });
    }

    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({ msg: "Producto no encontrado." });
    }

    if (productoEliminado.imagenID) {
      await cloudinary.uploader.destroy(productoEliminado.imagenID);
    }
    
    // <-- INICIO DE CAMBIOS -->
    // Actualizar todos los carritos que contengan este producto
    await Carrito.updateMany(
      { 'items.producto': id },
      { $pull: { items: { producto: id } } }
    );

    res.status(200).json({ msg: "Producto eliminado exitosamente y carritos actualizados." });
    // <-- FIN DE CAMBIOS -->

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ msg: "Error en el servidor al eliminar el producto." });
  }
};

const detalleProducto = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID no válido" });
  }

  const producto = await Producto.findOne({ _id: id, estado: { $ne: "inactivo" } })
                                 .select("-etiquetas -createdAt -updatedAt -__v");

  if (!producto) {
    return res.status(404).json({ msg: "Producto no encontrado o inactivo" });
  }

  res.status(200).json(producto);
};


const buscarProducto = async (req, res) => {
  try {
    const { termino } = req.query;

    if (!termino || termino.trim() === "") {
      return res.status(400).json({ msg: "Debe ingresar un término de búsqueda" });
    }

    // Búsqueda insensible a mayúsculas en nombre y descripción
    const productos = await Producto.find({
      estado: { $ne: "inactivo" },
      $or: [
        { nombre: { $regex: termino, $options: "i" } },
        { descripcion: { $regex: termino, $options: "i" } }
      ]
    }).select("-etiquetas -createdAt -updatedAt -__v");

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en la búsqueda de productos" });
  }

};

const productosRecientes = async (req, res) => {
  try {
    const productos = await Producto.find({ estado: "activo" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-etiquetas -updatedAt -__v");

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener productos recientes" });
  }
};



export {
    registrarProducto,
    listarProducto,
    actualizarProducto,
    eliminarProducto,
    detalleProducto,
    buscarProducto,
    productosRecientes
}