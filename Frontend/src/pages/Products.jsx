import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

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

    .badge-descuento {
        position: absolute; top: 0.75rem; left: 0.75rem;
        background: #ef4444; color: #fff;
        font-size: 0.7rem; font-weight: 800;
        padding: 0.2rem 0.55rem; border-radius: 0.4rem;
    }
    .badge-stock {
        position: absolute; top: 0.75rem; right: 0.75rem;
        background: #fbbf24; color: #78350f;
        font-size: 0.7rem; font-weight: 800;
        padding: 0.2rem 0.55rem; border-radius: 0.4rem;
    }

    .prod-card-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
    .prod-card-name { font-size: 0.95rem; font-weight: 800; color: #111827; margin-bottom: 0.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .prod-card-desc { font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .prod-card-color { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.75rem; }
    .prod-card-color span { font-weight: 700; color: #374151; }

    .prod-card-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem; }
    .prod-price { font-size: 1.2rem; font-weight: 900; color: var(--orange-dark); }
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
    const [allProductos, setAllProductos]         = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [searchTerm, setSearchTerm]             = useState("");
    const [priceRange, setPriceRange]             = useState([0, 10000]);
    const [selectedColor, setSelectedColor]       = useState("");
    const [showFilters, setShowFilters]           = useState(false);
    const [colors, setColors]                     = useState([]);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos`);
                const data = await res.json();
                const productos = data.productos || data;
                setAllProductos(productos);
                const uniqueColors = [...new Set(productos.map(p => p.color).filter(Boolean))];
                setColors(uniqueColors);
                setFilteredProductos(productos);
            } catch {
                setAllProductos([]);
                setFilteredProductos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    useEffect(() => {
        let result = allProductos;
        if (searchTerm) {
            result = result.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        result = result.filter(p => p.precio >= priceRange[0] && p.precio <= priceRange[1]);
        if (selectedColor) result = result.filter(p => p.color === selectedColor);
        result = result.filter(p => p.estado === 'activo');
        setFilteredProductos(result);
    }, [searchTerm, priceRange, selectedColor, allProductos]);

    const handlePriceChange = (e) => setPriceRange([priceRange[0], parseInt(e.target.value)]);

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
                    {loading ? 'Cargando productos…' : `${filteredProductos.length} producto(s) encontrado(s)`}
                </p>

                {/* Grid */}
                {loading ? (
                    <div className="prod-grid">
                        {[...Array(8)].map((_, i) => (
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
                ) : filteredProductos.length === 0 ? (
                    <div className="prod-empty">
                        <div className="icon">🔍</div>
                        <h3>Sin resultados</h3>
                        <p>No encontramos productos que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="prod-grid">
                        {filteredProductos.map(producto => (
                            <div key={producto._id} className="prod-card">
                                <div className="prod-card-img">
                                    <img
                                        src={producto.imagenUrl || "/images/no-image.png"}
                                        alt={producto.nombre}
                                    />
                                    {producto.descuento > 0 && (
                                        <span className="badge-descuento">-{producto.descuento}%</span>
                                    )}
                                    {producto.stock < 5 && producto.stock > 0 && (
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
                                        <span className="prod-price">${producto.precio.toLocaleString()}</span>
                                        <span className={`prod-stock-badge ${producto.stock > 0 ? 'in' : 'out'}`}>
                                            {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
                                        </span>
                                    </div>
                                    <Link to={`/products/${producto._id}`} className="btn-ver-detalles">
                                        Ver Detalles
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Products;
