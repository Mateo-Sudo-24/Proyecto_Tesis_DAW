import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Products = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos?limite=6`);
                const data = await res.json();
                setProductos(data.productos || data);
            } catch (error) {
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    return (
        <>
            <header className="container mx-auto h-40 text-center py-4 md:flex justify-between items-center px-4 md:h-15">
                <h1 className='font-bold text-2xl my-2 text-orange-300'>IN<span className='text-stone-900'>TEX</span></h1>
                <ul className='flex gap-5 justify-center my-4 flex-wrap'>
                    <li><Link to="/" className='font-bold hover:text-orange-300 hover:underline'>Inicio</Link></li>
                    <li><Link to="/nosotros" className='font-bold hover:text-orange-300 hover:underline'>Nosotros</Link></li>
                    <li><Link to="/products" className='font-bold hover:text-orange-300 hover:underline'>Productos</Link></li>
                    <li><Link to="/contacto" className='font-bold hover:text-orange-300 hover:underline'>Contacto</Link></li>
                </ul>
                <ul className='flex justify-center items-center gap-5 my-4'>
                </ul>
            </header>

            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row md:justify-between items-center mb-8">
                    <h1 className="font-black text-4xl text-gray-500 mb-4 md:mb-0">Productos</h1>
                    <div className="flex gap-4">
                        <Link to="/register" className="bg-orange-300 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-400 transition">Registrar</Link>
                        <Link to="/login" className="bg-gray-800 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-900 transition">Iniciar sesión</Link>
                    </div>
                </div>
                <hr className="my-4 border-t-2 border-gray-300" />

                {loading ? (
                    <p className="text-center text-gray-400">Cargando productos...</p>
                ) : productos.length === 0 ? (
                    <p className="text-center text-gray-400">No hay productos disponibles.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
                        {productos.map(producto => (
                            <div key={producto._id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
                                <img
                                    src={producto.imagenUrl || "/images/no-image.png"}
                                    alt={producto.nombre}
                                    className="w-full h-48 object-cover rounded mb-4"
                                />
                                <h3 className="font-bold text-lg mb-2 text-orange-300">{producto.nombre}</h3>
                                <p className="text-gray-700 mb-2">{producto.descripcion}</p>
                                <span className="font-semibold text-gray-900 mb-2">Precio: ${producto.precio}</span>
                                <span className="text-sm text-gray-500 mb-2">Stock: {producto.stock}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Products;