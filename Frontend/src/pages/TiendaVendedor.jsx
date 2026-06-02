import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth";
import storeProfile from "../context/storeProfile";
import ModalOrdenPago from "../components/carrito/ModalOrdenPago.jsx";
import { validarCedulaRuc, validarEmailRealista, validarNombreReal, validarTelefono10 } from "../utils/textValidators.js";

const IVA_RATE = 0.15;

const styles = `
    .tv-page { padding: 1.5rem; }
    .tv-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
    .tv-title { font-size:1.5rem; font-weight:900; color:#111827; margin:0 0 0.25rem; }
    .tv-sub { font-size:0.875rem; color:#6b7280; margin:0; }
    .tv-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .tv-link, .tv-primary, .tv-secondary { border:none; border-radius:0.625rem; padding:0.65rem 1rem; font-size:0.85rem; font-weight:800; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:0.35rem; }
    .tv-primary { background:#e8760a; color:#fff; box-shadow:0 3px 10px rgba(232,118,10,0.24); }
    .tv-secondary, .tv-link { background:#f3f4f6; color:#374151; border:1px solid #e5e7eb; }
    .tv-primary:disabled { opacity:0.55; cursor:not-allowed; }
    .tv-mode-box { background:#fff; border:1px solid #e5e7eb; border-radius:0.875rem; padding:0.9rem; margin-bottom:1rem; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
    .tv-mode-title { margin:0 0 0.65rem; font-size:0.82rem; font-weight:900; color:#374151; text-transform:uppercase; letter-spacing:0.04em; }
    .tv-mode-options { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; }
    .tv-mode-btn { border:1.5px solid #e5e7eb; background:#f9fafb; color:#4b5563; border-radius:0.7rem; padding:0.75rem; text-align:left; cursor:pointer; font-weight:800; }
    .tv-mode-btn:disabled { opacity:0.48; cursor:not-allowed; }
    .tv-mode-btn span { display:block; font-size:0.72rem; color:#6b7280; font-weight:600; margin-top:0.2rem; line-height:1.35; }
    .tv-mode-btn.active { background:#e8760a; border-color:#e8760a; color:#fff; box-shadow:0 3px 12px rgba(232,118,10,0.25); }
    .tv-mode-btn.active span { color:#fff7ed; }
    .tv-layout { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:1.25rem; align-items:start; }
    .tv-grid { display:grid; grid-template-columns:repeat(1,minmax(0,1fr)); gap:1rem; }
    @media (min-width:700px) { .tv-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (min-width:1120px) { .tv-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
    @media (max-width:980px) { .tv-layout { grid-template-columns:1fr; } }
    @media (max-width:640px) {
        .tv-page { padding:0.85rem; }
        .tv-header { align-items:stretch; }
        .tv-actions { width:100%; }
        .tv-link, .tv-primary, .tv-secondary { width:100%; justify-content:center; }
        .tv-mode-options { grid-template-columns:1fr; }
        .tv-cart { position:static; }
    }
    .tv-card, .tv-cart, .tv-modal { background:#fff; border:1px solid #e5e7eb; border-radius:0.875rem; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
    .tv-card { overflow:hidden; display:flex; flex-direction:column; }
    .tv-img { height:150px; background:#f3f4f6; }
    .tv-img img { width:100%; height:100%; object-fit:cover; }
    .tv-body { padding:0.9rem; display:flex; flex-direction:column; gap:0.55rem; flex:1; }
    .tv-name { font-size:0.95rem; font-weight:900; color:#111827; margin:0; }
    .tv-meta { font-size:0.75rem; color:#6b7280; font-weight:700; margin:0; }
    .tv-price { font-size:1.05rem; font-weight:900; color:#c4620a; }
    .tv-row { display:grid; grid-template-columns:1fr auto; gap:0.5rem; align-items:center; }
    .tv-input, .tv-select { width:100%; border:1.5px solid #e5e7eb; border-radius:0.55rem; padding:0.55rem 0.7rem; font-size:0.85rem; box-sizing:border-box; }
    .tv-stock { font-size:0.72rem; font-weight:800; padding:0.22rem 0.55rem; border-radius:999px; background:#d1fae5; color:#065f46; }
    .tv-stock.out { background:#fee2e2; color:#991b1b; }
    .tv-cart { position:sticky; top:1rem; padding:1rem; }
    .tv-cart-title { font-size:1rem; font-weight:900; color:#111827; margin:0 0 0.8rem; }
    .tv-cart-empty { color:#9ca3af; font-size:0.85rem; text-align:center; padding:1.5rem 0.5rem; }
    .tv-cart-item { display:grid; grid-template-columns:1fr auto; gap:0.5rem; padding:0.65rem 0; border-bottom:1px solid #f3f4f6; }
    .tv-cart-item:last-child { border-bottom:none; }
    .tv-cart-name { font-size:0.82rem; font-weight:800; color:#374151; margin:0 0 0.2rem; }
    .tv-cart-detail { font-size:0.72rem; color:#9ca3af; margin:0; }
    .tv-remove { border:none; background:#fee2e2; color:#991b1b; border-radius:0.45rem; font-weight:900; cursor:pointer; width:28px; height:28px; }
    .tv-total { border-top:1px solid #e5e7eb; margin-top:0.75rem; padding-top:0.75rem; display:grid; gap:0.35rem; font-size:0.84rem; color:#4b5563; }
    .tv-total div { display:flex; justify-content:space-between; }
    .tv-total strong { color:#111827; font-size:1rem; }
    .tv-total .tv-primary { width:100%; justify-content:center; margin-top:0.75rem; }
    .tv-mode-note { margin:0.75rem 0 0; color:#92400e; background:#fef3c7; border:1px solid #fde68a; border-radius:0.65rem; padding:0.65rem 0.8rem; font-size:0.78rem; font-weight:800; line-height:1.35; }
    .tv-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:60; display:flex; align-items:center; justify-content:center; padding:1rem; }
    .tv-modal { width:min(520px,96vw); padding:1.25rem; }
    .tv-modal h3 { margin:0 0 0.35rem; color:#111827; font-size:1.1rem; font-weight:900; }
    .tv-modal p { margin:0 0 1rem; color:#6b7280; font-size:0.85rem; }
    .tv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; }
    @media (max-width:560px) { .tv-form-grid { grid-template-columns:1fr; } }
    .tv-field label { display:block; font-size:0.72rem; font-weight:800; color:#6b7280; text-transform:uppercase; margin-bottom:0.3rem; }
    .tv-modal-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1rem; flex-wrap:wrap; }
`;

const getPrecioUnidad = (producto, unidad) => (
    unidad === 'rollo'
        ? (Number(producto.precioPorRollo) || Number(producto.precio) || 0)
        : (Number(producto.precioPorMetro) || Number(producto.precio) || 0)
);

const getMetros = (producto, cantidad, unidad) => (
    unidad === 'rollo'
        ? Math.ceil(Number(cantidad) || 0) * (Number(producto.metrosPorRollo) || 100)
        : Number(cantidad) || 0
);

const TiendaVendedor = () => {
    const token = storeAuth(state => state.token);
    const { user } = storeProfile();
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cantidades, setCantidades] = useState({});
    const [unidades, setUnidades] = useState({});
    const [carrito, setCarrito] = useState([]);
    const [modoVenta, setModoVenta] = useState('tienda');
    const [modalOpen, setModalOpen] = useState(false);
    const [ordenPagoOpen, setOrdenPagoOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cliente, setCliente] = useState({ nombre: "", apellido: "", email: "", telefono: "", direccion: "", ruc: "" });
    const modoBloqueado = carrito.length > 0;
    const esPedidoEnTienda = modoVenta === 'tienda';
    const tituloPedido = esPedidoEnTienda ? 'Pedido en tienda' : 'Envio a domicilio';
    const vendedorAsignado = user
        ? {
            _id: user._id || user.id,
            id: user._id || user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            nombrePropietario: user.nombrePropietario,
        }
        : null;

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/images/no-image.png";
    };

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?limite=100`);
                const data = await res.json();
                setProductos(data.productos || data || []);
            } catch {
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const totales = useMemo(() => {
        const subtotalBruto = carrito.reduce((sum, item) => {
            const precio = getPrecioUnidad(item.producto, item.unidadSeleccionada);
            return sum + (precio * item.cantidad);
        }, 0);
        const subtotal = carrito.reduce((sum, item) => {
            const precio = getPrecioUnidad(item.producto, item.unidadSeleccionada);
            const descuento = Number(item.producto.descuento) || 0;
            return sum + (precio * item.cantidad * (1 - descuento / 100));
        }, 0);
        const descuentoTotal = Number((subtotalBruto - subtotal).toFixed(2));
        const iva = Number((subtotal * IVA_RATE).toFixed(2));
        const totalFinal = Number((subtotal + iva).toFixed(2));
        return { subtotal: Number(subtotal.toFixed(2)), descuentoTotal, iva, totalFinal };
    }, [carrito]);

    const agregar = async (producto) => {
        const unidad = unidades[producto._id] || (producto.unidadVenta === 'rollo' ? 'rollo' : 'metro');
        const cantidadRaw = cantidades[producto._id] ?? 1;
        const cantidad = unidad === 'rollo' ? Math.ceil(Number(cantidadRaw)) : Number(cantidadRaw);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            toast.error("Ingresa una cantidad válida.");
            return;
        }
        const metros = getMetros(producto, cantidad, unidad);
        if (metros > (Number(producto.metrosDisponibles) || 0)) {
            toast.error(`Stock insuficiente para ${producto.nombre}.`);
            return;
        }
        setCarrito(prev => {
            const idx = prev.findIndex(item => item.producto._id === producto._id && item.unidadSeleccionada === unidad);
            if (idx === -1) return [...prev, { producto, cantidad, unidadSeleccionada: unidad }];
            return prev.map((item, i) => i === idx ? { ...item, cantidad: item.cantidad + cantidad } : item);
        });
        toast.success(esPedidoEnTienda ? "Producto añadido al pedido en tienda." : "Producto añadido al envío a domicilio.");
    };

    const registrarVenta = async () => {
        const errores = [
            validarNombreReal(cliente.nombre, 2),
            validarNombreReal(cliente.apellido, 2),
            validarEmailRealista(cliente.email),
            validarTelefono10(cliente.telefono),
            validarCedulaRuc(cliente.ruc),
            cliente.direccion.trim().length >= 5 || "Ingresa una direccion valida"
        ].filter(error => error !== true);
        if (errores.length) {
            toast.error("Rellene todos los campos correctamente.");
            return;
        }
        setGuardando(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ordenes/tienda`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    cliente,
                    metodoPago: "Pago efectivo / tarjeta debito",
                    items: carrito.map(item => ({
                        productoId: item.producto._id,
                        cantidad: item.cantidad,
                        unidadSeleccionada: item.unidadSeleccionada
                    })),
                    desglose: { ...totales, envio: 0, comisionPago: 0 }
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.msg || "No se pudo registrar la venta.");
            toast.success("Pedido en tienda registrado correctamente.");
            setCarrito([]);
            setModalOpen(false);
            navigate("/dashboard/mis-pedidos");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setGuardando(false);
        }
    };

    const registrarOrdenDomicilio = async (orderData, facturacion) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ordenes/tienda`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    cliente: {
                        nombre: orderData.datosFacturacion.nombre,
                        apellido: orderData.datosFacturacion.apellido,
                        email: orderData.datosFacturacion.correo,
                        telefono: orderData.datosFacturacion.telefono,
                        direccion: orderData.datosFacturacion.direccion,
                        ruc: orderData.datosFacturacion.ruc,
                    },
                    metodoPago: orderData.metodoPago,
                    tipoEntrega: "domicilio",
                    direccionEnvio: orderData.direccionEnvio,
                    datosFacturacion: orderData.datosFacturacion,
                    items: carrito.map(item => ({
                        productoId: item.producto._id,
                        cantidad: item.cantidad,
                        unidadSeleccionada: item.unidadSeleccionada
                    })),
                    desglose: orderData.desglose
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.msg || "No se pudo registrar el envio a domicilio.");
            return { orden: data.orden, facturacion: { ...facturacion, vendedorAsignado } };
        } catch (error) {
            toast.error(error.message);
            return null;
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="tv-page">
                <div className="tv-header">
                    <div>
                        <h1 className="tv-title">Tienda</h1>
                        <p className="tv-sub">Registra ventas desde tu perfil de vendedor y crea el pedido como consumidor final.</p>
                    </div>
                    <div className="tv-actions">
                        <Link to="/dashboard/productos-admin" className="tv-link">Gestionar productos</Link>
                    </div>
                </div>

                <div className="tv-mode-box">
                    <p className="tv-mode-title">Tipo de venta</p>
                    <div className="tv-mode-options">
                        <button
                            type="button"
                            className={`tv-mode-btn${modoVenta === 'tienda' ? ' active' : ''}`}
                            disabled={modoBloqueado && modoVenta !== 'tienda'}
                            onClick={() => setModoVenta('tienda')}
                        >
                            Pedido en tienda
                            <span>Registra venta local con consumidor final y pago realizado.</span>
                        </button>
                        <button
                            type="button"
                            className={`tv-mode-btn${modoVenta === 'domicilio' ? ' active' : ''}`}
                            disabled={modoBloqueado && modoVenta !== 'domicilio'}
                            onClick={() => setModoVenta('domicilio')}
                        >
                            Envío a domicilio
                            <span>Gestiona el carrito y la orden de pago en esta misma tienda.</span>
                        </button>
                    </div>
                    {modoBloqueado && (
                        <p className="tv-mode-note">
                            Este pedido esta fijado como {tituloPedido}. Para cambiar de tipo de venta elimina los productos agregados.
                        </p>
                    )}
                </div>

                <div className="tv-layout">
                    <div className="tv-grid">
                        {loading ? (
                            <div className="tv-cart-empty">Cargando productos...</div>
                        ) : productos.map(producto => {
                            const unidadDefault = producto.unidadVenta === 'rollo' ? 'rollo' : 'metro';
                            const unidad = unidades[producto._id] || unidadDefault;
                            const metros = Number(producto.metrosDisponibles) || 0;
                            const rollos = Math.floor(metros / (Number(producto.metrosPorRollo) || 100));
                            return (
                                <article className="tv-card" key={producto._id}>
                                    <div className="tv-img">
                                        <img src={producto.imagenUrl || "/images/no-image.png"} alt={producto.nombre} onError={handleImageError} />
                                    </div>
                                    <div className="tv-body">
                                        <p className="tv-name">{producto.nombre}</p>
                                        <p className="tv-meta">{metros} metros disponibles / {rollos} rollos</p>
                                        <div className="tv-row">
                                            <span className="tv-price">${getPrecioUnidad(producto, unidad).toFixed(2)}</span>
                                            <span className={`tv-stock${metros > 0 ? "" : " out"}`}>{metros > 0 ? "Activo" : "Sin stock"}</span>
                                        </div>
                                        <select className="tv-select" value={unidad} onChange={e => setUnidades(prev => ({ ...prev, [producto._id]: e.target.value }))}>
                                            <option value="metro">Metros</option>
                                            <option value="rollo">Rollos</option>
                                        </select>
                                        <input
                                            className="tv-input"
                                            type="number"
                                            min={unidad === 'rollo' ? 1 : 0.01}
                                            step={unidad === 'rollo' ? 1 : 0.01}
                                            value={cantidades[producto._id] ?? 1}
                                            onChange={e => setCantidades(prev => ({ ...prev, [producto._id]: e.target.value }))}
                                        />
                                        <button className={modoVenta === 'tienda' ? 'tv-primary' : 'tv-secondary'} disabled={metros <= 0} onClick={() => agregar(producto)}>
                                            {modoVenta === 'tienda' ? 'Añadir a pedido en tienda' : 'Añadir para envío a domicilio'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <aside className="tv-cart">
                        <h2 className="tv-cart-title">{tituloPedido}</h2>
                        {carrito.length === 0 ? (
                            <div className="tv-cart-empty">Añade productos para continuar con {tituloPedido.toLowerCase()}.</div>
                        ) : carrito.map((item, index) => {
                            const precio = getPrecioUnidad(item.producto, item.unidadSeleccionada);
                            return (
                                <div className="tv-cart-item" key={`${item.producto._id}-${item.unidadSeleccionada}`}>
                                    <div>
                                        <p className="tv-cart-name">{item.producto.nombre}</p>
                                        <p className="tv-cart-detail">{item.cantidad} {item.unidadSeleccionada === 'rollo' ? 'rollos' : 'metros'} x ${precio.toFixed(2)}</p>
                                    </div>
                                    <button className="tv-remove" onClick={() => setCarrito(prev => prev.filter((_, i) => i !== index))}>×</button>
                                </div>
                            );
                        })}
                        {carrito.length > 0 && (
                            <div className="tv-total">
                                <div><span>Subtotal</span><span>${totales.subtotal.toFixed(2)}</span></div>
                                {totales.descuentoTotal > 0 && <div><span>Descuento</span><span>-${totales.descuentoTotal.toFixed(2)}</span></div>}
                                <div><span>IVA</span><span>${totales.iva.toFixed(2)}</span></div>
                                <div><strong>Total</strong><strong>${totales.totalFinal.toFixed(2)}</strong></div>
                                <button className="tv-primary" disabled={carrito.length === 0} onClick={() => esPedidoEnTienda ? setModalOpen(true) : setOrdenPagoOpen(true)}>
                                    {esPedidoEnTienda ? "Registrar pedido en tienda" : "Abrir orden de pago"}
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {modalOpen && (
                <div className="tv-overlay" onClick={() => setModalOpen(false)}>
                    <div className="tv-modal" onClick={e => e.stopPropagation()}>
                        <h3>Datos del consumidor final</h3>
                        <p>Estos datos se guardarán en el pedido y el cliente podrá verificarse después.</p>
                        <div className="tv-form-grid">
                            {[
                                ["nombre", "Nombre *"],
                                ["apellido", "Apellido"],
                                ["email", "Correo"],
                                ["telefono", "Teléfono"],
                                ["direccion", "Dirección"],
                                ["ruc", "Cédula/RUC"]
                            ].map(([name, label]) => (
                                <div className="tv-field" key={name}>
                                    <label>{label}</label>
                                    <input
                                        className="tv-input"
                                        value={cliente[name]}
                                        onChange={e => setCliente(prev => ({ ...prev, [name]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="tv-modal-actions">
                            <button className="tv-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="tv-primary" disabled={guardando} onClick={registrarVenta}>
                                {guardando ? "Registrando..." : "Crear pedido con consumidor final"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ordenPagoOpen && (
                <ModalOrdenPago
                    tipoEntrega="domicilio"
                    cartItems={carrito}
                    subtotalCart={totales.subtotal}
                    subtotalSinDescuento={totales.subtotal + totales.descuentoTotal}
                    descuentoTotal={totales.descuentoTotal}
                    vendedorAsignado={vendedorAsignado}
                    onClose={() => setOrdenPagoOpen(false)}
                    onOrdenCreada={() => {
                        setOrdenPagoOpen(false);
                        setCarrito([]);
                        toast.success("Pedido a domicilio registrado correctamente.");
                        navigate("/dashboard/mis-pedidos");
                    }}
                    onNeedCardPayment={() => {}}
                    onCrearOrdenPersonalizada={registrarOrdenDomicilio}
                />
            )}
        </>
    );
};

export default TiendaVendedor;
