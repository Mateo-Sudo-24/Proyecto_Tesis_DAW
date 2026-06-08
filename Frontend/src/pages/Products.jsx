import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth";

const NO_IMAGE_SRC = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <rect width="640" height="420" fill="#f3f4f6"/>
  <rect x="96" y="88" width="448" height="244" rx="24" fill="#fff7ed" stroke="#f59e0b" stroke-width="3"/>
  <path d="M160 286l92-96 72 68 56-58 100 86H160z" fill="#fdba74"/>
  <circle cx="448" cy="150" r="32" fill="#fed7aa"/>
  <text x="320" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#92400e">Imagen no disponible</text>
</svg>`);

const getProductImageSrc = (producto = {}) => producto.imagenUrl || NO_IMAGE_SRC;
const metrosDisponibles = (producto = {}) => Number(producto.metrosDisponibles ?? 0) || 0;
const metrosPorRollo = (producto = {}) => Number(producto.metrosPorRollo || 100) || 100;
const rollosDisponibles = (producto = {}) => Number(producto.stock ?? 0) || 0;
const permiteMetro = (producto = {}) => producto.unidadVenta !== 'rollo';
const permiteRollo = (producto = {}) =>
    producto.unidadVenta === 'rollo' ||
    producto.unidadVenta === 'ambos' ||
    (rollosDisponibles(producto) > 0 && Number(producto.precioPorRollo ?? 0) > 0);
const opcionesUnidad = (producto = {}) => [
    ...(permiteMetro(producto) ? ['metro'] : []),
    ...(permiteRollo(producto) ? ['rollo'] : []),
];
const unidadDefault = (producto = {}) => {
    const opciones = opcionesUnidad(producto);
    if (producto.unidadVenta === 'rollo' && opciones.includes('rollo')) return 'rollo';
    return opciones.includes('metro') ? 'metro' : (opciones[0] || 'metro');
};
const precioUnidad = (producto = {}, unidad = 'metro') =>
    unidad === 'rollo'
        ? Number(producto.precioPorRollo ?? 0)
        : Number(producto.precioPorMetro ?? 0);

/* ── CSS interno (mismo sistema que Home, Nosotros y Contact) ── */
const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── HEADER ── */
    .prod-header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 6px rgba(0,0,0,0.07);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .prod-header-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    .prod-logo {
        font-size: 2rem;
        font-weight: 900;
        color: var(--orange-main);
        letter-spacing: -1px;
        flex-shrink: 0;
        text-decoration: none;
    }
    .prod-logo span { color: #111827; }

    .prod-nav {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0; padding: 0;
    }
    .prod-nav a {
        font-weight: 600;
        font-size: 0.95rem;
        color: #4b5563;
        text-decoration: none;
        transition: color 0.18s;
    }
    .prod-nav a:hover  { color: var(--orange-main); text-decoration: underline; }
    .prod-nav a.activo { color: var(--orange-main); text-decoration: underline; }

    .prod-header-btns { display: flex; gap: 0.75rem; flex-shrink: 0; }
    .btn-header-login {
        padding: 0.5rem 1.25rem;
        background: var(--orange-main);
        color: #fff; font-weight: 700; font-size: 0.875rem;
        border-radius: 0.5rem; text-decoration: none;
        border: 2px solid var(--orange-main);
        transition: background 0.18s, transform 0.15s;
    }
    .btn-header-login:hover { background: var(--orange-dark); border-color: var(--orange-dark); transform: translateY(-1px); }
    .btn-header-register {
        padding: 0.5rem 1.25rem;
        background: #fff;
        color: var(--orange-main); font-weight: 700; font-size: 0.875rem;
        border-radius: 0.5rem; text-decoration: none;
        border: 2px solid var(--orange-main);
        transition: background 0.18s, color 0.18s, transform 0.15s;
    }
    .btn-header-register:hover { background: var(--orange-light); transform: translateY(-1px); }

    /* ── HERO CATÁLOGO ── */
    .prod-hero {
        background: #1f2937;
        padding: 3.5rem 3rem;
        color: #fff;
    }
    .prod-hero-inner {
        max-width: 1280px; margin: 0 auto;
        display: flex; align-items: center;
        justify-content: space-between; gap: 2rem;
        flex-wrap: wrap;
    }
    .prod-hero h1 {
        font-size: clamp(1.75rem, 3vw, 2.5rem);
        font-weight: 900; margin: 0 0 0.4rem;
    }
    .prod-hero h1 span { color: var(--orange-border); }
    .prod-hero p { color: #9ca3af; font-size: 0.95rem; margin: 0; }

    /* ── BODY WRAPPER ── */
    .prod-body {
        max-width: 1280px; margin: 0 auto;
        padding: 2.5rem 3rem;
    }

    /* ── BARRA BÚSQUEDA + FILTRO ── */
    .prod-search-row {
        display: flex; gap: 1rem; align-items: stretch;
        margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .prod-search-wrap { position: relative; flex: 1; min-width: 220px; }
    .prod-search-icon {
        position: absolute; left: 1rem; top: 50%;
        transform: translateY(-50%);
        color: #9ca3af; pointer-events: none;
    }
    .prod-search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        font-size: 0.9rem; color: #374151;
        outline: none; background: #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        transition: border-color 0.18s, box-shadow 0.18s;
        box-sizing: border-box;
    }
    .prod-search-input:focus { border-color: var(--orange-main); box-shadow: 0 0 0 3px rgba(232,118,10,0.1); }

    .btn-filter {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 700; font-size: 0.875rem;
        border: 1.5px solid #e5e7eb;
        background: #fff; color: #374151;
        cursor: pointer; transition: all 0.18s;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .btn-filter:hover  { border-color: var(--orange-main); color: var(--orange-main); }
    .btn-filter.open   { background: #1f2937; color: #f59e0b; border-color: #1f2937; }

    /* ── PANEL DE FILTROS ── */
    .prod-filter-panel {
        background: #fff;
        border: 1.5px solid #e5e7eb;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .prod-filter-label {
        font-size: 0.75rem; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.07em;
        color: #6b7280; margin-bottom: 0.6rem; display: block;
    }
    .prod-price-row { display: flex; align-items: center; gap: 0.75rem; }
    .prod-price-badge {
        font-size: 0.75rem; font-weight: 700;
        background: var(--orange-light); color: var(--orange-dark);
        padding: 0.2rem 0.5rem; border-radius: 0.4rem;
        flex-shrink: 0;
    }
    input[type="range"].prod-range { flex: 1; accent-color: var(--orange-main); }
    .prod-select {
        width: 100%;
        padding: 0.6rem 0.9rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-size: 0.875rem; color: #374151;
        outline: none; background: #fff;
        transition: border-color 0.18s;
        cursor: pointer;
    }
    .prod-select:focus { border-color: var(--orange-main); box-shadow: 0 0 0 2px rgba(232,118,10,0.1); }
    .btn-clear-filters {
        width: 100%; padding: 0.65rem 1rem;
        background: #f3f4f6; color: #374151;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-weight: 700; font-size: 0.875rem;
        cursor: pointer; transition: background 0.18s;
        align-self: flex-end;
    }
    .btn-clear-filters:hover { background: #e5e7eb; }

    /* ── CONTADOR ── */
    .prod-count { font-size: 0.85rem; color: #9ca3af; font-weight: 500; margin-bottom: 1.25rem; }

    /* ── GRID DE PRODUCTOS ── */
    .prod-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1.5rem;
    }
    @media (min-width: 640px)  { .prod-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(4, 1fr); } }

    /* Skeleton */
    .prod-skeleton {
        background: #fff; border-radius: 1rem;
        height: 320px; overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .skeleton-img { background: #e5e7eb; height: 190px; animation: shimmer 1.4s ease-in-out infinite; }
    .skeleton-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .skeleton-line { background: #e5e7eb; border-radius: 0.4rem; animation: shimmer 1.4s ease-in-out infinite; }
    @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }

    /* Tarjeta producto */
    .prod-card {
        background: #fff;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.07);
        transition: box-shadow 0.22s, transform 0.22s;
        display: flex; flex-direction: column;
    }
    .prod-card:hover { box-shadow: 0 8px 28px rgba(232,118,10,0.15); transform: translateY(-4px); }

    .prod-card-img {
        position: relative; height: 200px;
        background: #f3f4f6; overflow: hidden;
    }
    .prod-card-img img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.3s ease;
    }
    .prod-card:hover .prod-card-img img { transform: scale(1.06); }

    .badge-stock {
        position: absolute; top: 0.75rem; right: 0.75rem;
        background: #fbbf24; color: #78350f;
        font-size: 0.7rem; font-weight: 800;
        padding: 0.2rem 0.55rem; border-radius: 0.4rem;
    }

    .prod-card-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; text-align: center; align-items: center; }
    .prod-card-name { font-size: 0.95rem; font-weight: 800; color: #111827; margin-bottom: 0.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
    .prod-card-desc { font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .prod-card-color { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.75rem; }
    .prod-card-color span { font-weight: 700; color: #374151; }

    .prod-card-footer { display: flex; align-items: center; justify-content: center; margin-bottom: 0.875rem; gap: 0.75rem; flex-wrap: wrap; }
    .prod-price { font-size: 1.2rem; font-weight: 900; color: var(--orange-dark); }
    .prod-price-compare { width:100%; display:flex; justify-content:center; gap:0.55rem; flex-wrap:wrap; margin:-0.35rem 0 0.75rem; }
    .prod-price-chip { border:1px solid #fde8ce; background:#fff7ed; color:#92400e; border-radius:999px; padding:0.22rem 0.55rem; font-size:0.72rem; font-weight:800; }
    .prod-stock-badge {
        font-size: 0.7rem; font-weight: 700;
        padding: 0.2rem 0.55rem; border-radius: 9999px;
    }
    .prod-stock-badge.in  { background: #d1fae5; color: #065f46; }
    .prod-stock-badge.out { background: #fee2e2; color: #991b1b; }

    .btn-ver-detalles {
        display: block; width: 100%; text-align: center;
        padding: 0.65rem 1rem;
        background: var(--orange-main);
        color: #fff; font-weight: 700; font-size: 0.875rem;
        border-radius: 0.625rem; text-decoration: none;
        transition: background 0.18s, transform 0.15s;
        margin-top: auto;
        box-shadow: 0 3px 10px rgba(232,118,10,0.25);
    }
    .btn-ver-detalles:hover { background: var(--orange-dark); transform: translateY(-1px); }
    .btn-add-cart {
        width: 100%;
        border: none;
        border-radius: 0.625rem;
        padding: 0.65rem 1rem;
        background: #111827;
        color: #fff;
        font-weight: 800;
        font-size: 0.875rem;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: background 0.18s, transform 0.15s;
    }
    .btn-add-cart:hover:not(:disabled) { background: var(--orange-dark); transform: translateY(-1px); }
    .btn-add-cart:disabled { opacity: 0.55; cursor: not-allowed; }
    .prod-unit-select { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.45rem 0.55rem; font-weight:700; color:#374151; background:#fff; }

    /* ── PAGINACIÓN ── */
    .prod-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        margin-top: 3rem;
    }
    .btn-pag {
        width: 40px; height: 40px;
        display: flex; align-items: center; justify-content: center;
        border: 1.5px solid #e5e7eb;
        background: #fff; color: #374151;
        border-radius: 0.5rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
    }
    .btn-pag:hover:not(:disabled) { border-color: var(--orange-main); color: var(--orange-main); }
    .btn-pag.active { background: var(--orange-main); color: #fff; border-color: var(--orange-main); }
    .btn-pag:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── ESTADO VACÍO ── */
    .prod-empty {
        text-align: center; padding: 5rem 2rem;
        background: #fff; border-radius: 1rem;
        border: 1.5px solid #e5e7eb;
    }
    .prod-empty .icon { font-size: 4rem; margin-bottom: 1rem; }
    .prod-empty h3 { font-size: 1.25rem; font-weight: 800; color: #374151; margin-bottom: 0.5rem; }
    .prod-empty p  { color: #9ca3af; }

    @media (max-width: 768px) {
        .prod-header-inner { padding: 0.75rem 1.5rem; }
        .prod-nav { display: none; }
        .prod-hero { padding: 2.5rem 1.5rem; }
        .prod-body { padding: 1.5rem 1.5rem; }
    }
`;

const Products = () => {
    const [productos, setProductos]               = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [searchTerm, setSearchTerm]             = useState("");
    const [debouncedSearch, setDebouncedSearch]   = useState("");
    const [priceRange, setPriceRange]             = useState([0, 10000]);
    const [selectedColor, setSelectedColor]       = useState("");
    const [showFilters, setShowFilters]           = useState(false);
    const [colors, setColors]                     = useState([]);
    const [agregando, setAgregando]               = useState(null);
    const [unidadesCompra, setUnidadesCompra]     = useState({});

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const limite = 8;

    const token = storeAuth(state => state.token);

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = NO_IMAGE_SRC;
    };

    const cambiarPagina = (nuevaPagina) => {
        setPagina(nuevaPagina);
        window.scrollTo(0, 0);
    };

    // Debounce búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagina(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                pagina,
                limite,
                busqueda: debouncedSearch,
                precioMax: priceRange[1],
            });
            if (selectedColor) params.append('color', selectedColor);

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?${params.toString()}`);
            const data = await res.json();

            setProductos(data.productos || []);
            setTotalPaginas(data.totalPaginas || 1);

            // Obtener colores únicos (esto idealmente vendría de otro endpoint o se haría una vez)
            if (colors.length === 0) {
                const resAll = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?limite=1000`);
                const dataAll = await resAll.json();
                const all = dataAll.productos || [];
                setColors([...new Set(all.map(p => p.color).filter(Boolean))]);
            }
        } catch {
            setProductos([]);
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, [pagina, debouncedSearch, priceRange[1], selectedColor]);

    const handlePriceChange = (e) => setPriceRange([priceRange[0], parseInt(e.target.value)]);

    const agregarAlCarrito = async (producto) => {
        if (!token) {
            toast.info('Inicia sesión para agregar productos al carrito.');
            return;
        }
        const productoId = producto?._id;
        if (!productoId) return;
        const unidadSeleccionada = unidadesCompra[productoId] || unidadDefault(producto);
        setAgregando(productoId);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productoId, cantidad: 1, unidadSeleccionada }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.msg || 'No se pudo agregar al carrito.');
            toast.success(`${producto.nombre} agregado al carrito.`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAgregando(null);
        }
    };

    return (
        <>
            <style>{styles}</style>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <header className="prod-header">
                <div className="prod-header-inner">
                    <a href="/home" className="prod-logo">IN<span>TEX</span></a>
                    <ul className="prod-nav">
                        <li><Link to="/home">Inicio</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/products" className="activo">Productos</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                    <div className="prod-header-btns">
                        <Link to="/login"    className="btn-header-login">Iniciar sesión</Link>
                        <Link to="/register" className="btn-header-register">Registrarse</Link>
                    </div>
                </div>
            </header>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="prod-hero">
                <div className="prod-hero-inner">
                    <div>
                        <h1>Catálogo de <span>Productos</span></h1>
                        <p>Encuentra el textil perfecto para tu proyecto</p>
                    </div>
                </div>
            </section>

            {/* ── BODY ─────────────────────────────────────────────── */}
            <div className="prod-body">

                {/* Búsqueda + botón filtro */}
                <div className="prod-search-row">
                    <div className="prod-search-wrap">
                        <FaSearch className="prod-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="prod-search-input"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-filter${showFilters ? ' open' : ''}`}
                    >
                        {showFilters ? <FaTimes /> : <FaFilter />}
                        {showFilters ? 'Cerrar filtros' : 'Filtros'}
                    </button>
                </div>

                {/* Panel de filtros */}
                {showFilters && (
                    <div className="prod-filter-panel">
                        <div>
                            <label className="prod-filter-label">Rango de precio</label>
                            <div className="prod-price-row">
                                <span className="prod-price-badge">${priceRange[0]}</span>
                                <input
                                    type="range" min="0" max="10000" step="100"
                                    value={priceRange[1]}
                                    onChange={handlePriceChange}
                                    className="prod-range"
                                />
                                <span className="prod-price-badge">${priceRange[1]}</span>
                            </div>
                        </div>

                        {colors.length > 0 && (
                            <div>
                                <label className="prod-filter-label">Color</label>
                                <select
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="prod-select"
                                >
                                    <option value="">Todos los colores</option>
                                    {colors.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                className="btn-clear-filters"
                                onClick={() => { setSearchTerm(""); setPriceRange([0, 10000]); setSelectedColor(""); }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Contador */}
                <p className="prod-count">
                    {loading ? 'Cargando productos…' : `Mostrando productos ${productos.length > 0 ? (pagina-1)*limite+1 : 0} - ${(pagina-1)*limite + productos.length}`}
                </p>

                {/* Grid */}
                {loading ? (
                    <div className="prod-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="prod-skeleton">
                                <div className="skeleton-img" />
                                <div className="skeleton-body">
                                    <div className="skeleton-line" style={{ height: '14px', width: '75%' }} />
                                    <div className="skeleton-line" style={{ height: '11px', width: '50%' }} />
                                    <div className="skeleton-line" style={{ height: '36px', width: '100%', marginTop: '0.5rem' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : productos.length === 0 ? (
                    <div className="prod-empty">
                        <div className="icon">🔍</div>
                        <h3>Productos no encontrados</h3>
                        <p>No encontramos productos que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <>
                    <div className="prod-grid">
                        {productos.map(producto => (
                            <div key={producto._id} className="prod-card">
                                <div className="prod-card-img">
                                    <img
                                        src={getProductImageSrc(producto)}
                                        alt={producto.nombre}
                                        onError={handleImageError}
                                    />
                                    {((producto.stock ?? 0) > 0 || (producto.metrosDisponibles ?? 0) > 0) && (producto.stock ?? 0) < 4 && (
                                        <span className="badge-stock">¡Últimas unidades!</span>
                                    )}
                                </div>
                                <div className="prod-card-body">
                                    <h3 className="prod-card-name">{producto.nombre}</h3>
                                    <p className="prod-card-desc">{producto.descripcion}</p>
                                    {producto.color && (
                                        <p className="prod-card-color">Color: <span>{producto.color}</span></p>
                                    )}
                                    <div className="prod-card-footer">
                                        <span className={`prod-stock-badge ${((producto.stock ?? 0) > 0 || (producto.metrosDisponibles ?? 0) > 0) ? 'in' : 'out'}`}>
                                            {(() => {
                                                const rollos = producto.stock ?? 0;
                                                const metros = producto.metrosDisponibles ?? 0;

                                                if (rollos === 0 && metros === 0) {
                                                    return 'Agotado';
                                                }

                                                return `${rollos} rollos / ${metros}m sueltos`;
                                            })()}
                                        </span>
                                    </div>
                                    {opcionesUnidad(producto).length > 1 && (
                                        <div className="prod-price-compare">
                                            <span className="prod-price-chip">Metro: ${precioUnidad(producto, 'metro').toLocaleString()}</span>
                                            <span className="prod-price-chip">Rollo: ${precioUnidad(producto, 'rollo').toLocaleString()}</span>
                                        </div>
                                    )}
                                    <p style={{ margin: '0 0 0.75rem', color: '#6b7280', fontSize: '0.78rem', fontWeight: 700 }}>
                                        Unidad: {producto.unidadVenta || 'metro'}
                                    </p>
                                    {opcionesUnidad(producto).length > 1 && (
                                        <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '0.75rem' }}>
                                            <p style={{ margin: 0, color: '#92400e', fontSize: '0.76rem', fontWeight: 800 }}>
                                                Este articulo se puede comprar por rollos o por metros.
                                            </p>
                                            <select
                                                value={unidadesCompra[producto._id] || unidadDefault(producto)}
                                                onChange={(e) => setUnidadesCompra(prev => ({ ...prev, [producto._id]: e.target.value }))}
                                                className="prod-unit-select"
                                            >
                                                {opcionesUnidad(producto).map(u => (
                                                    <option key={u} value={u}>Comprar por {u === 'rollo' ? 'rollos' : 'metros'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <Link to={`/products/${producto._id}`} className="btn-ver-detalles">
                                        Ver Detalles
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn-add-cart"
                                        disabled={agregando === producto._id || ((producto.stock ?? 0) === 0 && (producto.metrosDisponibles ?? 0) === 0)}
                                        onClick={() => agregarAlCarrito(producto)}
                                    >
                                        {((producto.stock ?? 0) === 0 && (producto.metrosDisponibles ?? 0) === 0)
                                            ? 'Sin stock'
                                            : agregando === producto._id
                                                ? 'Agregando...'
                                                : 'Añadir al carrito'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="prod-pagination">
                            <button
                                className="btn-pag"
                                onClick={() => cambiarPagina(Math.max(1, pagina - 1))}
                                disabled={pagina === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPaginas)].map((_, i) => (
                                <button
                                    key={i+1}
                                    className={`btn-pag${pagina === i + 1 ? ' active' : ''}`}
                                    onClick={() => cambiarPagina(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="btn-pag"
                                onClick={() => cambiarPagina(Math.min(totalPaginas, pagina + 1))}
                                disabled={pagina === totalPaginas}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </>
    );
};

export default Products;
