import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { MdEdit, MdDelete, MdAdd, MdSave, MdClose } from 'react-icons/md';

const ProductosAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [formularioEdicion, setFormularioEdicion] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
    const STOCK_CRITICO = 5; // Coincide con el backend

    // Cargar productos
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos`);
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setProductos(Array.isArray(data) ? data : data?.productos || []);
            } catch (error) {
                console.error('Error al cargar productos:', error);
                toast.error('Error al cargar productos');
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    // Eliminar producto
    const eliminarProducto = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error(`Error ${res.status}`);
            
            const data = await res.json();
            toast.success(data.msg || 'Producto eliminado exitosamente');
            setProductos(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    // Abrir modal de edición
    const abrirEdicion = (producto) => {
        setEditandoId(producto._id);
        setFormularioEdicion({ ...producto });
        setShowEditModal(true);
    };

    // Cerrar modal de edición
    const cerrarEdicion = () => {
        setEditandoId(null);
        setFormularioEdicion({});
        setShowEditModal(false);
    };

    // Actualizar producto
    const actualizarProducto = async (id) => {
        try {
            const datosActualizar = {
                nombre: formularioEdicion.nombre,
                descripcion: formularioEdicion.descripcion,
                precio: parseFloat(formularioEdicion.precio),
                stock: parseInt(formularioEdicion.stock),
                descuento: parseFloat(formularioEdicion.descuento || 0),
                estado: formularioEdicion.estado,
                color: formularioEdicion.color || ''
            };

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizar)
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.msg || 'Error al actualizar');
            }
            
            const data = await res.json();
            setProductos(prev => prev.map(p => p._id === id ? data.producto : p));
            toast.success('Producto actualizado exitosamente');
            
            if (data.stockCritico) {
                toast.warning(`⚠️ Stock crítico: ${data.producto.stock} unidades (umbral: ${data.umbralStockCritico})`);
            }
            
            cerrarEdicion();
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error(error.message || 'Error al actualizar el producto');
        }
    };

    // Manejar cambio en formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormularioEdicion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filtrar productos por búsqueda
    const productosFiltrados = productos.filter(prod =>
        prod.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <span className="text-4xl">⏳</span>
                    </div>
                    <p className="text-lg text-amber-900 font-semibold">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-8 bg-gradient-to-br from-orange-50 to-amber-50">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-amber-900 mb-2">📦 Gestionar Productos</h1>
                        <p className="text-gray-600">
                            Total de productos: <span className="font-bold text-amber-900">{productosFiltrados.length}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/crear')}
                        className="bg-gradient-to-r from-amber-900 to-amber-800 text-white px-8 py-4 rounded-lg hover:shadow-lg transition font-bold flex items-center gap-2 shadow-md hover:from-amber-800 hover:to-amber-700"
                    >
                        <MdAdd size={24} /> Nuevo Producto
                    </button>
                </div>

                {/* Búsqueda */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre o descripción..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full px-6 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white shadow-sm transition text-gray-700"
                    />
                </div>

                {/* Grid de Productos */}
                {productosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-lg p-16 text-center shadow-md border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-xl font-semibold">No hay productos para mostrar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productosFiltrados.map(producto => (
                            <div 
                                key={producto._id} 
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 border-amber-900 hover:translate-y-[-4px]"
                            >
                                {/* Imagen */}
                                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 overflow-hidden">
                                    {producto.imagenUrl ? (
                                        <img
                                            src={producto.imagenUrl}
                                            alt={producto.nombre}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-6xl opacity-50">📦</span>
                                        </div>
                                    )}
                                    {producto.descuento > 0 && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                            -{producto.descuento}%
                                        </div>
                                    )}
                                </div>

                                {/* Contenido */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-amber-900 mb-2 line-clamp-2 hover:text-amber-800 transition">
                                        {producto.nombre}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {producto.descripcion}
                                    </p>

                                    {/* Precio y Stock */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-3xl font-black text-amber-900">
                                            ${producto.precio.toLocaleString()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                            producto.stock > STOCK_CRITICO
                                                ? 'bg-green-100 text-green-800'
                                                : producto.stock > 0
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            📊 {producto.stock} un.
                                        </span>
                                    </div>

                                    {/* Color */}
                                    {producto.color && (
                                        <p className="text-sm text-gray-600 mb-4">
                                            🎨 <span className="font-semibold text-gray-800">{producto.color}</span>
                                        </p>
                                    )}

                                    {/* Estado */}
                                    <div className="mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            producto.estado === 'activo'
                                                ? 'bg-blue-100 text-blue-800'
                                                : producto.estado === 'agotado'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1)}
                                        </span>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 border-t pt-4">
                                        <button
                                            onClick={() => abrirEdicion(producto)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm shadow-sm"
                                        >
                                            <MdEdit size={18} /> Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarProducto(producto._id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm shadow-sm"
                                        >
                                            <MdDelete size={18} /> Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b-2 border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <h2 className="text-2xl font-bold text-amber-900">✏️ Editar Producto</h2>
                        <button
                            onClick={cerrarEdicion}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <MdClose size={28} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formularioEdicion.nombre || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Precio
                                </label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formularioEdicion.precio || ''}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formularioEdicion.stock || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                />
                                {formularioEdicion.stock <= STOCK_CRITICO && (
                                    <p className="text-yellow-600 text-xs font-semibold mt-1">
                                        ⚠️ Stock crítico (umbral: {STOCK_CRITICO})
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="estado"
                                    value={formularioEdicion.estado || 'activo'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="agotado">Agotado</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Descuento (%)
                                </label>
                                <input
                                    type="number"
                                    name="descuento"
                                    value={formularioEdicion.descuento || 0}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-amber-900 mb-2">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formularioEdicion.color || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-amber-900 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formularioEdicion.descripcion || ''}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t-2 border-amber-100 bg-gray-50">
                        <button
                            onClick={cerrarEdicion}
                            className="px-6 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => actualizarProducto(editandoId)}
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2"
                        >
                            <MdSave size={20} /> Guardar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default ProductosAdmin;
