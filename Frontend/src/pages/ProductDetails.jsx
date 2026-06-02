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
    @media (max-width: 768px) {
        .pd-header-inner { padding: 0.75rem 1.5rem; }
        .pd-nav { display: none; }
        .pd-header-btns { gap: 0.5rem; }
        .pd-login, .pd-register { padding: 0.45rem 0.75rem; }
        .pd-hero { padding: 2rem 1.5rem; }
        .pd-shell { padding: 1.5rem; }
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
            <div className="pd-page">
                <style>{detailStyles}</style>
                <PublicProductHeader />
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
        <div className="pd-page">
            <style>{detailStyles}</style>
            <PublicProductHeader />

            <div className="pd-shell">
                <Link to="/products" className="pd-back">
                    <FaArrowLeft /> Volver al catálogo
                </Link>

                <div className="pd-card">
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
                            {/* Disponibilidad con metros/rollos */}
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-0.5">Disponibilidad</p>
                                    {(() => {
                                        const metros = producto.metrosDisponibles ?? producto.stock ?? 0;
                                        const metrosPorRollo = producto.metrosPorRollo || 100;
                                        const rollos = Math.floor(metros / metrosPorRollo);
                                        return metros > 0 ? (
                                            <p className="font-bold text-sm text-green-600">
                                                ✅ {metros} m ({rollos} rollos)
                                            </p>
                                        ) : (
                                            <p className="font-bold text-sm text-red-500">❌ Agotado</p>
                                        );
                                    })()}                                </div>                                {producto.color && (
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

                            {/* Cantidad & unidad */}
                            {(producto.metrosDisponibles ?? producto.stock ?? 0) > 0 && (
                                <div>
                                    {/* Selector de unidad si tiene ambos */}
                                    {producto.unidadVenta === 'ambos' && (
                                        <div className="flex gap-2 mb-3">
                                            {['metro', 'rollo'].map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => { setUnidadSeleccionada(u); setCantidad(u === 'rollo' ? '1' : '0.5'); }}
                                                    className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
                                                        unidadSeleccionada === u
                                                            ? 'border-gray-700 bg-gray-700 text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {u.charAt(0).toUpperCase() + u.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Cantidad ({unidadSeleccionada})
                                    </label>
                                    <div className="flex gap-3 items-center">
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
                                            className="w-28 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-800 text-center focus:border-gray-700 outline-none"
                                        />
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={agregando}
                                            className="flex-1 bg-gray-700 text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-900 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <FaShoppingCart /> {agregando ? 'Agregando...' : 'Agregar al carrito'}
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
