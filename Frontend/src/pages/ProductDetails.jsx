import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaShoppingCart, FaStar } from "react-icons/fa";

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
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-center">
                        <div className="text-5xl mb-4">⏳</div>
                        <p className="text-gray-500 font-semibold">Cargando producto...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Producto no encontrado</h2>
                    <p className="text-gray-500 mb-6">El producto que buscas no existe o fue removido.</p>
                    <Link to="/products" className="bg-gray-700 text-slate-300 font-bold px-6 py-3 rounded-xl hover:bg-gray-900 transition flex items-center gap-2">
                        <FaArrowLeft /> Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    const precioFinal = producto.descuento > 0 
        ? producto.precio * (1 - producto.descuento / 100)
        : producto.precio;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm mb-8 transition">
                    <FaArrowLeft /> Volver al catálogo
                </Link>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative bg-gray-100 h-96 md:h-auto overflow-hidden">
                            <img
                                src={producto.imagenUrl || "/images/no-image.png"}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                            />
                            {producto.descuento > 0 && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-1.5 rounded-xl shadow">
                                    -{producto.descuento}% DESCUENTO
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <span className="text-gray-600 font-bold uppercase text-xs tracking-widest mb-2">Detalle del producto</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{producto.nombre}</h1>

                            {producto.calificacionPromedio > 0 && (
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(producto.calificacionPromedio) ? 'text-yellow-400' : 'text-gray-200'} />
                                    ))}
                                    <span className="text-sm text-gray-500 ml-1">({producto.calificacionPromedio.toFixed(1)})</span>
                                </div>
                            )}

                            <p className="text-gray-600 text-base leading-relaxed mb-6">{producto.descripcion}</p>

                            {/* Price */}
                            <div className="mb-6">
                                {producto.descuento > 0 ? (
                                    <div className="flex items-end gap-3">
                                        <span className="text-gray-400 line-through text-lg">${producto.precio.toLocaleString()}</span>
                                        <span className="text-4xl font-extrabold text-gray-700">${precioFinal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : (
                                    <span className="text-4xl font-extrabold text-gray-700">${producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                )}
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-0.5">Disponibilidad</p>
                                    <p className={`font-bold text-sm ${producto.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {producto.stock > 0 ? `✅ En stock (${producto.stock})` : '❌ Agotado'}
                                    </p>
                                </div>
                                {producto.color && (
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-0.5">Color</p>
                                        <p className="font-bold text-sm text-gray-800">{producto.color}</p>
                                    </div>
                                )}
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                                    <p className="font-bold text-sm text-gray-800 capitalize">{producto.estado}</p>
                                </div>
                            </div>

                            {/* Quantity & Add to Cart */}
                            {producto.stock > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition"
                                            >
                                                -
                                            </button>
                                            <span className="px-5 py-2.5 font-bold text-gray-800 border-x-2 border-gray-200">{cantidad}</span>
                                            <button
                                                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                                                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-gray-700 text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-900 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <FaShoppingCart /> Agregar al carrito
                                        </button>
                                    </div>
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
