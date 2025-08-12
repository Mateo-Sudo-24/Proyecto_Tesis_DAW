import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Carrito = () => {
    const [carrito, setCarrito] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [direccionEnvio, setDireccionEnvio] = useState("");
    const [metodoPago, setMetodoPago] = useState("Contra Entrega");
    const navigate = useNavigate();

    // Obtener token del localStorage
    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;

    // Obtener el carrito del usuario autenticado
    const fetchCarrito = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setCarrito(data);
            } else {
                toast.error(data.msg || "No se pudo cargar el carrito.");
            }
        } catch (error) {
            toast.error("Error al cargar el carrito.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarrito();
        // eslint-disable-next-line
    }, []);

    // Eliminar un producto del carrito
    const eliminarItem = async (productoId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items/${productoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setCarrito(data);
                toast.success("Producto eliminado del carrito.");
            } else {
                toast.error(data.msg || "No se pudo eliminar el producto.");
            }
        } catch (error) {
            toast.error("Error al eliminar el producto.");
        }
    };

    // Vaciar el carrito
    const vaciarCarrito = async () => {
        if (!window.confirm("¿Seguro que deseas vaciar el carrito?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setCarrito({ items: [] });
                toast.success("Carrito vaciado.");
            } else {
                toast.error(data.msg || "No se pudo vaciar el carrito.");
            }
        } catch (error) {
            toast.error("Error al vaciar el carrito.");
        }
    };

    // Cambiar cantidad de un producto
    const cambiarCantidad = async (productoId, cantidad) => {
        if (cantidad < 1) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productoId, cantidad }),
            });
            const data = await res.json();
            if (res.ok) {
                setCarrito(data);
            } else {
                toast.error(data.msg || "No se pudo actualizar la cantidad.");
            }
        } catch (error) {
            toast.error("Error al actualizar la cantidad.");
        }
    };

    // Crear orden
    const crearOrden = async (e) => {
        e.preventDefault();
        if (!direccionEnvio.trim()) {
            toast.error("Debes ingresar una dirección de envío.");
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ordenes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    direccionEnvio,
                    metodoPago,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("¡Orden creada exitosamente!");
                setCarrito({ items: [] });
                setDireccionEnvio("");
                setMetodoPago("Contra Entrega");
                navigate("/dashboard"); // O a la página de órdenes si tienes una
            } else {
                toast.error(data.msg || "No se pudo crear la orden.");
            }
        } catch (error) {
            toast.error("Error al crear la orden.");
        }
    };

    // Calcular subtotal
    const subtotal = carrito.items.reduce(
        (acc, item) => acc + (item.producto?.precio || 0) * item.cantidad,
        0
    );

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold text-orange-300 mb-6 text-center">Mi Carrito</h2>
            {loading ? (
                <p className="text-center text-gray-400">Cargando carrito...</p>
            ) : carrito.items.length === 0 ? (
                <div className="text-center text-gray-400">
                    Tu carrito está vacío.
                    <div className="mt-4">
                        <Link to="/products" className="bg-orange-300 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-400 transition">
                            Ver productos
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full mb-6">
                            <thead>
                                <tr className="bg-orange-50 text-orange-300">
                                    <th className="p-2">Producto</th>
                                    <th className="p-2">Precio</th>
                                    <th className="p-2">Cantidad</th>
                                    <th className="p-2">Subtotal</th>
                                    <th className="p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.items.map((item) => (
                                    <tr key={item.producto?._id}>
                                        <td className="p-2 flex items-center gap-2">
                                            <img src={item.producto?.imagenUrl || "/images/no-image.png"} alt={item.producto?.nombre} className="w-12 h-12 object-cover rounded" />
                                            <span>{item.producto?.nombre}</span>
                                        </td>
                                        <td className="p-2">${item.producto?.precio?.toFixed(2)}</td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.cantidad}
                                                onChange={e => cambiarCantidad(item.producto?._id, parseInt(e.target.value))}
                                                className="w-16 border rounded px-2 py-1"
                                            />
                                        </td>
                                        <td className="p-2">${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}</td>
                                        <td className="p-2">
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                                                onClick={() => eliminarItem(item.producto?._id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-orange-300">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-6">
                        <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            onClick={vaciarCarrito}
                        >
                            Vaciar carrito
                        </button>
                        <Link to="/products" className="bg-orange-300 text-white px-4 py-2 rounded hover:bg-orange-400">
                            Seguir comprando
                        </Link>
                    </div>
                    <form onSubmit={crearOrden} className="bg-orange-50 p-4 rounded">
                        <h3 className="font-bold text-lg mb-4 text-orange-300">Finalizar pedido</h3>
                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">Dirección de envío</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300"
                                placeholder="Ingresa tu dirección"
                                value={direccionEnvio}
                                onChange={e => setDireccionEnvio(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-semibold">Método de pago</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-orange-300"
                                value={metodoPago}
                                onChange={e => setMetodoPago(e.target.value)}
                                required
                            >
                                <option value="Contra Entrega">Contra Entrega</option>
                                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                <option value="PayPal">PayPal</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Stripe">Stripe</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-orange-300 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-400 transition w-full"
                        >
                            Crear pedido
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default Carrito;