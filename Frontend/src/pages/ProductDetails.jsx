import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaShoppingCart, FaStar } from "react-icons/fa";
import storeAuth from "../context/storeAuth";

const detailStyles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --orange-border: #f0943a;
    }
    .pd-page {
        min-height: 100vh;
        background: #f9fafb;
        font-family: 'Inter', system-ui, sans-serif;
    }
    .pd-header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.07);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .pd-header-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    .pd-logo {
        font-size: 2rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -1px;
        text-decoration: none;
    }
    .pd-logo span { color: #111827; }
    .pd-nav {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pd-nav a {
        font-weight: 600;
        font-size: 0.95rem;
        color: #4b5563;
        text-decoration: none;
    }
    .pd-nav a:hover,
    .pd-nav a.activo {
        color: var(--orange-main);
        text-decoration: underline;
    }
    .pd-header-btns {
        display: flex;
        gap: 0.75rem;
        flex-shrink: 0;
    }
    .pd-login,
    .pd-register {
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 700;
        font-size: 0.875rem;
        text-decoration: none;
        border: 2px solid var(--orange-main);
    }
    .pd-login {
        background: var(--orange-main);
        color: #fff;
    }
    .pd-login:hover { background: var(--orange-dark); border-color: var(--orange-dark); }
    .pd-register {
        background: #fff;
        color: var(--orange-main);
    }
    .pd-register:hover { background: var(--orange-light); }
    .pd-hero {
        background: #1f2937;
        color: #fff;
        padding: 2.3rem 3rem;
    }
    .pd-hero-inner {
        max-width: 1280px;
        margin: 0 auto;
    }
    .pd-hero h1 {
        margin: 0;
        font-size: clamp(1.45rem, 3vw, 2.25rem);
        font-weight: 900;
    }
    .pd-hero span { color: var(--orange-border); }
    .pd-hero p {
        color: #9ca3af;
        margin: 0.35rem 0 0;
        font-size: 0.95rem;
    }
    .pd-shell {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2.5rem 3rem;
    }
    .pd-back {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #4b5563;
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 1.4rem;
        text-decoration: none;
    }
    .pd-back:hover { color: var(--orange-main); }
    .pd-card {
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 8px 28px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    .pd-card-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        min-height: 520px;
    }
    .pd-image-panel {
        position: relative;
        background: #f3f4f6;
        min-height: 520px;
        overflow: hidden;
    }
    .pd-image-panel img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .pd-discount-badge {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: #ef4444;
        color: #fff;
        font-size: 0.78rem;
        font-weight: 900;
        padding: 0.35rem 0.75rem;
        border-radius: 0.6rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    }
    .pd-info {
        padding: 2.5rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .pd-eyebrow {
        color: var(--orange-main);
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 0.6rem;
    }
    .pd-title {
        color: #111827;
        font-size: clamp(1.9rem, 4vw, 2.65rem);
        line-height: 1.08;
        font-weight: 900;
        margin: 0 0 1rem;
    }
    .pd-stars {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 1rem;
    }
    .pd-star-on { color: #f59e0b; }
    .pd-star-off { color: #e5e7eb; }
    .pd-rating-text {
        color: #6b7280;
        font-size: 0.86rem;
        margin-left: 0.35rem;
    }
    .pd-description {
        color: #4b5563;
        font-size: 1rem;
        line-height: 1.7;
        margin: 0 0 1.5rem;
    }
    .pd-price-row {
        display: flex;
        align-items: flex-end;
        gap: 0.85rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
    }
    .pd-price-old {
        color: #9ca3af;
        text-decoration: line-through;
        font-size: 1.1rem;
        font-weight: 700;
    }
    .pd-price {
        color: var(--orange-dark);
        font-size: clamp(2rem, 4vw, 2.8rem);
        line-height: 1;
        font-weight: 900;
    }
    .pd-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
        margin-bottom: 1.5rem;
    }
    .pd-meta-card {
        background: #f9fafb;
        border: 1px solid #eef2f7;
        border-radius: 0.85rem;
        padding: 0.85rem 1rem;
    }
    .pd-meta-label {
        color: #6b7280;
        font-size: 0.72rem;
        font-weight: 800;
        margin: 0 0 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .pd-meta-value {
        color: #111827;
        font-size: 0.92rem;
        font-weight: 800;
        margin: 0;
    }
    .pd-meta-value.in { color: #16a34a; }
    .pd-meta-value.out { color: #dc2626; }
    .pd-unit-buttons {
        display: flex;
        gap: 0.6rem;
        margin-bottom: 0.85rem;
        flex-wrap: wrap;
    }
    .pd-unit-btn {
        border: 2px solid #e5e7eb;
        background: #fff;
        color: #4b5563;
        border-radius: 0.75rem;
        padding: 0.58rem 1rem;
        font-size: 0.86rem;
        font-weight: 900;
        cursor: pointer;
    }
    .pd-unit-btn.active {
        background: #1f2937;
        border-color: #1f2937;
        color: #fff;
    }
    .pd-qty-label {
        display: block;
        color: #374151;
        font-size: 0.9rem;
        font-weight: 800;
        margin-bottom: 0.45rem;
    }
    .pd-buy-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .pd-qty-input {
        width: 7rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.8rem;
        padding: 0.72rem 0.85rem;
        color: #111827;
        font-size: 0.95rem;
        font-weight: 800;
        text-align: center;
        outline: none;
    }
    .pd-qty-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
    }
    .pd-cart-btn {
        flex: 1;
        border: none;
        border-radius: 0.85rem;
        background: #1f2937;
        color: #fff;
        padding: 0.86rem 1.25rem;
        font-size: 0.96rem;
        font-weight: 900;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        box-shadow: 0 4px 14px rgba(31,41,55,0.22);
    }
    .pd-cart-btn:hover:not(:disabled) {
        background: var(--orange-dark);
    }
    .pd-cart-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .pd-center-state {
        min-height: 360px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
    }
    .pd-state-icon {
        font-size: 3.5rem;
        margin-bottom: 1rem;
    }
    .pd-state-title {
        color: #374151;
        font-size: 1.5rem;
        font-weight: 900;
        margin: 0 0 0.4rem;
    }
    .pd-state-text {
        color: #6b7280;
        margin: 0 0 1.25rem;
    }
    .pd-state-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #1f2937;
        color: #fff;
        padding: 0.78rem 1.25rem;
        border-radius: 0.75rem;
        text-decoration: none;
        font-weight: 900;
    }
    @media (max-width: 768px) {
        .pd-header-inner { padding: 0.75rem 1.5rem; }
        .pd-nav { display: none; }
        .pd-header-btns { gap: 0.5rem; }
        .pd-login, .pd-register { padding: 0.45rem 0.75rem; }
        .pd-hero { padding: 2rem 1.5rem; }
        .pd-shell { padding: 1.5rem; }
        .pd-card-grid { grid-template-columns: 1fr; min-height: 0; }
        .pd-image-panel { min-height: 320px; }
        .pd-info { padding: 1.5rem; }
        .pd-meta-grid { grid-template-columns: 1fr; }
        .pd-buy-row { flex-direction: column; align-items: stretch; }
        .pd-qty-input { width: 100%; }
    }
`;

const PublicProductHeader = () => (
    <>
        <header className="pd-header">
            <div className="pd-header-inner">
                <Link to="/home" className="pd-logo">IN<span>TEX</span></Link>
                <ul className="pd-nav">
                    <li><Link to="/home">Inicio</Link></li>
                    <li><Link to="/nosotros">Nosotros</Link></li>
                    <li><Link to="/products" className="activo">Productos</Link></li>
                    <li><Link to="/contacto">Contacto</Link></li>
                </ul>
                <div className="pd-header-btns">
                    <Link to="/login" className="pd-login">Iniciar sesion</Link>
                    <Link to="/register" className="pd-register">Registrarse</Link>
                </div>
            </div>
        </header>
        <section className="pd-hero">
            <div className="pd-hero-inner">
                <h1>Detalle de <span>Producto</span></h1>
                <p>Consulta disponibilidad, precio y unidad de venta</p>
            </div>
        </section>
    </>
);

const ProductDetails = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState('1');
    const [unidadSeleccionada, setUnidadSeleccionada] = useState('metro');
    const [agregando, setAgregando] = useState(false);
    const token = storeAuth(state => state.token);

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/images/no-image.png";
    };

    useEffect(() => {
        const nextUnidad = producto?.unidadVenta === 'rollo' ? 'rollo' : 'metro';
        setUnidadSeleccionada(nextUnidad);
        setCantidad(nextUnidad === 'rollo' ? '1' : '0.5');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [producto]);

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

    const handleAddToCart = async () => {
        if (!token) {
            toast.info('Inicia sesión para agregar productos.');
            return;
        }
        const cantidadNum = Number(cantidad);
        if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
            toast.error('Ingresa una cantidad válida.');
            return;
        }
        const metrosDisponibles = producto.metrosDisponibles ?? producto.stock ?? 0;
        const metrosPorRollo = producto.metrosPorRollo || 100;
        const metrosSolicitados = unidadSeleccionada === 'rollo'
            ? Math.ceil(cantidadNum) * metrosPorRollo
            : cantidadNum;
        if (metrosSolicitados > metrosDisponibles) {
            toast.error('No hay suficiente stock disponible');
            return;
        }
        setAgregando(true);
        const toastId = toast.loading(`${producto.nombre} se está agregando al carrito...`);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productoId: producto._id, cantidad: unidadSeleccionada === 'rollo' ? Math.ceil(cantidadNum) : cantidadNum, unidadSeleccionada }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.msg || "Error al agregar al carrito");
            }
                toast.update(toastId, {
                    render: `Agregado: ${unidadSeleccionada === 'rollo' ? Math.ceil(cantidadNum) : cantidadNum} ${unidadSeleccionada}${cantidadNum !== 1 ? 's' : ''} al carrito`,
                    type: 'success',
                    isLoading: false,
                    autoClose: 2500,
                });
        } catch (error) {
            toast.update(toastId, {
                render: error.message,
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setAgregando(false);
        }
    };

    if (loading) {
        return (
            <div className="pd-page">
                <style>{detailStyles}</style>
                <PublicProductHeader />
                <div className="pd-center-state">
                    <div>
                        <div className="pd-state-icon">...</div>
                        <p className="pd-state-text">Cargando producto...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="pd-page">
                <style>{detailStyles}</style>
                <PublicProductHeader />
                <div className="pd-center-state">
                    <div className="pd-state-icon">!</div>
                    <h2 className="pd-state-title">Producto no encontrado</h2>
                    <p className="pd-state-text">El producto que buscas no existe o fue removido.</p>
                    <Link to="/products" className="pd-state-btn">
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
        <div className="pd-page">
            <style>{detailStyles}</style>
            <PublicProductHeader />

            <div className="pd-shell">
                <Link to="/products" className="pd-back">
                    <FaArrowLeft /> Volver al catálogo
                </Link>

                <div className="pd-card">
                    <div className="pd-card-grid">
                        {/* Image */}
                        <div className="pd-image-panel">
                            <img
                                src={producto.imagenUrl || "/images/no-image.png"}
                                alt={producto.nombre}
                                onError={handleImageError}
                            />
                            {producto.descuento > 0 && (
                                <span className="pd-discount-badge">
                                    -{producto.descuento}% DESCUENTO
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="pd-info">
                            <span className="pd-eyebrow">Detalle del producto</span>
                            <h1 className="pd-title">{producto.nombre}</h1>

                            {producto.calificacionPromedio > 0 && (
                                <div className="pd-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(producto.calificacionPromedio) ? 'pd-star-on' : 'pd-star-off'} />
                                    ))}
                                    <span className="pd-rating-text">({producto.calificacionPromedio.toFixed(1)})</span>
                                </div>
                            )}

                            <p className="pd-description">{producto.descripcion}</p>

                            {/* Price */}
                            <div className="pd-price-row">
                                {producto.descuento > 0 ? (
                                    <>
                                        <span className="pd-price-old">${producto.precio.toLocaleString()}</span>
                                        <span className="pd-price">${precioFinal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                    </>
                                ) : (
                                    <span className="pd-price">${producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                                )}
                            </div>

                            {/* Details grid */}
                            <div className="pd-meta-grid">
                                <div className="pd-meta-card">
                                    <p className="pd-meta-label">Disponibilidad</p>
                                    {(() => {
                                        const metros = producto.metrosDisponibles ?? producto.stock ?? 0;
                                        const metrosPorRollo = producto.metrosPorRollo || 100;
                                        const rollos = Math.floor(metros / metrosPorRollo);
                                        return metros > 0 ? (
                                            <p className="pd-meta-value in">
                                                {metros} m ({rollos} rollos)
                                            </p>
                                        ) : (
                                            <p className="pd-meta-value out">Agotado</p>
                                        );
                                    })()}
                                </div>
                                {producto.color && (
                                    <div className="pd-meta-card">
                                        <p className="pd-meta-label">Color</p>
                                        <p className="pd-meta-value">{producto.color}</p>
                                    </div>
                                )}
                                <div className="pd-meta-card">
                                    <p className="pd-meta-label">Estado</p>
                                    <p className="pd-meta-value">{producto.estado}</p>
                                </div>
                            </div>

                            {/* Cantidad & unidad */}
                            {(producto.metrosDisponibles ?? producto.stock ?? 0) > 0 && (
                                <div>
                                    {/* Selector de unidad si tiene ambos */}
                                    {producto.unidadVenta === 'ambos' && (
                                        <div className="pd-unit-buttons">
                                            {['metro', 'rollo'].map(u => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => {
                                                        setUnidadSeleccionada(u);
                                                        setCantidad('');
                                                        setTimeout(() => setCantidad(u === 'rollo' ? '1' : '0.5'), 0);
                                                    }}
                                                    className={`pd-unit-btn${unidadSeleccionada === u ? ' active' : ''}`}
                                                >
                                                    {u.charAt(0).toUpperCase() + u.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <label className="pd-qty-label">
                                        Cantidad ({unidadSeleccionada})
                                    </label>
                                    <div className="pd-buy-row">
                                        <input
                                            type="number"
                                            min={unidadSeleccionada === 'rollo' ? 1 : 0.01}
                                            step={unidadSeleccionada === 'rollo' ? 1 : 0.01}
                                            value={cantidad}
                                            onChange={e => {
                                                setCantidad(e.target.value);
                                            }}
                                            onBlur={() => {
                                                const v = Number(cantidad);
                                                if (!Number.isFinite(v) || v <= 0) {
                                                    setCantidad(unidadSeleccionada === 'rollo' ? '1' : '0.5');
                                                    return;
                                                }
                                                setCantidad(String(unidadSeleccionada === 'rollo' ? Math.ceil(v) : v));
                                            }}
                                            className="pd-qty-input"
                                        />
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={agregando}
                                            className="pd-cart-btn"
                                        >
                                            <FaShoppingCart /> {agregando ? 'Agregando...' : 'Agregar al carrito'}
                                        </button>
                                        </div>
                                        <p style={{ margin: '0.65rem 0 0', color: '#92400e', fontSize: '0.82rem', fontWeight: 800 }}>
                                            Este articulo se puede comprar en rollos y tambien por metros.
                                        </p>
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
