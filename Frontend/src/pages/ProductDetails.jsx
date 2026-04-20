import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";

const ProductDetails = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/${id}`);
                if (!res.ok) throw new Error("Producto no encontrado");
                const data = await res.json();
                setProducto(data);
            } catch (error) {
                toast.error("No se pudo cargar el producto");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProducto();
    }, [id]);

    const handleAddToCart = () => {
        if (cantidad > producto.stock) {
            toast.error("No hay suficiente stock disponible");
            return;
        }
        toast.success(`Se agregaron ${cantidad} unidades al carrito`);
        // Aquí iría la lógica para agregar al carrito
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <p className="text-center text-gray-400">Cargando producto...</p>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="container mx-auto px-4 py-10">
                <p className="text-center text-gray-400">Producto no encontrado</p>
                <div className="text-center mt-4">
                    <Link to="/products" className="text-orange-300 hover:text-orange-400 flex items-center gap-2 justify-center">
                        <FaArrowLeft /> Volver a productos
                    </Link>
                </div>
            </div>
        );
    }

    const precioFinal = producto.descuento > 0 
        ? producto.precio * (1 - producto.descuento / 100)
        : producto.precio;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">
                <Link to="/products" className="text-orange-300 hover:text-orange-400 flex items-center gap-2 mb-8">
                    <FaArrowLeft /> Volver a productos
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Imagen del producto */}
                        <div>
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96">
                                <img
                                    src={producto.imagenUrl || "/images/no-image.png"}
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover"
                                />
                                {producto.descuento > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                                        -{producto.descuento}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{producto.nombre}</h1>
                            
                            <p className="text-gray-600 text-lg mb-6">{producto.descripcion}</p>

                            {/* Precio */}
                            <div className="mb-6">
                                {producto.descuento > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-500 line-through text-xl">${producto.precio.toLocaleString()}</span>
                                        <span className="text-3xl font-bold text-orange-300">${precioFinal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-orange-300">${producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                )}
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-gray-600 text-sm">Disponibilidad</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {producto.stock > 0 ? (
                                            <span className="text-green-600">En Stock ({producto.stock})</span>
                                        ) : (
                                            <span className="text-red-600">Agotado</span>
                                        )}
                                    </p>
                                </div>
                                {producto.color && (
                                    <div>
                                        <p className="text-gray-600 text-sm">Color</p>
                                        <p className="text-lg font-bold text-gray-800">{producto.color}</p>
                                    </div>
                                )}
                            </div>

                            {/* Cantidad y carrito */}
                            {producto.stock > 0 && (
                                <div className="mb-6">
                                    <label className="block text-gray-700 font-bold mb-2">Cantidad</label>
                                    <div className="flex gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 font-bold">{cantidad}</span>
                                            <button
                                                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-orange-300 text-white px-6 py-3 rounded-lg hover:bg-orange-400 transition font-bold flex items-center justify-center gap-2"
                                        >
                                            <FaShoppingCart /> Agregar al Carrito
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Estado */}
                            <div className="mb-4">
                                <p className="text-gray-600 text-sm">Estado</p>
                                <p className="text-lg font-bold text-gray-800 capitalize">{producto.estado}</p>
                            </div>

                            {/* Calificación */}
                            {producto.calificacionPromedio > 0 && (
                                <div>
                                    <p className="text-gray-600 text-sm">Calificación</p>
                                    <p className="text-lg font-bold text-yellow-500">{"⭐".repeat(Math.round(producto.calificacionPromedio))}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
