import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ModalPago from "./ModalPago.jsx";

const cartStyles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── Contenedor principal ── */
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

    /* ── Spinner ── */
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

    /* ── Estado vacío ── */
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

    /* ── Grid ── */
    .cart-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    @media (min-width: 1024px) {
        .cart-grid { grid-template-columns: 1fr 340px; }
    }

    /* ── Card base ── */
    .cart-card {
        background: #fff;
        border-radius: 1.25rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        overflow: hidden;
    }

    /* ── Tabla ── */
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

    /* ── Footer tabla ── */
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

    /* ── Panel lateral ── */
    .cart-sidebar { display: flex; flex-direction: column; gap: 1rem; }

    /* ── Resumen ── */
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

    /* ── Formulario envío ── */
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

    /* ── Botón confirmar ── */
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

    /* ── Link vaciar/tienda (empty state) ── */
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

        if (!response?.orden) {
            setIsCreatingOrder(false);
            return;
        }

        const ordenRecien = response.orden;
        setOrdenCreada(ordenRecien);

        // Si es Stripe, mostrar modal de pago con tarjeta
        if (metodoPago === "Stripe") {
            setIsCreatingOrder(false);
            toast.success("Orden creada. Completa el pago con tarjeta.");
            setShowModalPago(true);
            return;
        }

        // Para métodos no-Stripe: registrar pago directamente en backend
        const pagoRes = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/ordenes/pagar`,
            { ordenId: ordenRecien._id },
            "POST"
        );

        setIsCreatingOrder(false);

        if (pagoRes) {
            toast.success(`✅ ¡Pedido confirmado! Pago registrado correctamente.`);
            setTimeout(() => navigate('/dashboard/mis-pedidos'), 1800);
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
            <style>{cartStyles}</style>
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
                        <Link to="/dashboard/productos" className="cart-shop-link">
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* ── Tabla de items ── */}
                        <div className="cart-card">
                            <div className="cart-table-wrap">
                                <table className="cart-table">
                                    <thead>
                                        <tr>
                                            <th style={{textAlign:'left'}}>Producto</th>
                                            <th style={{textAlign:'center'}}>Precio</th>
                                            <th style={{textAlign:'center'}}>Cantidad</th>
                                            <th style={{textAlign:'right'}}>Subtotal</th>
                                            <th style={{textAlign:'center'}}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carrito.items.map((item) => (
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
                                                <td className="cart-price">${item.producto?.precio?.toFixed(2)}</td>
                                                <td style={{textAlign:'center'}}>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.cantidad}
                                                        onChange={e => cambiarCantidad(item.producto?._id, parseInt(e.target.value))}
                                                        className="cart-qty-input"
                                                    />
                                                </td>
                                                <td className="cart-subtotal">
                                                    ${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="cart-table-footer">
                                <button className="cart-clear-btn" onClick={vaciarCarrito}>
                                    🗑️ Vaciar carrito
                                </button>
                                <Link to="/dashboard/productos" className="cart-continue-link">
                                    ← Seguir comprando
                                </Link>
                            </div>
                        </div>

                        {/* ── Panel lateral ── */}
                        <div className="cart-sidebar">
                            {/* Resumen */}
                            <div className="cart-card cart-summary">
                                <h3>📋 Resumen del pedido</h3>
                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Envío</span>
                                    <span className="cart-summary-free">Gratis</span>
                                </div>
                                <hr className="cart-summary-divider" />
                                <div className="cart-summary-total">
                                    <span>Total</span>
                                    <span className="cart-summary-total-amount">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Formulario envío */}
                            <div className="cart-card">
                                <form onSubmit={handleCrearOrden} className="cart-form">
                                    <h3>📦 Datos de envío</h3>

                                    <div className="cart-form-group">
                                        <label className="cart-label">Dirección</label>
                                        <input
                                            type="text"
                                            className="cart-input"
                                            placeholder="Calle Principal 123"
                                            value={direccion}
                                            onChange={e => setDireccion(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="cart-form-row">
                                        <div>
                                            <label className="cart-label">Ciudad</label>
                                            <input type="text" className="cart-input" placeholder="Guayaquil" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="cart-label">Provincia</label>
                                            <input type="text" className="cart-input" placeholder="Guayas" value={provincia} onChange={e => setProvincia(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="cart-form-row">
                                        <div>
                                            <label className="cart-label">Cód. Postal</label>
                                            <input type="text" className="cart-input" placeholder="090101" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="cart-label">País</label>
                                            <input type="text" className="cart-input" value={pais} onChange={e => setPais(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="cart-form-group">
                                        <label className="cart-label">Método de pago</label>
                                        <select className="cart-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} required>
                                            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                            <option value="Contra Entrega">Contra Entrega</option>
                                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                            <option value="PayPal">PayPal</option>
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Stripe">Stripe</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="cart-submit-btn" disabled={isCreatingOrder}>
                                        {isCreatingOrder ? (
                                            <>
                                                <span style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'cart-spin 0.7s linear infinite'}} />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>✅ Confirmar pedido</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModalPago && ordenCreada && (
                <ModalPago orden={ordenCreada} closeModal={closeModalPago} />
            )}
        </>
    );
};

export default Carrito;
