import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agregando, setAgregando] = useState(null);

    // Obtener token si el usuario está autenticado (para agregar al carrito)
    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?limite=12`);
                const data = await res.json();
                setProductos(data.productos || data);
            } catch (error) {
                setProductos([]);
                toast.error("Error al cargar productos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    // Agregar producto al carrito
    const agregarAlCarrito = async (productoId) => {
        if (!token) {
            toast.info("Debes iniciar sesión para agregar productos al carrito.");
            return;
        }
        setAgregando(productoId);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productoId, cantidad: 1 }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.msg || "Producto agregado al carrito.");
            } else {
                toast.error(data.msg || "No se pudo agregar al carrito.");
            }
        } catch (error) {
            toast.error("Error al agregar al carrito.");
        } finally {
            setAgregando(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold text-orange-300 mb-6 text-center">Productos</h2>
            {loading ? (
                <p className="text-center text-gray-400">Cargando productos...</p>
            ) : productos.length === 0 ? (
                <p className="text-center text-gray-400">No hay productos disponibles.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
                    {productos.map(producto => (
                        <div key={producto._id} className="bg-orange-50 rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
                            <img
                                src={producto.imagenUrl || "/images/no-image.png"}
                                alt={producto.nombre}
                                className="w-full h-40 object-cover rounded mb-4"
                            />
                            <h3 className="font-bold text-lg mb-2 text-orange-300">{producto.nombre}</h3>
                            <p className="text-gray-700 mb-2">{producto.descripcion}</p>
                            <span className="font-semibold text-gray-900 mb-2">Precio: ${producto.precio}</span>
                            <span className="text-sm text-gray-500 mb-2">Stock: {producto.stock}</span>
                            <button
                                className="bg-orange-300 text-white px-4 py-2 rounded-md font-bold mt-4 hover:bg-orange-400 transition disabled:opacity-60"
                                onClick={() => agregarAlCarrito(producto._id)}
                                disabled={agregando === producto._id || producto.stock < 1}
                            >
                                {producto.stock < 1 ? "Sin stock" : agregando === producto._id ? "Agregando..." : "Agregar al carrito"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Productos;