import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch"; // Asegúrate de que la ruta sea correcta
import ModalPago from "./ModalPago.jsx"; // ajusta la ruta si es diferente

const Carrito = () => {
    const [carrito, setCarrito] = useState(null);
    const [direccion, setDireccion] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [provincia, setProvincia] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [pais, setPais] = useState("Ecuador");
    const [metodoPago, setMetodoPago] = useState("Stripe");

    // Estados locales para manejar carga
    const [isLoadingCart, setIsLoadingCart] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    
    // Estados para el modal de pago
    const [showModalPago, setShowModalPago] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState(null);

    const navigate = useNavigate();
    const { fetchDataBackend } = useFetch();

    // Obtener carrito al montar
    useEffect(() => {
        const fetchCarrito = async () => {
            setIsLoadingCart(true);
            const response = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/carrito`);
            if (response) setCarrito(response);
            setIsLoadingCart(false);
        };
        fetchCarrito();
    }, []);

    // Cambiar cantidad
    const cambiarCantidad = async (productoId, cantidad) => {
        if (cantidad < 1) return;
        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/carrito/items`,
            { productoId, cantidad },
            "POST"
        );
        if (response) setCarrito(response);
    };

    // Eliminar item
    const eliminarItem = async (productoId) => {
        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/carrito/items/${productoId}`,
            null,
            "DELETE"
        );
        if (response) setCarrito(response);
    };

    // Vaciar carrito
    const vaciarCarrito = async () => {
        if (!window.confirm("¿Seguro que deseas vaciar el carrito?")) return;
        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/carrito`,
            null,
            "DELETE"
        );
        if (response) setCarrito({ items: [] });
    };

    // Crear orden - MODIFICADO PARA MANEJAR EL MODAL
    const handleCrearOrden = async (e) => {
        e.preventDefault();
        if (!direccion.trim() || !ciudad.trim() || !provincia.trim() || !codigoPostal.trim() || !pais.trim()) {
            return toast.error("Debes completar todos los campos de la dirección de envío.");
        }

        setIsCreatingOrder(true);
        const orderData = {
            direccionEnvio: { direccion, ciudad, provincia, codigoPostal, pais },
            metodoPago,
        };

        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/ordenes`,
            orderData,
            "POST"
        );

        setIsCreatingOrder(false);

        if (response?.orden) {
            toast.success("Orden creada exitosamente");
            setOrdenCreada(response.orden);
            
            // Si es Stripe, mostrar el modal de pago
            if (metodoPago === "Stripe") {
                setShowModalPago(true);
            } else {
                // Para otros métodos de pago, redirigir directamente
                navigate(`/orden-completa/${response.orden._id}`);
            }
        }
    };

    // Función para cerrar el modal
    const closeModalPago = () => {
        setShowModalPago(false);
        setOrdenCreada(null);
    };

    const subtotal = carrito?.items?.reduce(
        (acc, item) => acc + (item.producto?.precio || 0) * item.cantidad,
        0
    ) || 0;

    return (
        <>
            <div className="max-w-5xl mx-auto py-6">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6">🛒 Mi Carrito</h2>
                
                {isLoadingCart ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : !carrito || carrito.items.length === 0 ? (
                    <div className="text-center text-gray-400 py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-5xl mb-4">🛍️</p>
                        <p className="text-xl font-semibold text-gray-600">Tu carrito está vacío</p>
                        <p className="text-sm text-gray-400 mt-2 mb-6">Explora nuestros productos y agrega lo que más te guste</p>
                        <Link to="/dashboard/productos" className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-sm">
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tabla de items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800 text-gray-100 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Producto</th>
                                                <th className="px-4 py-3 text-center">Precio</th>
                                                <th className="px-4 py-3 text-center">Cantidad</th>
                                                <th className="px-4 py-3 text-right">Subtotal</th>
                                                <th className="px-4 py-3 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {carrito.items.map((item) => (
                                                <tr key={item.producto?._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.producto?.imagenUrl || "/images/no-image.png"} alt={item.producto?.nombre} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                                                            <span className="font-semibold text-gray-700">{item.producto?.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600">${item.producto?.precio?.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.cantidad}
                                                            onChange={e => cambiarCantidad(item.producto?._id, parseInt(e.target.value))}
                                                            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-purple-700 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-700">${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            className="text-red-400 hover:text-red-600 transition font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
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
                                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                                    <button
                                        className="text-sm text-gray-500 hover:text-red-500 transition font-semibold"
                                        onClick={vaciarCarrito}
                                    >
                                        🗑️ Vaciar carrito
                                    </button>
                                    <Link to="/dashboard/productos" className="text-sm text-gray-600 hover:text-gray-900 font-semibold transition">
                                        ← Seguir comprando
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Panel lateral: resumen + formulario */}
                        <div className="space-y-4">
                            {/* Resumen */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-800 mb-3">Resumen del pedido</h3>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>Envío</span><span className="text-green-600 font-semibold">Gratis</span>
                                </div>
                                <hr className="border-gray-100 mb-3" />
                                <div className="flex justify-between font-extrabold text-gray-800 text-lg">
                                    <span>Total</span><span className="text-gray-600">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Formulario de envío */}
                            <form onSubmit={handleCrearOrden} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-800 mb-4">Datos de envío</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1 text-xs font-semibold text-gray-600">Dirección</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition" placeholder="Calle Principal 123" value={direccion} onChange={e => setDireccion(e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold text-gray-600">Ciudad</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition" placeholder="Guayaquil" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold text-gray-600">Provincia</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition" placeholder="Guayas" value={provincia} onChange={e => setProvincia(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold text-gray-600">Cód. Postal</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition" placeholder="090101" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold text-gray-600">País</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition bg-gray-50" value={pais} onChange={e => setPais(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-semibold text-gray-600">Método de pago</label>
                                        <select className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-700 focus:border-purple-700 focus:outline-none transition" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} required>
                                            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                            <option value="Contra Entrega">Contra Entrega</option>
                                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                            <option value="PayPal">PayPal</option>
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Stripe">Stripe</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="mt-5 w-full bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isCreatingOrder}
                                >
                                    {isCreatingOrder ? "Procesando..." : "Confirmar pedido"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {showModalPago && ordenCreada && (
                <ModalPago 
                    orden={ordenCreada} 
                    closeModal={closeModalPago}
                />
            )}
        </>
    );
};

export default Carrito;
