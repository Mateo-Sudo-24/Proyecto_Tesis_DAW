import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useOrderStore from "../stores/useOrderStore"; // Asume que el store está en src/stores

const Carrito = () => {
    // --- ESTADOS LOCALES DEL COMPONENTE ---
    const [carrito, setCarrito] = useState({ items: [] });
    const [loadingCart, setLoadingCart] = useState(true);

    // Estados para el formulario de dirección
    const [direccion, setDireccion] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [provincia, setProvincia] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [pais, setPais] = useState("Ecuador"); // Valor por defecto

    // Estado para el método de pago
    const [metodoPago, setMetodoPago] = useState("Transferencia Bancaria");

    const navigate = useNavigate();

    // --- ESTADO Y ACCIONES DEL STORE DE ÓRDENES (ZUSTAND) ---
    const createOrder = useOrderStore((state) => state.createOrder);
    const isCreatingOrder = useOrderStore((state) => state.loading);

    // --- LÓGICA DEL CARRITO (FETCH DIRECTO) ---

    // Obtener token del localStorage
    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;

    // Obtener el carrito del usuario autenticado
    const fetchCarrito = async () => {
        setLoadingCart(true);
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
            setLoadingCart(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCarrito();
        } else {
            toast.error("Debes iniciar sesión para ver tu carrito.");
            navigate("/login");
        }
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

    // --- MANEJADOR PARA CREAR LA ORDEN USANDO ZUSTAND ---
    const handleCrearOrden = async (e) => {
        e.preventDefault();
        if (!direccion.trim() || !ciudad.trim() || !provincia.trim() || !codigoPostal.trim() || !pais.trim()) {
            toast.error("Debes completar todos los campos de la dirección de envío.");
            return;
        }

        const orderData = {
            direccionEnvio: {
                direccion,
                ciudad,
                provincia,
                codigoPostal,
                pais,
            },
            metodoPago,
        };

        // Llamar a la acción del store. El store maneja la petición, los toasts y la navegación.
        await createOrder(orderData, navigate);
    };

    // Calcular subtotal
    const subtotal = carrito.items.reduce(
        (acc, item) => acc + (item.producto?.precio || 0) * item.cantidad,
        0
    );

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 my-8">
            <h2 className="text-3xl font-bold text-orange-400 mb-6 text-center">Mi Carrito</h2>
            {loadingCart ? (
                <p className="text-center text-gray-400">Cargando carrito...</p>
            ) : carrito.items.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                    <p className="text-xl">Tu carrito está vacío.</p>
                    <div className="mt-6">
                        <Link to="/products" className="bg-orange-400 text-white px-6 py-3 rounded-md font-bold hover:bg-orange-500 transition-colors">
                            Ver productos
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full mb-6 text-left">
                            <thead>
                                <tr className="bg-orange-50 text-orange-500">
                                    <th className="p-3">Producto</th>
                                    <th className="p-3">Precio</th>
                                    <th className="p-3">Cantidad</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.items.map((item) => (
                                    <tr key={item.producto?._id} className="border-b">
                                        <td className="p-3 flex items-center gap-3">
                                            <img src={item.producto?.imagenUrl || "/images/no-image.png"} alt={item.producto?.nombre} className="w-16 h-16 object-cover rounded-md" />
                                            <span className="font-semibold">{item.producto?.nombre}</span>
                                        </td>
                                        <td className="p-3">${item.producto?.precio?.toFixed(2)}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.cantidad}
                                                onChange={e => cambiarCantidad(item.producto?._id, parseInt(e.target.value))}
                                                className="w-20 border rounded-md px-2 py-1 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-3 text-right">${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
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
                    <div className="flex justify-end items-center mb-6">
                        <span className="font-bold text-lg mr-4">Total:</span>
                        <span className="font-bold text-3xl text-orange-400">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                        <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                            onClick={vaciarCarrito}
                        >
                            Vaciar carrito
                        </button>
                        <Link to="/products" className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition-colors">
                            Seguir comprando
                        </Link>
                    </div>

                    {/* --- FORMULARIO DE ENVÍO Y PAGO --- */}
                    <form onSubmit={handleCrearOrden} className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="font-bold text-2xl mb-4 text-orange-500">Finalizar pedido</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-semibold text-gray-700">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                    placeholder="Ej: Calle Principal 123 y Av. Secundaria"
                                    value={direccion}
                                    onChange={e => setDireccion(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Ciudad</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                    placeholder="Ej: Guayaquil"
                                    value={ciudad}
                                    onChange={e => setCiudad(e.target.value)}
                                    required
                                />
                            </div>
                             <div>
                                <label className="block mb-1 font-semibold text-gray-700">Provincia</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                    placeholder="Ej: Guayas"
                                    value={provincia}
                                    onChange={e => setProvincia(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Código Postal</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                    placeholder="Ej: 090101"
                                    value={codigoPostal}
                                    onChange={e => setCodigoPostal(e.target.value)}
                                    required
                                />
                            </div>
                             <div>
                                <label className="block mb-1 font-semibold text-gray-700">País</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none bg-gray-100"
                                    value={pais}
                                    onChange={e => setPais(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block mb-1 font-semibold text-gray-700">Método de pago</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                                value={metodoPago}
                                onChange={e => setMetodoPago(e.target.value)}
                                required
                            >
                                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                <option value="Contra Entrega">Contra Entrega</option>
                                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                <option value="PayPal">PayPal</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Stripe">Stripe</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-orange-500 text-white px-6 py-3 rounded-md font-bold hover:bg-orange-600 transition-colors w-full disabled:bg-orange-300 disabled:cursor-not-allowed"
                            disabled={isCreatingOrder}
                        >
                            {isCreatingOrder ? "Procesando pedido..." : "Crear pedido"}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default Carrito;