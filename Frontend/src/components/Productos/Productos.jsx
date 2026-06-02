import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import storeAuth from "../../context/storeAuth";

const NO_IMAGE_SRC = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <rect width="640" height="420" fill="#f3f4f6"/>
  <rect x="96" y="88" width="448" height="244" rx="24" fill="#fff7ed" stroke="#f59e0b" stroke-width="3"/>
  <path d="M160 286l92-96 72 68 56-58 100 86H160z" fill="#fdba74"/>
  <circle cx="448" cy="150" r="32" fill="#fed7aa"/>
  <text x="320" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#92400e">Imagen no disponible</text>
</svg>`);

const getProductImageSrc = (producto = {}) => producto.imagenUrl || NO_IMAGE_SRC;
const metrosDisponibles = (producto = {}) => Number(producto.metrosDisponibles ?? producto.stock ?? 0) || 0;
const metrosPorRollo = (producto = {}) => Number(producto.metrosPorRollo || 100) || 100;
const rollosDisponibles = (producto = {}) => Math.floor(metrosDisponibles(producto) / metrosPorRollo(producto));
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
        ? Number(producto.precioPorRollo ?? producto.precio ?? 0)
        : Number(producto.precioPorMetro ?? producto.precio ?? 0);

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .dash-prod-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    .dash-prod-title {
        font-size: 1.4rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.5px;
        margin: 0;
    }
    .dash-prod-count {
        font-size: 0.78rem;
        font-weight: 700;
        background: var(--orange-light);
        color: var(--orange-dark);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
    }
    .dash-prod-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1.25rem;
    }
    @media (min-width: 640px)  { .dash-prod-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .dash-prod-grid { grid-template-columns: repeat(3, 1fr); } }

    /* Skeleton */
    .dash-skeleton {
        background: #fff;
        border-radius: 1rem;
        height: 300px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .dash-skel-img { background: #e5e7eb; height: 180px; animation: shimmer 1.4s ease-in-out infinite; }
    .dash-skel-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .dash-skel-line { background: #e5e7eb; border-radius: 0.4rem; animation: shimmer 1.4s ease-in-out infinite; }
    @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* Tarjeta */
    .dash-card {
        background: #fff;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.07);
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.22s, transform 0.22s;
    }
    .dash-card:hover {
        box-shadow: 0 8px 28px rgba(232,118,10,0.15);
        transform: translateY(-4px);
    }
    .dash-card-img {
        position: relative;
        height: 180px;
        background: #f3f4f6;
        overflow: hidden;
    }
    .dash-card-img img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.3s;
    }
    .dash-card:hover .dash-card-img img { transform: scale(1.06); }
    .dash-badge-off {
        position: absolute; top: 0.6rem; left: 0.6rem;
        background: #ef4444; color: #fff;
        font-size: 0.68rem; font-weight: 800;
        padding: 0.18rem 0.5rem; border-radius: 0.35rem;
    }
    .dash-overlay-agotado {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.38);
        display: flex; align-items: center; justify-content: center;
    }
    .dash-overlay-agotado span {
        background: #ef4444; color: #fff;
        font-weight: 800; font-size: 0.8rem;
        padding: 0.3rem 0.8rem; border-radius: 9999px;
    }
    .dash-card-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
    .dash-card-name {
        font-size: 0.95rem; font-weight: 800; color: #111827;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-bottom: 0.25rem;
    }
    .dash-card-desc {
        font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.75rem;
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
    }
    .dash-card-footer {
        display: flex; align-items: center;
        justify-content: space-between; margin-bottom: 0.875rem;
    }
    .dash-price { font-size: 1.15rem; font-weight: 900; color: var(--orange-dark); }
    .dash-price-compare { display:flex; gap:0.45rem; flex-wrap:wrap; margin:-0.35rem 0 0.75rem; }
    .dash-price-chip { border:1px solid #fde8ce; background:#fff7ed; color:#92400e; border-radius:999px; padding:0.2rem 0.5rem; font-size:0.7rem; font-weight:800; }
    .dash-stock-badge {
        font-size: 0.7rem; font-weight: 700;
        padding: 0.2rem 0.55rem; border-radius: 9999px;
    }
    .dash-stock-badge.in  { background: #d1fae5; color: #065f46; }
    .dash-stock-badge.out { background: #fee2e2; color: #991b1b; }
    .dash-buy-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
        align-items: center;
        margin: 0.25rem 0 0.75rem;
    }
    .dash-meter-input {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.55rem;
        padding: 0.55rem 0.7rem;
        font-size: 0.85rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
    }
    .dash-meter-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
        background: #fff;
    }
    .dash-unit-label {
        font-size: 0.78rem;
        font-weight: 800;
        color: #6b7280;
        white-space: nowrap;
    }
    .dash-unit-select {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.55rem;
        padding: 0.55rem 0.7rem;
        color: #374151;
        background: #fff;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }
    .btn-dash-add {
        width: 100%; padding: 0.65rem 1rem;
        background: var(--orange-main);
        color: #fff; font-weight: 700; font-size: 0.875rem;
        border-radius: 0.625rem; border: none;
        cursor: pointer; margin-top: auto;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.25);
    }
    .btn-dash-add:hover:not(:disabled) { background: var(--orange-dark); transform: translateY(-1px); }
    .btn-dash-add:disabled { opacity: 0.55; cursor: not-allowed; }

    /* Búsqueda */
    .dash-search-wrap {
        position: relative;
        flex: 1;
        max-width: 400px;
    }
    .dash-search-icon {
        position: absolute;
        left: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
    }
    .dash-search-input {
        width: 100%;
        padding: 0.65rem 1rem 0.65rem 2.5rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.625rem;
        font-size: 0.875rem;
        background: #fff;
        color: #374151;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        box-sizing: border-box;
    }
    .dash-search-input:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
    }

    /* Paginación */
    .dash-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.6rem;
        margin-top: 2rem;
    }
    .btn-dash-pag {
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        border: 1.5px solid #e5e7eb;
        background: #fff; color: #374151;
        border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
    }
    .btn-dash-pag:hover:not(:disabled) { border-color: var(--orange-main); color: var(--orange-main); }
    .btn-dash-pag.active { background: var(--orange-main); color: #fff; border-color: var(--orange-main); }
    .btn-dash-pag:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Vacío */
    .dash-empty {
        text-align: center; padding: 5rem 2rem;
        background: #fff; border-radius: 1rem;
        border: 1.5px solid #e5e7eb;
    }
    .dash-empty .icon { font-size: 3.5rem; margin-bottom: 0.75rem; }
    .dash-empty h3 { font-size: 1.15rem; font-weight: 800; color: #374151; margin-bottom: 0.4rem; }
    .dash-empty p  { color: #9ca3af; font-size: 0.875rem; }
`;

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agregando, setAgregando] = useState(null);
    const [cantidades, setCantidades] = useState({});
    const [unidades, setUnidades] = useState({});
    const [busqueda, setBusqueda] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

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
            setDebouncedSearch(busqueda);
            setPagina(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [busqueda]);

    useEffect(() => {
        const fetchProductos = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    pagina,
                    limite,
                    busqueda: debouncedSearch
                });
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?${params.toString()}`);
                const data = await res.json();
                setProductos(data.productos || []);
                setTotalPaginas(data.totalPaginas || 1);
            } catch {
                setProductos([]);
                toast.error("Error al cargar productos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, [pagina, debouncedSearch]);

    const getUnidadProducto = (producto) => unidades[producto._id] || unidadDefault(producto);
    const getCantidadProducto = (producto) => cantidades[producto._id] ?? (getUnidadProducto(producto) === 'rollo' ? 1 : 1);

    const agregarAlCarrito = async (producto) => {
        const productoId = producto?._id;
        const nombreProducto = producto?.nombre;
        const unidadSeleccionada = getUnidadProducto(producto);
        const cantidad = Number(getCantidadProducto(producto));
        if (!token) { toast.info("Inicia sesión para agregar productos."); return; }
        if (!productoId) { toast.error("ID de producto inválido."); return; }
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            toast.error("Ingresa una cantidad valida.");
            return;
        }
        setAgregando(productoId);
        const toastId = toast.loading(`${nombreProducto || 'Producto'} se está agregando al carrito...`);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productoId, cantidad, unidadSeleccionada }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.msg || "Error al agregar al carrito");
            }
            toast.update(toastId, {
                render: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>🛒</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>¡Producto añadido!</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{nombreProducto || 'Artículo'} agregado al carrito</div>
                    </div>
                </div>
                ),
                type: 'success',
                isLoading: false,
                autoClose: 2500,
                icon: false,
            });
        } catch (error) {
            toast.update(toastId, {
                render: error.message,
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setAgregando(null);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div style={{ padding: "1.5rem" }}>
                <div className="dash-prod-header">
                    <h2 className="dash-prod-title">Productos disponibles</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                        <div className="dash-search-wrap">
                            <span className="dash-search-icon">🔍</span>
                            <input
                                type="text"
                                className="dash-search-input"
                                placeholder="Buscar productos..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <span className="dash-prod-count">{productos.length} productos</span>
                    </div>
                </div>

                {loading ? (
                    <div className="dash-prod-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="dash-skeleton">
                                <div className="dash-skel-img" />
                                <div className="dash-skel-body">
                                    <div className="dash-skel-line" style={{ height: "14px", width: "70%" }} />
                                    <div className="dash-skel-line" style={{ height: "34px", marginTop: "8px" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : productos.length === 0 ? (
                    <div className="dash-empty">
                        <div className="icon">📦</div>
                        <h3>Sin productos disponibles</h3>
                        <p>Aún no hay productos registrados en el sistema.</p>
                    </div>
                ) : (
                    <>
                    <div className="dash-prod-grid">
                        {productos.map(producto => (
                            <div key={producto._id} className="dash-card">
                                <div className="dash-card-img">
                                    <img
                                        src={getProductImageSrc(producto)}
                                        alt={producto.nombre}
                                        onError={handleImageError}
                                    />
                                    {producto.descuento > 0 && (
                                        <span className="dash-badge-off">-{producto.descuento}%</span>
                                    )}
                                    {(producto.metrosDisponibles ?? 0) <= 0 && (
                                        <div className="dash-overlay-agotado">
                                            <span>Sin stock</span>
                                        </div>
                                    )}
                                </div>
                                <div className="dash-card-body">
                                    <p className="dash-card-name">{producto.nombre}</p>
                                    <p className="dash-card-desc">{producto.descripcion}</p>
                                    <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: '0.65rem', fontWeight: 700 }}>
                                        Unidad: {producto.unidadVenta || 'metro'}
                                    </div>
                                    <div className="dash-card-footer">
                                        <span className="dash-price">${precioUnidad(producto, getUnidadProducto(producto)).toFixed(2)}</span>
                                        <span className={`dash-stock-badge ${(producto.metrosDisponibles ?? 0) > 0 ? "in" : "out"}`}>
                                            {(() => {
                                                const metros = metrosDisponibles(producto);
                                                const rollos = rollosDisponibles(producto);
                                                return metros > 0 ? `${metros} m / ${rollos} rollos` : 'Agotado';
                                            })()}
                                        </span>
                                    </div>
                                    {opcionesUnidad(producto).length > 1 && (
                                        <>
                                            <div className="dash-price-compare">
                                                <span className="dash-price-chip">Metro: ${precioUnidad(producto, 'metro').toFixed(2)}</span>
                                                <span className="dash-price-chip">Rollo: ${precioUnidad(producto, 'rollo').toFixed(2)}</span>
                                            </div>
                                            <select
                                                className="dash-unit-select"
                                                value={getUnidadProducto(producto)}
                                                onChange={(e) => {
                                                    const unidad = e.target.value;
                                                    setUnidades(prev => ({ ...prev, [producto._id]: unidad }));
                                                    setCantidades(prev => ({ ...prev, [producto._id]: unidad === 'rollo' ? 1 : 1 }));
                                                }}
                                            >
                                                {opcionesUnidad(producto).map(u => (
                                                    <option key={u} value={u}>Comprar por {u === 'rollo' ? 'rollos' : 'metros'}</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                    <div className="dash-buy-row">
                                        <input
                                            type="number"
                                            min={getUnidadProducto(producto) === 'rollo' ? 1 : 0.01}
                                            step={getUnidadProducto(producto) === 'rollo' ? 1 : 0.01}
                                            className="dash-meter-input"
                                            value={getCantidadProducto(producto)}
                                            onChange={(e) => setCantidades(prev => ({ ...prev, [producto._id]: e.target.value }))}
                                        />
                                        <span className="dash-unit-label">
                                            {getUnidadProducto(producto) === 'rollo' ? 'rollos' : 'metros'}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-dash-add"
                                        onClick={() => agregarAlCarrito(producto)}
                                        disabled={agregando === producto._id || (producto.metrosDisponibles ?? 0) <= 0}
                                    >
                                        {(producto.metrosDisponibles ?? 0) <= 0
                                            ? "Sin stock"
                                            : agregando === producto._id
                                                ? "Agregando…"
                                                : "🛒 Agregar al carrito"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="dash-pagination">
                            <button
                                className="btn-dash-pag"
                                onClick={() => cambiarPagina(Math.max(1, pagina - 1))}
                                disabled={pagina === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPaginas)].map((_, i) => (
                                <button
                                    key={i+1}
                                    className={`btn-dash-pag${pagina === i + 1 ? ' active' : ''}`}
                                    onClick={() => cambiarPagina(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="btn-dash-pag"
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

export default Productos;

