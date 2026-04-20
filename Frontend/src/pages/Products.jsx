import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter } from "react-icons/fa";

const Products = () => {
    const [allProductos, setAllProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [selectedColor, setSelectedColor] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [colors, setColors] = useState([]);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos`);
                const data = await res.json();
                const productos = data.productos || data;
                setAllProductos(productos);
                
                // Extraer colores únicos
                const uniqueColors = [...new Set(productos.map(p => p.color).filter(Boolean))];
                setColors(uniqueColors);
                
                setFilteredProductos(productos);
            } catch (error) {
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

        // Filtro por búsqueda
        if (searchTerm) {
            result = result.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por precio
        result = result.filter(p => p.precio >= priceRange[0] && p.precio <= priceRange[1]);

        // Filtro por color
        if (selectedColor) {
            result = result.filter(p => p.color === selectedColor);
        }

        // Filtro por estado activo
        result = result.filter(p => p.estado === 'activo');

        setFilteredProductos(result);
    }, [searchTerm, priceRange, selectedColor, allProductos]);

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value);
        setPriceRange([priceRange[0], value]);
    };

    return (
        <>
            <header className="container mx-auto h-40 text-center py-4 md:flex justify-between items-center px-4 md:h-15">
                <h1 className='font-bold text-2xl my-2 text-orange-300'>IN<span className='text-stone-900'>TEX</span></h1>
                <ul className='flex gap-5 justify-center my-4 flex-wrap'>
                    <li><Link to="/home" className='font-bold hover:text-orange-300 hover:underline'>Inicio</Link></li>
                    <li><Link to="/nosotros" className='font-bold hover:text-orange-300 hover:underline'>Nosotros</Link></li>
                    <li><Link to="/products" className='font-bold hover:text-orange-300 hover:underline'>Productos</Link></li>
                    <li><Link to="/contacto" className='font-bold hover:text-orange-300 hover:underline'>Contacto</Link></li>
                </ul>
                <ul className='flex justify-center items-center gap-5 my-4'>
                </ul>
            </header>

            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row md:justify-between items-center mb-8">
                    <h1 className="font-black text-4xl text-gray-500 mb-4 md:mb-0">Catálogo de Productos</h1>
                    <div className="flex gap-4">
                        <Link to="/register" className="bg-orange-300 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-400 transition">Registrar</Link>
                        <Link to="/login" className="bg-gray-800 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-900 transition">Iniciar sesión</Link>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                    >
                        <FaFilter /> Filtros
                    </button>
                </div>

                {/* Panel de filtros */}
                {showFilters && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Filtro de precio */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Rango de Precio</label>
                            <div className="flex gap-2 items-center">
                                <span className="text-sm text-gray-600">${priceRange[0]}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange[1]}
                                    onChange={handlePriceChange}
                                    className="w-full"
                                />
                                <span className="text-sm text-gray-600">${priceRange[1]}</span>
                            </div>
                        </div>

                        {/* Filtro de color */}
                        {colors.length > 0 && (
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Color</label>
                                <select
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                >
                                    <option value="">Todos los colores</option>
                                    {colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Botón de limpiar filtros */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setPriceRange([0, 10000]);
                                    setSelectedColor("");
                                }}
                                className="w-full bg-orange-300 text-white px-4 py-2 rounded-lg hover:bg-orange-400 transition font-bold"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                    Mostrando {filteredProductos.length} producto(s)
                </div>
                <hr className="my-4 border-t-2 border-gray-300" />

                {loading ? (
                    <p className="text-center text-gray-400 py-10">Cargando productos...</p>
                ) : filteredProductos.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No hay productos que coincidan con tus filtros.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {filteredProductos.map(producto => (
                            <div key={producto._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:scale-105">
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={producto.imagenUrl || "/images/no-image.png"}
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                    {producto.descuento > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                                            -{producto.descuento}%
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{producto.nombre}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
                                    
                                    {producto.color && (
                                        <p className="text-xs text-gray-500 mb-2">Color: {producto.color}</p>
                                    )}
                                    
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xl font-bold text-orange-300">${producto.precio.toLocaleString()}</span>
                                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                            Stock: {producto.stock}
                                        </span>
                                    </div>
                                    
                                    <Link 
                                        to={`/products/${producto._id}`}
                                        className="w-full bg-orange-300 text-white px-3 py-2 rounded-lg hover:bg-orange-400 transition font-bold text-center block"
                                    >
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