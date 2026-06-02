import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ModalPago from "./ModalPago.jsx";
import ModalOrdenPago from "./ModalOrdenPago.jsx";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import { calcularDesglose } from "./ordenLocal.js";
import storeProfile from "../../context/storeProfile";
import { toast } from "react-toastify";

const ENVIO_BASE = 2.5;

const getUnidadItem = (item) => {
    const unidadProducto = item?.producto?.unidadVenta;
    if (unidadProducto === 'rollo') return 'rollo';
    if (unidadProducto === 'metro') return 'metro';
    return item?.unidadSeleccionada || 'metro';
};

const getPrecioUnidad = (item) => {
    const unidad = getUnidadItem(item);
    const producto = item?.producto || {};
    if (unidad === 'rollo') return Number(producto.precioPorRollo ?? producto.precio ?? 0) || 0;
    return Number(producto.precioPorMetro ?? producto.precio ?? 0) || 0;
};

const getMetrosDisponibles = (producto = {}) => Number(producto.metrosDisponibles ?? producto.stock ?? 0) || 0;
const getRollosDisponibles = (producto = {}) => Math.floor(getMetrosDisponibles(producto) / (producto.metrosPorRollo || 100));

const cartStyles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Contenedor principal Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-wrapper {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem 1rem;
        font-family: 'Inter', system-ui, sans-serif;
    }
    .cart-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin-bottom: 1.75rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .cart-title-icon {
        width: 36px;
        height: 36px;
        background: var(--orange-light);
        border-radius: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
    }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Spinner Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-spinner-wrap {
        display: flex;
        justify-content: center;
        padding: 5rem 0;
    }
    .cart-spinner {
        width: 44px;
        height: 44px;
        border: 4px solid #e5e7eb;
        border-top-color: var(--orange-main);
        border-radius: 50%;
        animation: cart-spin 0.7s linear infinite;
    }
    @keyframes cart-spin { to { transform: rotate(360deg); } }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Estado vacÃƒÂ­o Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-empty {
        text-align: center;
        padding: 5rem 2rem;
        background: #fff;
        border-radius: 1.25rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .cart-empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .cart-empty h3 { font-size: 1.2rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; }
    .cart-empty p { font-size: 0.875rem; color: #9ca3af; margin-bottom: 1.75rem; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Grid Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    @media (min-width: 1024px) {
        .cart-grid { grid-template-columns: 1fr 340px; }
    }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Card base Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-card {
        background: #fff;
        border-radius: 1.25rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        overflow: hidden;
    }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Tabla Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-table-wrap { overflow-x: auto; }
    .cart-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }
    .cart-table thead tr {
        background: #111827;
    }
    .cart-table thead th {
        padding: 0.85rem 1rem;
        color: #d1d5db;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .cart-table thead th:first-child { text-align: left; border-radius: 0; }
    .cart-table thead th:last-child { border-radius: 0; }
    .cart-table tbody tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.15s;
    }
    .cart-table tbody tr:hover { background: #fafaf9; }
    .cart-table tbody tr:last-child { border-bottom: none; }
    .cart-table td { padding: 0.875rem 1rem; vertical-align: middle; }
    .cart-product-cell { display: flex; align-items: center; gap: 0.875rem; }
    .cart-product-img {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 0.75rem;
        flex-shrink: 0;
        border: 1px solid #e5e7eb;
    }
    .cart-product-name { font-weight: 700; color: #1f2937; font-size: 0.875rem; }
    .cart-price { color: #6b7280; font-weight: 600; text-align: center; }
    .cart-qty-input {
        width: 68px;
        border: 1.5px solid #d1d5db;
        border-radius: 0.625rem;
        padding: 0.35rem 0.5rem;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #111827;
        transition: border-color 0.15s, box-shadow 0.15s;
        outline: none;
    }
    .cart-qty-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.15);
    }
    .cart-subtotal { text-align: right; font-weight: 700; color: #111827; }
    .cart-delete-btn {
        background: #fef2f2;
        color: #ef4444;
        border: none;
        border-radius: 0.5rem;
        padding: 0.4rem 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        white-space: nowrap;
    }
    .cart-delete-btn:hover { background: #fee2e2; color: #dc2626; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Footer tabla Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.875rem 1rem;
        border-top: 1px solid #f3f4f6;
        background: #fafaf9;
    }
    .cart-clear-btn {
        font-size: 0.82rem;
        font-weight: 700;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.15s;
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    .cart-clear-btn:hover { color: #ef4444; }
    .cart-continue-link {
        font-size: 0.82rem;
        font-weight: 700;
        color: #6b7280;
        text-decoration: none;
        transition: color 0.15s;
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    .cart-continue-link:hover { color: var(--orange-main); }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Panel lateral Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-sidebar { display: flex; flex-direction: column; gap: 1rem; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Resumen Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-summary { padding: 1.25rem 1.5rem; }
    .cart-summary h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .cart-summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    .cart-summary-free { color: #16a34a; font-weight: 700; }
    .cart-summary-divider { border: none; border-top: 1px solid #f3f4f6; margin: 0.875rem 0; }
    .cart-summary-total {
        display: flex;
        justify-content: space-between;
        font-size: 1.1rem;
        font-weight: 900;
        color: #111827;
    }
    .cart-summary-total-amount { color: var(--orange-main); }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Selector tipo entrega Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-delivery-section { padding: 1.25rem 1.5rem; }
    .cart-delivery-section h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .cart-delivery-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.625rem;
        margin-bottom: 0;
    }
    .cart-delivery-opt {
        border: 2px solid #e5e7eb;
        border-radius: 0.875rem;
        padding: 0.875rem 1rem;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        text-align: center;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
    }
    .cart-delivery-opt:hover { border-color: #e8760a; box-shadow: 0 0 0 3px rgba(232,118,10,0.1); }
    .cart-delivery-opt.selected {
        border-color: #e8760a;
        background: #fde8ce;
        box-shadow: 0 0 0 3px rgba(232,118,10,0.18);
    }
    .cart-delivery-opt-icon { font-size: 1.5rem; }
    .cart-delivery-opt-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #374151;
        line-height: 1.3;
    }
    .cart-delivery-opt.selected .cart-delivery-opt-label { color: #c4620a; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ DirecciÃƒÂ³n domicilio Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-addr-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px dashed #d1d5db;
        border-radius: 0.875rem;
        background: #fafafa;
        color: #374151;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: border-color 0.15s, background 0.15s;
    }
    .cart-addr-btn:hover { border-color: #e8760a; background: #fde8ce; color: #c4620a; }
    .cart-addr-selected {
        background: #f0fdf4;
        border: 1.5px solid #86efac;
        border-radius: 0.75rem;
        padding: 0.65rem 1rem;
        font-size: 0.82rem;
        color: #166534;
        font-weight: 600;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.875rem;
    }
    .cart-addr-change {
        margin-left: auto;
        font-size: 0.75rem;
        font-weight: 700;
        color: #e8760a;
        background: none;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        text-decoration: underline;
    }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Formulario envÃƒÂ­o Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-form { padding: 1.25rem 1.5rem; }
    .cart-form h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .cart-form-group { margin-bottom: 0.875rem; }
    .cart-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; margin-bottom: 0.875rem; }
    .cart-label {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.35rem;
    }
    .cart-input, .cart-select {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.6rem 0.875rem;
        font-size: 0.875rem;
        color: #111827;
        background: #fff;
        transition: border-color 0.15s, box-shadow 0.15s;
        outline: none;
        box-sizing: border-box;
    }
    .cart-input:focus, .cart-select:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.15);
    }
    .cart-input::placeholder { color: #d1d5db; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ BotÃƒÂ³n confirmar Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-submit-btn {
        width: 100%;
        padding: 0.9rem 1.5rem;
        background: linear-gradient(135deg, #e8760a 0%, #c4620a 100%);
        color: #fff;
        font-weight: 800;
        font-size: 0.95rem;
        border: none;
        border-radius: 0.875rem;
        cursor: pointer;
        margin-top: 1.25rem;
        box-shadow: 0 4px 14px rgba(232,118,10,0.35);
        transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        letter-spacing: 0.01em;
    }
    .cart-submit-btn:hover:not(:disabled) {
        filter: brightness(1.07);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(232,118,10,0.4);
    }
    .cart-submit-btn:active:not(:disabled) { transform: scale(0.97); }
    .cart-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Link vaciar/tienda (empty state) Ã¢â€â‚¬Ã¢â€â‚¬ */
    .cart-shop-link {
        display: inline-block;
        background: #111827;
        color: #f9fafb;
        padding: 0.75rem 2rem;
        border-radius: 0.875rem;
        font-weight: 700;
        font-size: 0.9rem;
        text-decoration: none;
        transition: background 0.15s, transform 0.15s;
    }
    .cart-shop-link:hover { background: var(--orange-dark); transform: translateY(-1px); }
`;

const Carrito = () => {
    const [carrito, setCarrito] = useState(null);
    const [confirmVaciar, setConfirmVaciar] = useState(false);
    const [vendedorAsignado, setVendedorAsignado] = useState(null);
    const { user } = storeProfile();

    // Rol del usuario
    const getRol = () => { try { return JSON.parse(localStorage.getItem('auth-token'))?.state?.rol ?? null; } catch { return null; } };
    const isVendedor = getRol() === 'vendedor';
    const tiendaLink = isVendedor ? "/dashboard/tienda" : "/dashboard/productos";

    // Tipo de entrega
    const [tipoEntrega, setTipoEntrega] = useState(''); // 'domicilio' | 'retiro' | 'establecimiento' | 'venta_local'

    // Modal orden de pago
    const [showModalOP, setShowModalOP] = useState(false);

    const [isLoadingCart, setIsLoadingCart] = useState(false);
    const [showModalPago, setShowModalPago] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState(null);
    const [pedidoExitoso, setPedidoExitoso] = useState(null); // { orden, facturacion }
    const [cantidadDrafts, setCantidadDrafts] = useState({});
    const { fetchDataBackend } = useFetch();

    const getNombreVendedor = (vendedor) => {
        if (!vendedor) return "Asignacion automatica";
        return `${vendedor.nombrePropietario || vendedor.nombre || ""} ${vendedor.apellido || ""}`.trim() || "Asignacion automatica";
    };

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

    useEffect(() => {
        const cargarVendedorAsignado = async () => {
            if (isVendedor && user?._id) {
                setVendedorAsignado({
                    id: user._id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    nombrePropietario: user.nombrePropietario,
                });
                return;
            }

            const vendedores = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/vendedores/publicos`);
            if (Array.isArray(vendedores) && vendedores.length > 0) {
                const currentIndex = Number(localStorage.getItem('intex-vendedor-rotacion') || 0);
                const vendedor = vendedores[currentIndex % vendedores.length];
                localStorage.setItem('intex-vendedor-rotacion', String((currentIndex + 1) % vendedores.length));
                setVendedorAsignado(vendedor);
            }
        };

        cargarVendedorAsignado();
    }, [isVendedor, user?._id]);

    // Cambiar cantidad o unidad
    const cambiarCantidad = async (productoId, cantidad, unidadSeleccionada) => {
        const cant = Number(cantidad);
        if (!Number.isFinite(cant) || cant <= 0) return null;
        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/carrito/items`,
            { productoId, cantidad: cant, unidadSeleccionada },
            "POST"
        );
        if (response) {
            setCarrito(response);
            setCantidadDrafts(prev => {
                const next = { ...prev };
                delete next[productoId];
                return next;
            });
        }
        return response;
    };

    const getCantidadDraft = (item) => {
        const productoId = item.producto?._id;
        if (!productoId) return String(item.cantidad ?? '');
        return cantidadDrafts[productoId] ?? String(item.cantidad ?? '');
    };

    const setCantidadDraft = (productoId, value) => {
        setCantidadDrafts(prev => ({ ...prev, [productoId]: value }));
    };

    const confirmarCantidad = async (item, unidad) => {
        const productoId = item.producto?._id;
        if (!productoId) return;

        const raw = cantidadDrafts[productoId] ?? String(item.cantidad ?? '');
        const text = String(raw).trim();
        if (text === '') {
            setCantidadDrafts(prev => ({ ...prev, [productoId]: String(item.cantidad ?? '') }));
            return;
        }

        const cantidad = Number(text);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            toast.error("Ingresa una cantidad válida.");
            setCantidadDrafts(prev => ({ ...prev, [productoId]: String(item.cantidad ?? '') }));
            return;
        }

        const cantidadFinal = unidad === 'rollo' ? Math.ceil(cantidad) : cantidad;
        setCantidadDrafts(prev => ({ ...prev, [productoId]: String(cantidadFinal) }));
        await cambiarCantidad(productoId, cantidadFinal, unidad);
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
        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/carrito`,
            null,
            "DELETE"
        );
        if (response) setCarrito({ items: [] });
        setConfirmVaciar(false);
    };

    // FunciÃƒÂ³n para cerrar el modal
    const closeModalPago = () => {
        setShowModalPago(false);
        setOrdenCreada(null);
    };

    const subtotalSinDescuento = carrito?.items?.reduce(
        (acc, item) => acc + getPrecioUnidad(item) * item.cantidad,
        0
    ) || 0;
    const desglosePreview = calcularDesglose(carrito?.items || [], '', 0);

    if (pedidoExitoso) {
        return (
            <>
                <style>{cartStyles}</style>
                <style>{`
                    .cart-success-card {
                        max-width: 560px;
                        margin: 3rem auto;
                        background: #fff;
                        border-radius: 1.25rem;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                        padding: 2.5rem 2rem;
                        text-align: center;
                        font-family: inherit;
                    }
                    .cart-success-icon { font-size: 3.5rem; margin-bottom: 0.75rem; }
                    .cart-success-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin-bottom: 0.4rem; }
                    .cart-success-sub { font-size: 0.95rem; color: #6b7280; margin-bottom: 1.75rem; }
                    .cart-success-info { background: #f9fafb; border-radius: 0.875rem; padding: 1rem 1.25rem; margin-bottom: 1.75rem; text-align: left; font-size: 0.875rem; color: #374151; line-height: 1.8; }
                    .cart-success-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
                    .cart-success-link {
                        padding: 0.6rem 1.25rem;
                        background: #f3f4f6;
                        color: #374151;
                        border-radius: 0.6rem;
                        text-decoration: none;
                        font-size: 0.875rem;
                        font-weight: 700;
                        transition: background 0.15s;
                    }
                    .cart-success-link:hover { background: #e5e7eb; }
                `}</style>
                <div className="cart-wrapper">
                    <div className="cart-success-card">
                        <div className="cart-success-icon">✅</div>
                        <div className="cart-success-title">¡Pedido confirmado!</div>
                        <div className="cart-success-sub">
                            Tu orden ha sido creada exitosamente.
                        </div>
                        <div className="cart-success-info">
                            <strong>Método de pago:</strong> {pedidoExitoso.orden.metodoPago}<br />
                            <strong>Entrega:</strong> {pedidoExitoso.orden.tipoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en almacenes'}<br />
                            <strong>Vendedor asignado:</strong> {getNombreVendedor(pedidoExitoso.facturacion.vendedorAsignado)}<br />
                            <strong>A nombre de:</strong> {pedidoExitoso.facturacion.nombre} {pedidoExitoso.facturacion.apellido}<br />
                            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Puedes ver y descargar tu factura en <strong>Mis pedidos</strong>.</span>
                        </div>
                        <div className="cart-success-actions">
                            <Link to="/dashboard/mis-pedidos" className="cart-success-link" style={{ background: '#e8760a', color: '#fff' }}>
                                Ver mis pedidos →
                            </Link>
                            <Link to={tiendaLink} className="cart-success-link">
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{cartStyles}</style>
            <ConfirmDialog
                open={confirmVaciar}
                title="¿Vaciar carrito?"
                message="Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer."
                confirmLabel="Vaciar"
                onConfirm={vaciarCarrito}
                onCancel={() => setConfirmVaciar(false)}
            />
            <div className="cart-wrapper">
                <h2 className="cart-title">
                    <span className="cart-title-icon">🛒</span>
                    Mi Carrito
                </h2>

                {isLoadingCart ? (
                    <div className="cart-spinner-wrap">
                        <div className="cart-spinner" />
                    </div>
                ) : !carrito || carrito.items.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛍️</div>
                        <h3>Tu carrito está vacío</h3>
                        <p>Explora nuestros productos y agrega lo que más te guste</p>
                        <Link to={tiendaLink} className="cart-shop-link">
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Tabla de items Ã¢â€â‚¬Ã¢â€â‚¬ */}
                        <div className="cart-card">
                            <div className="cart-table-wrap">
                                <table className="cart-table">
                                    <thead>
                                        <tr>
                                            <th style={{textAlign:'left'}}>Producto</th>
                                            <th style={{textAlign:'center'}}>Precio</th>
                                            <th style={{textAlign:'center'}}>Unidad</th>
                                            <th style={{textAlign:'center'}}>Cantidad</th>
                                            <th style={{textAlign:'right'}}>Subtotal</th>
                                            <th style={{textAlign:'center'}}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carrito.items.map((item) => {
                                            const unidad = getUnidadItem(item);
                                            const precioUnidad = getPrecioUnidad(item);
                                            const descuento = Number(item.producto?.descuento ?? 0) || 0;
                                            const precioConDescuento = precioUnidad * (1 - descuento / 100);
                                            const permiteAmbos = item.producto?.unidadVenta === 'ambos';
                                            const stepCantidad = unidad === 'rollo' ? 1 : 0.01;
                                            return (
                                            <tr key={item.producto?._id}>
                                                <td>
                                                    <div className="cart-product-cell">
                                                        <img
                                                            src={item.producto?.imagenUrl || "/images/no-image.png"}
                                                            alt={item.producto?.nombre}
                                                            className="cart-product-img"
                                                        />
                                                        <span className="cart-product-name">{item.producto?.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="cart-price">${precioUnidad.toFixed(2)}</td>
                                                <td style={{textAlign:'center'}}>
                                                    {permiteAmbos ? (
                                                        <select
                                                            className="cart-select"
                                                            value={unidad}
                                                            onChange={e => {
                                                                const nextCantidad = e.target.value === 'rollo' ? 1 : 0.5;
                                                                setCantidadDraft(item.producto?._id, String(nextCantidad));
                                                                cambiarCantidad(item.producto?._id, nextCantidad, e.target.value);
                                                            }}
                                                        >
                                                            <option value="metro">Metro</option>
                                                            <option value="rollo">Rollo</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ fontWeight: 700, color: '#4b5563' }}>
                                                            {unidad === 'rollo' ? 'Rollo' : 'Metro'}
                                                        </span>
                                                    )}
                                                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                        {getMetrosDisponibles(item.producto)}m / {getRollosDisponibles(item.producto)} rollos
                                                    </div>
                                                </td>
                                                <td style={{textAlign:'center'}}>
                                                    <input
                                                        type="number"
                                                        min={unidad === 'rollo' ? 1 : 0.01}
                                                        step={stepCantidad}
                                                        value={getCantidadDraft(item)}
                                                        onChange={e => setCantidadDraft(item.producto?._id, e.target.value)}
                                                        onBlur={() => confirmarCantidad(item, unidad)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') e.currentTarget.blur();
                                                        }}
                                                        className="cart-qty-input"
                                                    />
                                                </td>
                                                <td className="cart-subtotal">
                                                    ${(precioConDescuento * item.cantidad).toFixed(2)}
                                                </td>
                                                <td style={{textAlign:'center'}}>
                                                    <button
                                                        className="cart-delete-btn"
                                                        onClick={() => eliminarItem(item.producto?._id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                            <div className="cart-table-footer">
                                <button className="cart-clear-btn" onClick={() => setConfirmVaciar(true)}>
                                    🗑️ Vaciar carrito
                                </button>
                                <Link to={tiendaLink} className="cart-continue-link">
                                    ← Seguir comprando
                                </Link>
                            </div>
                        </div>

                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Panel lateral Ã¢â€â‚¬Ã¢â€â‚¬ */}
                        <div className="cart-sidebar">
                            {/* Resumen */}
                            <div className="cart-card cart-summary">
                                <h3>📋 Resumen del pedido</h3>
                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <span>${subtotalSinDescuento.toFixed(2)}</span>
                                </div>
                                {desglosePreview.descuentoTotal > 0 && (
                                    <div className="cart-summary-row">
                                        <span>Descuentos</span>
                                        <span>-${desglosePreview.descuentoTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="cart-summary-row">
                                    <span>IVA (15%)</span>
                                    <span>${desglosePreview.iva.toFixed(2)}</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Envío</span>
                                    <span>Desde ${ENVIO_BASE.toFixed(2)}</span>
                                </div>
                                <hr className="cart-summary-divider" />
                                <div className="cart-summary-total">
                                    <span>Total sin envío</span>
                                    <span className="cart-summary-total-amount">${desglosePreview.totalFinal.toFixed(2)}</span>
                                </div>
                                <hr className="cart-summary-divider" />
                                <div className="cart-summary-row">
                                    <span>Vendedor asignado</span>
                                    <span style={{ fontWeight: 800, color: '#111827', textAlign: 'right' }}>
                                        {getNombreVendedor(vendedorAsignado)}
                                    </span>
                                </div>
                            </div>

                            {/* Selector de entrega */}
                            <div className="cart-card">
                                <div className="cart-delivery-section">
                                    <h3>🚚 Método de entrega</h3>
                                    <div className="cart-delivery-options">
                                        <div
                                            className={`cart-delivery-opt${tipoEntrega === 'domicilio' ? ' selected' : ''}`}
                                            onClick={() => { setTipoEntrega('domicilio'); setShowModalOP(true); }}
                                        >
                                            <span className="cart-delivery-opt-icon">🛵</span>
                                            <span className="cart-delivery-opt-label">Envío a domicilio</span>
                                        </div>
                                        {!isVendedor && (
                                            <>
                                                <div
                                                    className={`cart-delivery-opt${tipoEntrega === 'retiro' ? ' selected' : ''}`}
                                                    onClick={() => { setTipoEntrega('retiro'); setShowModalOP(true); }}
                                                >
                                                    <span className="cart-delivery-opt-icon">🏪</span>
                                                    <span className="cart-delivery-opt-label">Retiro en almacenes</span>
                                                </div>
                                                <div
                                                    className={`cart-delivery-opt${tipoEntrega === 'establecimiento' ? ' selected' : ''}`}
                                                    onClick={() => { setTipoEntrega('establecimiento'); setShowModalOP(true); }}
                                                >
                                                    <span className="cart-delivery-opt-icon">🏢</span>
                                                    <span className="cart-delivery-opt-label">Entrega en establecimiento</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {isVendedor && (
                                        <p style={{ margin:'0.85rem 0 0', color:'#92400e', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'0.6rem', padding:'0.7rem 0.85rem', fontSize:'0.82rem', fontWeight:700 }}>
                                            Como vendedor, el carrito registra pedidos con envío a domicilio. Para ventas presenciales usa la pantalla Tienda y marca el pedido como pedido en tienda.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModalPago && ordenCreada && (
                <ModalPago orden={ordenCreada} closeModal={closeModalPago} />
            )}

            {showModalOP && (
                <ModalOrdenPago
                    tipoEntrega={tipoEntrega}
                    cartItems={carrito?.items || []}
                    subtotalCart={desglosePreview.subtotal}
                    subtotalSinDescuento={subtotalSinDescuento}
                    descuentoTotal={desglosePreview.descuentoTotal}
                    envioBase={ENVIO_BASE}
                    vendedorAsignado={vendedorAsignado}
                    onClose={() => { setShowModalOP(false); setTipoEntrega(''); }}
                    onOrdenCreada={(orden, fac) => {
                        setShowModalOP(false);
                        setPedidoExitoso({ orden, facturacion: { ...fac, vendedorAsignado } });
                    }}
                    onNeedCardPayment={(orden) => {
                        setShowModalOP(false);
                        setOrdenCreada(orden);
                        setShowModalPago(true);
                    }}
                />
            )}
        </>
    );
};

export default Carrito;
