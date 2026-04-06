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
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-amber-900">Gestionar Productos</h1>
                <button
                    onClick={() => navigate('/dashboard/crear')}
                    className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition font-semibold flex items-center gap-2"
                >
                    <MdAdd size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar producto por nombre o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                />
            </div>

            {/* Tabla de productos */}
            {productosFiltrados.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600 text-lg">No hay productos disponibles</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead className="bg-amber-900 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {productosFiltrados.map(producto => (
                                <tr key={producto._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {producto.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                        {producto.descripcion}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-semibold">
                                        ${producto.precio}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            producto.stock > STOCK_CRITICO
                                                ? 'bg-green-100 text-green-800'
                                                : producto.stock > 0
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {producto.stock} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            producto.estado === 'activo'
                                                ? 'bg-blue-100 text-blue-800'
                                                : producto.estado === 'agotado'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {producto.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => abrirEdicion(producto)}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                title="Editar"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => eliminarProducto(producto._id)}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                title="Eliminar"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-amber-900">Editar Producto</h2>
                            <button
                                onClick={cerrarEdicion}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <MdClose size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formularioEdicion.nombre || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Precio
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formularioEdicion.precio || ''}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formularioEdicion.stock || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    />
                                    {formularioEdicion.stock <= STOCK_CRITICO && (
                                        <p className="text-yellow-600 text-sm mt-1">
                                            ⚠️ Stock crítico (umbral: {STOCK_CRITICO})
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        name="estado"
                                        value={formularioEdicion.estado || 'activo'}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="agotado">Agotado</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descuento (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="descuento"
                                        value={formularioEdicion.descuento || 0}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formularioEdicion.color || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formularioEdicion.descripcion || ''}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-900"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                onClick={cerrarEdicion}
                                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => actualizarProducto(editandoId)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                            >
                                <MdSave size={20} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductosAdmin;
