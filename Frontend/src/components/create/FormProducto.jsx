import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';

export const FormProducto = ({ productoToUpdate }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [categoriasOptions, setCategoriasOptions] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

    // Cargar categorías
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/categorias`);
                const data = await res.json();
                setCategoriasOptions(Array.isArray(data) ? data : data?.categorias || []);
            } catch (error) {
                console.error('Error cargando categorías:', error);
                toast.error('Error al cargar categorías');
            }
        };
        fetchCategorias();
    }, []);

    // Cargar datos del producto si está en modo actualización
    useEffect(() => {
        if (productoToUpdate) {
            reset({
                nombre: productoToUpdate?.nombre || '',
                descripcion: productoToUpdate?.descripcion || '',
                precio: productoToUpdate?.precio || '',
                stock: productoToUpdate?.stock || '',
                descuento: productoToUpdate?.descuento || 0,
                color: productoToUpdate?.color || '',
                estado: productoToUpdate?.estado || 'activo',
                etiquetas: productoToUpdate?.etiquetas?.join(', ') || ''
            });
            setSelectedCategoria(productoToUpdate?.categoria?._id || productoToUpdate?.categoria || '');
        }
    }, [productoToUpdate, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        if (!selectedCategoria) {
            toast.error('Debes seleccionar una categoría');
            setIsSubmitting(false);
            return;
        }

        // Si es modo actualización y no hay imagen nueva, no es obligatoria
        if (!productoToUpdate && !imagen) {
            toast.error('Debes cargar una imagen para crear un producto');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nombre', data.nombre);
            formData.append('descripcion', data.descripcion);
            formData.append('precio', data.precio);
            formData.append('stock', data.stock);
            formData.append('categoria', selectedCategoria);
            formData.append('descuento', data.descuento || 0);
            formData.append('color', data.color || '');
            formData.append('estado', data.estado);
            
            // Agregar etiquetas como JSON string
            const etiquetas = data.etiquetas ? data.etiquetas.split(',').map(e => e.trim()).filter(e => e) : [];
            formData.append('etiquetas', JSON.stringify(etiquetas));

            if (imagen) {
                formData.append('imagen', imagen);
            }

            let url = `${import.meta.env.VITE_BACKEND_URL}/productos`;
            let method = 'POST';

            if (productoToUpdate?._id) {
                url = `${import.meta.env.VITE_BACKEND_URL}/productos/${productoToUpdate._id}`;
                method = 'PUT';
            }

            // Usar fetch directamente para evitar problemas con fetchDataBackend
            const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.msg || `Error ${res.status}`);
            }

            const response = await res.json();
            toast.success(
                productoToUpdate
                    ? 'Producto actualizado correctamente'
                    : 'Producto creado correctamente'
            );
            setTimeout(() => {
                navigate('/dashboard/productos-admin');
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Ocurrió un error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = 'block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-900 shadow-sm transition-all';
    const labelStyle = 'mb-1 block text-sm font-semibold text-gray-700';
    const errorStyle = 'text-sm text-red-600 mt-1';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <ToastContainer />
            <fieldset className="border border-gray-300 p-5 rounded-lg">
                <legend className="text-lg font-bold text-gray-800 px-2">
                    {productoToUpdate ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </legend>

                {/* Nombre */}
                <div className="mb-5">
                    <label className={labelStyle}>Nombre del Producto *</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                        className={inputStyle}
                    />
                    {errors.nombre && <span className={errorStyle}>{errors.nombre.message}</span>}
                </div>

                {/* Descripción */}
                <div className="mb-5">
                    <label className={labelStyle}>Descripción *</label>
                    <textarea
                        placeholder="Descripción"
                        rows="4"
                        {...register('descripcion', { required: 'La descripción es obligatoria' })}
                        className={inputStyle}
                    />
                    {errors.descripcion && <span className={errorStyle}>{errors.descripcion.message}</span>}
                </div>

                {/* Categoría */}
                <div className="mb-5">
                    <label className={labelStyle}>Categoría *</label>
                    <select
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                        className={inputStyle}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categoriasOptions.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                    {!selectedCategoria && <span className={errorStyle}>La categoría es obligatoria</span>}
                </div>

                {/* Precio y Stock */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className={labelStyle}>Precio *</label>
                        <input
                            type="number"
                            placeholder="Precio"
                            step="0.01"
                            {...register('precio', { required: 'El precio es obligatorio' })}
                            className={inputStyle}
                        />
                        {errors.precio && <span className={errorStyle}>{errors.precio.message}</span>}
                    </div>
                    <div>
                        <label className={labelStyle}>Stock *</label>
                        <input
                            type="number"
                            placeholder="Stock"
                            {...register('stock', { required: 'El stock es obligatorio' })}
                            className={inputStyle}
                        />
                        {errors.stock && <span className={errorStyle}>{errors.stock.message}</span>}
                    </div>
                </div>

                {/* Descuento y Color */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className={labelStyle}>Descuento (%)</label>
                        <input
                            type="number"
                            placeholder="Descuento"
                            {...register('descuento', { min: 0, max: 100 })}
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Color</label>
                        <input
                            type="text"
                            placeholder="Color"
                            {...register('color')}
                            className={inputStyle}
                        />
                    </div>
                </div>

                {/* Estado */}
                <div className="mb-5">
                    <label className={labelStyle}>Estado</label>
                    <select
                        {...register('estado')}
                        className={inputStyle}
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="agotado">Agotado</option>
                    </select>
                </div>

                {/* Etiquetas */}
                <div className="mb-5">
                    <label className={labelStyle}>Etiquetas (separadas por comas)</label>
                    <input
                        type="text"
                        placeholder="ej: oferta, nuevo, promoción"
                        {...register('etiquetas')}
                        className={inputStyle}
                    />
                </div>

                {/* Imagen */}
                <div className="mb-5">
                    <label className={labelStyle}>
                        Imagen {!productoToUpdate && '*'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagen(e.target.files?.[0] || null)}
                        className={inputStyle}
                    />
                    {productoToUpdate?.imagenUrl && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                            <img 
                                src={productoToUpdate.imagenUrl} 
                                alt="Producto"
                                className="w-48 h-48 object-cover rounded-lg"
                            />
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-amber-900 text-white py-2 px-4 rounded-lg hover:bg-amber-800 transition font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : (productoToUpdate ? 'Actualizar' : 'Crear')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/productos-admin')}
                        className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition font-semibold"
                    >
                        Cancelar
                    </button>
                </div>
            </fieldset>
        </form>
    );
};

export default FormProducto;
