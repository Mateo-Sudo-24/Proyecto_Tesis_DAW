import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdAdd, MdClose, MdSearch } from 'react-icons/md';
import FormProducto from '../components/create/FormProducto';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }

    /* ── Page ── */
    .pa-page { max-width: 1100px; margin: 0 auto; }

    /* ── Header ── */
    .pa-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .pa-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0 0 0.2rem;
        display: flex;
        align-items: center;
        gap: 0.55rem;
    }
    .pa-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.4rem;
        background: var(--orange-main);
        border-radius: 2px;
        flex-shrink: 0;
    }
    .pa-sub { font-size: 0.85rem; color: #6b7280; margin: 0; }
    .pa-divider {
        height: 1px;
        background: linear-gradient(90deg, var(--orange-main) 0%, #f3f4f6 60%);
        margin: 0 0 1.5rem;
        border: none;
    }

    /* ── Toolbar ── */
    .pa-toolbar {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        align-items: center;
    }
    .pa-search-wrap {
        flex: 1;
        min-width: 200px;
        position: relative;
    }
    .pa-search-icon {
        position: absolute;
        left: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
    }
    .pa-search {
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
    .pa-search:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
    }
    .pa-search::placeholder { color: #c0c0c0; }

    .btn-pa-add {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.65rem 1.25rem;
        background: var(--orange-main);
        color: #fff;
        font-weight: 800;
        font-size: 0.875rem;
        border-radius: 0.625rem;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s, transform 0.12s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
    }
    .btn-pa-add:hover { background: var(--orange-dark); transform: translateY(-1px); }

    /* ── Spinner ── */
    .pa-spinner-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
    }
    .pa-spinner {
        width: 40px; height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: var(--orange-main);
        border-radius: 50%;
        animation: pa-spin 0.75s linear infinite;
    }
    @keyframes pa-spin { to { transform: rotate(360deg); } }

    /* ── Empty ── */
    .pa-empty {
        background: #fff;
        border-radius: 1rem;
        border: 2px dashed #e5e7eb;
        padding: 3.5rem 2rem;
        text-align: center;
        color: #9ca3af;
    }
    .pa-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .pa-empty p { font-size: 0.9rem; margin: 0; }

    /* ── Grid ── */
    .pa-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 1.25rem;
    }

    /* ── Card ── */
    .pa-card {
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        overflow: hidden;
        border: 1px solid #f3f4f6;
        transition: box-shadow 0.2s, transform 0.2s;
        display: flex;
        flex-direction: column;
    }
    .pa-card:hover {
        box-shadow: 0 6px 24px rgba(232,118,10,0.13);
        transform: translateY(-2px);
    }

    /* ── Card image ── */
    .pa-card-img {
        position: relative;
        height: 170px;
        background: #f9fafb;
        overflow: hidden;
    }
    .pa-card-img img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }
    .pa-card:hover .pa-card-img img { transform: scale(1.04); }
    .pa-card-no-img {
        width: 100%; height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        color: #d1d5db;
    }
    .pa-badge-off {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: #ef4444;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
    }

    /* ── Card body ── */
    .pa-card-body {
        padding: 1rem 1.1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }
    .pa-card-name {
        font-size: 0.95rem;
        font-weight: 800;
        color: #111827;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .pa-card-desc {
        font-size: 0.78rem;
        color: #6b7280;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.45;
        flex: 1;
    }
    .pa-card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.5rem;
    }
    .pa-price {
        font-size: 1.15rem;
        font-weight: 900;
        color: var(--orange-main);
    }
    .pa-stock-badge {
        display: inline-block;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
    }
    .pa-stock-ok  { background: #d1fae5; color: #065f46; }
    .pa-stock-low { background: #fef3c7; color: #92400e; }
    .pa-stock-out { background: #fee2e2; color: #991b1b; }

    .pa-estado-badge {
        display: inline-block;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        margin-top: 0.3rem;
    }
    .pa-estado-activo   { background: #dbeafe; color: #1e40af; }
    .pa-estado-agotado  { background: #fef3c7; color: #92400e; }
    .pa-estado-inactivo { background: #f3f4f6; color: #6b7280; }

    .pa-color-chip {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.15rem;
    }
    .pa-color-chip b { color: #374151; }

    /* ── Card actions ── */
    .pa-card-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.1rem;
        border-top: 1px solid #f3f4f6;
    }
    .btn-pa-edit, .btn-pa-delete {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.55rem;
        border-radius: 0.5rem;
        border: none;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, transform 0.12s;
    }
    .btn-pa-edit {
        background: #eff6ff;
        color: #2563eb;
    }
    .btn-pa-edit:hover { background: #dbeafe; }
    .btn-pa-delete {
        background: #fef2f2;
        color: #dc2626;
    }
    .btn-pa-delete:hover { background: #fee2e2; }

    /* ── Modal overlay ── */
    .pa-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 1rem;
    }
    .pa-modal {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        width: 100%;
        max-width: 640px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: pa-modal-in 0.18s ease;
    }
    @keyframes pa-modal-in {
        from { opacity: 0; transform: scale(0.96) translateY(12px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .pa-modal-header {
        background: #1f2937;
        padding: 1.25rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 1.25rem 1.25rem 0 0;
    }
    .pa-modal-header h2 {
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
    }
    .btn-pa-modal-close {
        background: rgba(255,255,255,0.08);
        border: none;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 0.375rem;
        padding: 0.25rem;
        display: flex;
        transition: background 0.12s, color 0.12s;
    }
    .btn-pa-modal-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

    .pa-modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .pa-modal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    @media (max-width: 500px) { .pa-modal-grid { grid-template-columns: 1fr; } }
    .pa-modal-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .pa-modal-field.full { grid-column: 1 / -1; }
    .pa-modal-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
    }
    .pa-modal-input, .pa-modal-select, .pa-modal-textarea {
        padding: 0.6rem 0.875rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        width: 100%;
        box-sizing: border-box;
    }
    .pa-modal-input:focus, .pa-modal-select:focus, .pa-modal-textarea:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
        background: #fff;
    }
    .pa-modal-textarea { resize: vertical; }
    .pa-modal-warn {
        font-size: 0.72rem;
        color: #d97706;
        margin-top: 0.2rem;
    }

    .pa-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #f3f4f6;
    }
    .btn-pa-cancel {
        padding: 0.6rem 1.25rem;
        border: 1.5px solid #e5e7eb;
        background: #fff;
        color: #374151;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.12s;
    }
    .btn-pa-cancel:hover { background: #f9fafb; }
    .btn-pa-save {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.6rem 1.25rem;
        background: var(--orange-main);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(232,118,10,0.25);
        transition: background 0.15s;
    }
    .btn-pa-save:hover { background: var(--orange-dark); }

    /* ── Paginación ── */
    .pa-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.6rem;
        margin-top: 2.5rem;
    }
    .btn-pa-pag {
        width: 38px; height: 38px;
        display: flex; align-items: center; justify-content: center;
        border: 1.5px solid #e5e7eb;
        background: #fff; color: #374151;
        border-radius: 0.5rem; font-size: 0.875rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
    }
    .btn-pa-pag:hover:not(:disabled) { border-color: var(--orange-main); color: var(--orange-main); }
    .btn-pa-pag.active { background: var(--orange-main); color: #fff; border-color: var(--orange-main); }
    .btn-pa-pag:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const STOCK_CRITICO = 50;

const ProductosAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [productoEditando, setProductoEditando] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNuevoModal, setShowNuevoModal] = useState(false);
    const [confirmEliminarId, setConfirmEliminarId] = useState(null);

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const limite = 8;

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/images/no-image.png";
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
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setProductos(data.productos || []);
                setTotalPaginas(data.totalPaginas || 1);
            } catch {
                toast.error('Error al cargar productos');
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, [pagina, debouncedSearch]);

    const eliminarProducto = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Error al eliminar');
            }
            const data = await res.json();
            toast.success(data.msg || 'Producto eliminado');
            setProductos(prev => prev.filter(p => p._id !== id));
        } catch (e) {
            toast.error(e.message || 'Error al eliminar el producto');
        } finally {
            setConfirmEliminarId(null);
        }
    };

    const abrirEdicion = (producto) => {
        setProductoEditando(producto);
        setShowEditModal(true);
    };

    const cerrarEdicion = () => {
        setProductoEditando(null);
        setShowEditModal(false);
    };

    const stockClass = (stock) => {
        if (stock > STOCK_CRITICO) return 'pa-stock-ok';
        if (stock > 0) return 'pa-stock-low';
        return 'pa-stock-out';
    };

    const estadoClass = (estado) => {
        if (estado === 'activo') return 'pa-estado-activo';
        if (estado === 'agotado') return 'pa-estado-agotado';
        return 'pa-estado-inactivo';
    };

    return (
        <>
            <style>{styles}</style>
            <ConfirmDialog
                open={!!confirmEliminarId}
                title="¿Eliminar producto?"
                message="Esta acción no se puede deshacer. Si el producto tiene órdenes asociadas no podrá eliminarse."
                confirmLabel="Eliminar"
                onConfirm={() => eliminarProducto(confirmEliminarId)}
                onCancel={() => setConfirmEliminarId(null)}
            />

            <div className="pa-page">
                {/* Header */}
                <div className="pa-header">
                    <div>
                        <h1 className="pa-title">Gestión de productos</h1>
                        <p className="pa-sub">
                            {loading ? 'Cargando...' : `Mostrando productos ${productos.length > 0 ? (pagina-1)*limite+1 : 0} - ${(pagina-1)*limite + productos.length}`}
                        </p>
                    </div>
                </div>
                <hr className="pa-divider" />

                {/* Toolbar */}
                <div className="pa-toolbar">
                    <div className="pa-search-wrap">
                        <MdSearch className="pa-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, descripción o color..."
                            className="pa-search"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button className="btn-pa-add" onClick={() => setShowNuevoModal(true)}>
                        <MdAdd size={18} /> Nuevo producto
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="pa-spinner-wrap">
                        <div className="pa-spinner" />
                    </div>
                ) : productos.length === 0 ? (
                    <div className="pa-empty">
                        <div className="pa-empty-icon">📦</div>
                        <p>{busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos registrados.'}</p>
                    </div>
                ) : (
                    <>
                    <div className="pa-grid">
                        {productos.map(producto => (
                            <div key={producto._id} className="pa-card">
                                <div className="pa-card-img">
                                    {producto.imagenUrl
                                        ? <img src={producto.imagenUrl} alt={producto.nombre} onError={handleImageError} />
                                        : <div className="pa-card-no-img">📷</div>
                                    }
                                    {producto.descuento > 0 && (
                                        <span className="pa-badge-off">-{producto.descuento}%</span>
                                    )}
                                </div>
                                <div className="pa-card-body">
                                    <p className="pa-card-name">{producto.nombre}</p>
                                    <p className="pa-card-desc">{producto.descripcion}</p>
                                    <div className="pa-card-meta">
                                        <span className="pa-price">${producto.precio?.toLocaleString()}</span>
                                        <span className={`pa-stock-badge ${stockClass(producto.metrosDisponibles ?? 0)}`}>
                                            {(producto.metrosDisponibles ?? 0)}m / {Math.floor((producto.metrosDisponibles ?? 0) / (producto.metrosPorRollo || 100))} rol.
                                        </span>
                                    </div>
                                    {producto.color && (
                                        <p className="pa-color-chip">Color: <b>{producto.color}</b></p>
                                    )}
                                    <span className={`pa-estado-badge ${estadoClass(producto.estado)}`}>
                                        {producto.estado?.charAt(0).toUpperCase() + producto.estado?.slice(1)}
                                    </span>
                                </div>
                                <div className="pa-card-actions">
                                    <button className="btn-pa-edit" onClick={() => abrirEdicion(producto)}>
                                        <MdEdit size={16} /> Editar
                                    </button>
                                    <button className="btn-pa-delete" onClick={() => setConfirmEliminarId(producto._id)}>
                                        <MdDelete size={16} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="pa-pagination">
                            <button
                                className="btn-pa-pag"
                                onClick={() => cambiarPagina(Math.max(1, pagina - 1))}
                                disabled={pagina === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPaginas)].map((_, i) => (
                                <button
                                    key={i+1}
                                    className={`btn-pa-pag${pagina === i + 1 ? ' active' : ''}`}
                                    onClick={() => cambiarPagina(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="btn-pa-pag"
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

            {/* Modal nuevo producto */}
            {showNuevoModal && (
                <div className="pa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowNuevoModal(false)}>
                    <div className="pa-modal" style={{ maxWidth: '680px' }}>
                        <div className="pa-modal-header">
                            <h2>Nuevo producto</h2>
                            <button className="btn-pa-modal-close" onClick={() => setShowNuevoModal(false)}>
                                <MdClose size={22} />
                            </button>
                        </div>
                        <div className="pa-modal-body">
                            <FormProducto
                                onSuccess={(newProduct) => {
                                    setProductos(prev => [newProduct, ...prev]);
                                    setShowNuevoModal(false);
                                    toast.success('Producto creado correctamente');
                                }}
                                onCancel={() => setShowNuevoModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal edición */}
            {showEditModal && productoEditando && (
                <div className="pa-modal-overlay" onClick={e => e.target === e.currentTarget && cerrarEdicion()}>
                    <div className="pa-modal">
                        <div className="pa-modal-header">
                            <h2>Editar producto</h2>
                            <button className="btn-pa-modal-close" onClick={cerrarEdicion}>
                                <MdClose size={22} />
                            </button>
                        </div>
                        <div className="pa-modal-body">
                            <FormProducto
                                productoToUpdate={productoEditando}
                                onSuccess={(updatedProduct) => {
                                    setProductos(prev => prev.map(p => p._id === productoEditando._id ? updatedProduct : p));
                                    cerrarEdicion();
                                    toast.success('Producto actualizado correctamente');
                                }}
                                onCancel={cerrarEdicion}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductosAdmin;
