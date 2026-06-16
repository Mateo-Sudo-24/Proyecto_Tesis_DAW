import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth";
import storeProfile from "../context/storeProfile";
import ModalOrdenPago from "../components/carrito/ModalOrdenPago.jsx";

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

    /* Paginación y Búsqueda */
    .tv-search-bar { position: relative; margin-bottom: 1rem; width: 100%; max-width: 400px; }
    .tv-search-icon { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
    .tv-search-input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.4rem; border: 1.5px solid #e5e7eb; border-radius: 0.6rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
    .tv-search-input:focus { border-color: #e8760a; }

    .tv-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.875rem; border-top:1px solid #f3f4f6; flex-wrap:wrap; margin-top:1.5rem; }
    .tv-btn-pag { padding:0.45rem 0.9rem; border-radius:0.5rem; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .tv-btn-pag:hover:not(:disabled) { background:#fde8ce; border-color:#e8760a; color:#c4620a; }
    .tv-btn-pag.active { background: #e8760a; color: #fff; border-color: #e8760a; }
    .tv-btn-pag:disabled { opacity: 0.4; cursor: not-allowed; }
    @media (max-width:640px) {
        .tv-page { padding:0.85rem; }
        .tv-header { align-items:stretch; }
        .tv-actions { width:100%; }
        .tv-link, .tv-primary, .tv-secondary { width:100%; justify-content:center; }
        .tv-mode-options { grid-template-columns:1fr; }
        .tv-cart { position:static; }
    }
    .tv-card, .tv-cart { background:#fff; border:1px solid #e5e7eb; border-radius:0.875rem; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
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
`;

const getPrecioUnidad = (producto, unidad) => (
    unidad === 'rollo'
        ? (Number(producto.precioPorRollo) || 0)
        : (Number(producto.precioPorMetro) || 0)
);

const getStockDisponible = (producto, unidad) => (
    unidad === 'rollo'
        ? (Number(producto.stock) || 0)
        : (Number(producto.metrosDisponibles) || 0)
);

const TiendaVendedor = () => {
    const token = storeAuth(state => state.token);
    const { user } = storeProfile();
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [cantidades, setCantidades] = useState({});
    const [unidades, setUnidades] = useState({});
    const [carrito, setCarrito] = useState([]);
    const [modoVenta, setModoVenta] = useState('tienda');
    const [ordenPagoOpen, setOrdenPagoOpen] = useState(false);
    const modoBloqueado = carrito.length > 0;
    const esPedidoEnTienda = modoVenta === 'tienda';
    const tituloPedido = esPedidoEnTienda ? 'Venta en tienda' : 'Envío a domicilio';
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
        const timeoutId = setTimeout(() => {
            const cargar = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?pagina=${pagina}&limite=6&busqueda=${busqueda}`);
                    const data = await res.json();
                    setProductos(data.productos || []);
                    setPaginas(data.paginas || 1);
                } catch {
                    toast.error("No se pudieron cargar los productos.");
                } finally {
                    setLoading(false);
                }
            };
            cargar();
        }, busqueda ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [pagina, busqueda]);

    const totales = useMemo(() => {
        const subtotal = carrito.reduce((sum, item) => {
            const precio = getPrecioUnidad(item.producto, item.unidadSeleccionada);
            return sum + (precio * item.cantidad);
        }, 0);
        const iva = Number((subtotal * IVA_RATE).toFixed(2));
        const totalFinal = Number((subtotal + iva).toFixed(2));
        return { subtotal: Number(subtotal.toFixed(2)), iva, totalFinal };
    }, [carrito]);

    const agregar = async (producto) => {
        const unidad = unidades[producto._id] || (producto.unidadVenta === 'rollo' ? 'rollo' : 'metro');
        const cantidadRaw = cantidades[producto._id] ?? 1;
        const cantidad = unidad === 'rollo' ? Math.ceil(Number(cantidadRaw)) : Number(cantidadRaw);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            toast.error("Ingresa una cantidad válida.");
            return;
        }
        const disponible = getStockDisponible(producto, unidad);
        const requerido = unidad === 'rollo'
            ? Math.ceil(cantidad)
            : cantidad;

        if (requerido > disponible) {
            toast.error(`Stock insuficiente para ${producto.nombre}.`);
            return;
        }
        setCarrito(prev => {
            const idx = prev.findIndex(item => item.producto._id === producto._id && item.unidadSeleccionada === unidad);
            if (idx === -1) return [...prev, { producto, cantidad, unidadSeleccionada: unidad }];
            return prev.map((item, i) => i === idx ? { ...item, cantidad: item.cantidad + cantidad } : item);
        });
        toast.success(esPedidoEnTienda ? "Producto añadido a la venta en tienda." : "Producto añadido al envío a domicilio.");
    };

    const registrarOrdenTienda = async (orderData, facturacion) => {
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
                    tipoEntrega: orderData.tipoEntrega,
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
            if (!res.ok) throw new Error(data.msg || "No se pudo registrar la orden.");
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
                            Venta en tienda
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
                    <div>
                        <div className="tv-search-bar">
                            <span className="tv-search-icon">🔍</span>
                            <input
                                type="text"
                                className="tv-search-input"
                                placeholder="Buscar productos..."
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                            />
                        </div>

                        <div className="tv-grid">
                            {loading ? (
                                <div className="tv-cart-empty">Cargando productos...</div>
                            ) : productos.length === 0 ? (
                                <div className="tv-cart-empty">No se encontraron productos.</div>
                            ) : productos.map(producto => {
                            const unidadDefault = producto.unidadVenta === 'rollo' ? 'rollo' : 'metro';
                            const unidad = unidades[producto._id] || unidadDefault;
                            const metros = Number(producto.metrosDisponibles) || 0;
                            const rollos = Number(producto.stock) || 0;
                            return (
                                <article className="tv-card" key={producto._id}>
                                    <div className="tv-img">
                                        <img src={producto.imagenUrl || "/images/no-image.png"} alt={producto.nombre} onError={handleImageError} />
                                    </div>
                                    <div className="tv-body">
                                        <p className="tv-name">{producto.nombre}</p>
                                        <p className="tv-meta">
                                            {producto.stock ?? 0} rollos en stock / {producto.metrosDisponibles ?? 0}m sueltos
                                        </p>
                                        <div className="tv-row">
                                            <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
                                                {producto.precioPorMetro > 0 && (
                                                    <span className="tv-price" style={{ fontSize:'0.85rem' }}>
                                                        Metro: ${producto.precioPorMetro.toFixed(2)}
                                                    </span>
                                                )}

                                                {producto.precioPorRollo > 0 && (
                                                    <span className="tv-price" style={{ fontSize:'0.85rem' }}>
                                                        Rollo: ${producto.precioPorRollo.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`tv-stock${(rollos > 0 || metros > 0) ? "" : " out"}`}>{(rollos > 0 || metros > 0) ? "Activo" : "Sin stock"}</span>
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
                                            {modoVenta === 'tienda' ? 'Añadir a venta en tienda' : 'Añadir para envío a domicilio'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                        </div>

                        {paginas > 1 && (
                            <div className="tv-pagination">
                                <button className="tv-btn-pag" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>Anterior</button>
                                {[...Array(paginas)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`tv-btn-pag${pagina === i + 1 ? ' active' : ''}`}
                                        onClick={() => setPagina(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button className="tv-btn-pag" disabled={pagina === paginas} onClick={() => setPagina(p => p + 1)}>Siguiente</button>
                            </div>
                        )}
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
                                <div><span>IVA</span><span>${totales.iva.toFixed(2)}</span></div>
                                <div><strong>Total</strong><strong>${totales.totalFinal.toFixed(2)}</strong></div>
                                <button className="tv-primary" disabled={carrito.length === 0} onClick={() => setOrdenPagoOpen(true)}>
                                    Abrir orden de pago
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {ordenPagoOpen && (
                <ModalOrdenPago
                    tipoEntrega={esPedidoEnTienda ? "retiro_almacen" : "envio_domicilio"}
                    cartItems={carrito}
                    subtotalCart={totales.subtotal}
                    vendedorAsignado={vendedorAsignado}
                    ocultarSubtituloEntrega={esPedidoEnTienda}
                    onClose={() => setOrdenPagoOpen(false)}
                    onOrdenCreada={() => {
                        setOrdenPagoOpen(false);
                        setCarrito([]);
                        toast.success(esPedidoEnTienda ? "Venta en tienda registrada correctamente." : "Envío a domicilio registrado correctamente.");
                        navigate("/dashboard/mis-pedidos");
                    }}
                    onNeedCardPayment={() => {}}
                    onCrearOrdenPersonalizada={registrarOrdenTienda}
                />
            )}
        </>
    );
};

export default TiendaVendedor;
