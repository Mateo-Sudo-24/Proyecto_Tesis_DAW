import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

const ProductosAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const navigate = useNavigate();

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

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
                                            producto.stock > 0
                                                ? 'bg-green-100 text-green-800'
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
                                                onClick={() => navigate(`/dashboard/actualizar-producto/${producto._id}`)}
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
        </div>
    );
};

export default ProductosAdmin;
