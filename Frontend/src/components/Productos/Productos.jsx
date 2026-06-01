import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import storeAuth from "../../context/storeAuth";

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
    .dash-stock-badge {
        font-size: 0.7rem; font-weight: 700;
        padding: 0.2rem 0.55rem; border-radius: 9999px;
    }
    .dash-stock-badge.in  { background: #d1fae5; color: #065f46; }
    .dash-stock-badge.out { background: #fee2e2; color: #991b1b; }
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
    const token = storeAuth(state => state.token);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?limite=12`);
                const data = await res.json();
                setProductos(data.productos || data);
            } catch {
                setProductos([]);
                toast.error("Error al cargar productos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    const agregarAlCarrito = async (productoId, nombreProducto, unidadVenta) => {
        if (!token) { toast.info("Inicia sesión para agregar productos."); return; }
        if (!productoId) { toast.error("ID de producto inválido."); return; }
        setAgregando(productoId);
        const toastId = toast.loading(`${nombreProducto || 'Producto'} se está agregando al carrito...`);
        const unidadSeleccionada = unidadVenta === 'rollo' ? 'rollo' : 'metro';
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/carrito/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productoId, cantidad: 1, unidadSeleccionada }),
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
                    <span className="dash-prod-count">{productos.length} productos</span>
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
                    <div className="dash-prod-grid">
                        {productos.map(producto => (
                            <div key={producto._id} className="dash-card">
                                <div className="dash-card-img">
                                    <img
                                        src={producto.imagenUrl || "/images/no-image.png"}
                                        alt={producto.nombre}
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
                                        <span className="dash-price">${producto.precio}</span>
                                        <span className={`dash-stock-badge ${(producto.metrosDisponibles ?? 0) > 0 ? "in" : "out"}`}>
                                            {(() => {
                                                const metros = producto.metrosDisponibles ?? 0;
                                                const rollos = Math.floor(metros / (producto.metrosPorRollo || 100));
                                                return metros > 0 ? `${metros} m / ${rollos} rollos` : 'Agotado';
                                            })()}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-dash-add"
                                        onClick={() => agregarAlCarrito(producto._id, producto.nombre, producto.unidadVenta)}
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
                )}
            </div>
        </>
    );
};

export default Productos;

