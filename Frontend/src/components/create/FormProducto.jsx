import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { editCloudinaryImage, getPreviewUrl, revokePreviewUrl, checkDuplicateProductName } from '../../services/cloudinary';

const fpStyles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --orange-border: #f0943a;
    }
    .fp-form { width: 100%; min-height: 60vh; display: flex; flex-direction: column; }
    .fp-form-body { flex: 1; overflow-y: auto; }
    .fp-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    @media (max-width: 480px) { .fp-grid-2 { grid-template-columns: 1fr; } }
    .fp-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
    .fp-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
    }
    .fp-input, .fp-select, .fp-textarea {
        padding: 0.6rem 0.875rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
        background: #f9fafb;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        width: 100%;
        box-sizing: border-box;
    }
    .fp-input:focus, .fp-select:focus, .fp-textarea:focus {
        border-color: var(--orange-main);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
        background: #fff;
    }
    .fp-input::placeholder { color: #c0c0c0; }
    .fp-textarea { resize: vertical; }
    .fp-error { font-size: 0.72rem; color: #ef4444; margin-top: 0.15rem; }
    .fp-divider { height: 1px; background: #f3f4f6; margin: 1rem 0; }
    .fp-img-section {
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
    }
    .fp-img-toggle {
        display: none;
        gap: 1.25rem;
        margin-bottom: 0.75rem;
    }
    .fp-img-option {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.82rem;
        color: #374151;
        cursor: pointer;
        font-weight: 600;
    }
    .fp-img-option input[type=radio] { accent-color: var(--orange-main); }
    .fp-preview {
        margin-top: 0.75rem;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        background: #fff;
    }
    .fp-preview img {
        width: 100%;
        max-height: 160px;
        object-fit: cover;
        display: block;
    }
    .fp-img-hint { font-size: 0.72rem; color: #9ca3af; margin-top: 0.3rem; }
    .fp-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid #f3f4f6;
        margin-top: 0.5rem;
    }
    .btn-fp-submit {
        flex: 1;
        padding: 0.7rem 1rem;
        background: var(--orange-main);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.15s, transform 0.12s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.25);
    }
    .btn-fp-submit:hover { background: var(--orange-dark); transform: translateY(-1px); }
    .btn-fp-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-fp-cancel {
        flex: 1;
        padding: 0.7rem 1rem;
        border: 1.5px solid #e5e7eb;
        background: #fff;
        color: #374151;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.12s;
    }
    .btn-fp-cancel:hover { background: #f9fafb; }
`;

const defaultCategorias = [
    { _id: '1', nombre: 'Telas Premium' },
    { _id: '2', nombre: 'Telas Básicas' },
    { _id: '3', nombre: 'Accesorios' },
    { _id: '4', nombre: 'Especiales' }
];

export const FormProducto = ({ productoToUpdate, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [previewImagen, setPreviewImagen] = useState(null);
    const [categoriasOptions, setCategoriasOptions] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const fileInputRef = useRef(null);
    const previewBlobRef = useRef(null);

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

    // Revoke blob preview on unmount
    useEffect(() => {
        return () => { if (previewBlobRef.current) revokePreviewUrl(previewBlobRef.current); };
    }, []);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/categorias`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                const cats = Array.isArray(data) ? data : data?.categorias || data?.data || defaultCategorias;
                setCategoriasOptions(cats);
            } catch {
                setCategoriasOptions(defaultCategorias);
            }
        };
        fetchCategorias();
    }, [token]);

    useEffect(() => {
        if (productoToUpdate) {
            reset({
                nombre: productoToUpdate.nombre || '',
                descripcion: productoToUpdate.descripcion || '',
                precio: productoToUpdate.precio || '',
                stock: productoToUpdate.stock || '',
                metrosDisponibles: productoToUpdate.metrosDisponibles ?? '',
                metrosPorRollo: productoToUpdate.metrosPorRollo ?? 100,
                precioPorMetro: productoToUpdate.precioPorMetro ?? '',
                precioPorRollo: productoToUpdate.precioPorRollo ?? '',
                unidadVenta: productoToUpdate.unidadVenta || 'metro',
                descuento: productoToUpdate.descuento || 0,
                color: productoToUpdate.color || '',
                estado: productoToUpdate.estado || 'activo',
                etiquetas: productoToUpdate.etiquetas?.join(', ') || ''
            });
            setSelectedCategoria(productoToUpdate.categoria || '');
            if (productoToUpdate.imagenUrl) {
                setPreviewImagen(productoToUpdate.imagenUrl);
            }
        }
    }, [productoToUpdate, reset]);

    const metrosPorRolloActual = Number(watch('metrosPorRollo') || 100) || 100;

    const syncStockToMetros = (value) => {
        const rollos = Number(value);
        if (!Number.isFinite(rollos) || rollos < 0) return;
        setValue('metrosDisponibles', Number((rollos * metrosPorRolloActual).toFixed(2)), { shouldDirty: true, shouldValidate: true });
    };

    const syncMetrosToStock = (value) => {
        const metros = Number(value);
        if (!Number.isFinite(metros) || metros < 0 || metrosPorRolloActual <= 0) return;
        setValue('stock', Number((metros / metrosPorRolloActual).toFixed(2)), { shouldDirty: true, shouldValidate: true });
    };

    const syncMetrosPorRollo = (value) => {
        const metrosPorRollo = Number(value) || 100;
        const stock = Number(watch('stock'));
        const metros = Number(watch('metrosDisponibles'));
        if (Number.isFinite(stock) && stock >= 0) {
            setValue('metrosDisponibles', Number((stock * metrosPorRollo).toFixed(2)), { shouldDirty: true, shouldValidate: true });
        } else if (Number.isFinite(metros) && metros >= 0) {
            setValue('stock', Number((metros / metrosPorRollo).toFixed(2)), { shouldDirty: true, shouldValidate: true });
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        if (!selectedCategoria) {
            toast.error('Debes seleccionar una categoría');
            setIsSubmitting(false);
            return;
        }
        if (!productoToUpdate && !imagen) {
            toast.error('Debes seleccionar una imagen');
            setIsSubmitting(false);
            return;
        }
        try {
            const isEdit = Boolean(productoToUpdate?._id);

            // Verificar duplicado por nombre (solo al crear)
            if (!isEdit) {
                const isDuplicate = await checkDuplicateProductName(data.nombre, token);
                if (isDuplicate) {
                    toast.error('Ya existe un producto con ese nombre');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Subir imagen a Cloudinary si se seleccionó archivo
            let finalImagenUrl = productoToUpdate?.imagenUrl || '';
            let finalImagenId = productoToUpdate?.imagenID || '';
            if (imagen) {
                toast.info('Subiendo imagen...');
                const { url: cloudUrl, publicId } = await editCloudinaryImage({ file: imagen });
                finalImagenUrl = cloudUrl;
                finalImagenId = publicId;
            }

            const formData = new FormData();
            formData.append('nombre', data.nombre);
            formData.append('descripcion', data.descripcion);
            formData.append('precio', data.precio);
            formData.append('stock', data.stock);
            if (data.metrosDisponibles !== '') formData.append('metrosDisponibles', data.metrosDisponibles);
            if (data.metrosPorRollo)           formData.append('metrosPorRollo', data.metrosPorRollo);
            if (data.precioPorMetro !== '')     formData.append('precioPorMetro', data.precioPorMetro);
            if (data.precioPorRollo !== '')     formData.append('precioPorRollo', data.precioPorRollo);
            formData.append('unidadVenta', data.unidadVenta || 'metro');
            formData.append('categoria', selectedCategoria);
            formData.append('descuento', data.descuento || 0);
            formData.append('color', data.color || '');
            formData.append('estado', data.estado);
            const etiquetas = data.etiquetas ? data.etiquetas.split(',').map(e => e.trim()).filter(Boolean) : [];
            formData.append('etiquetas', JSON.stringify(etiquetas));
            if (finalImagenUrl) formData.append('imagenUrl', finalImagenUrl);
            if (finalImagenId) formData.append('imagenID', finalImagenId);

            const url = isEdit
                ? `${import.meta.env.VITE_BACKEND_URL}/productos/${productoToUpdate._id}`
                : `${import.meta.env.VITE_BACKEND_URL}/productos`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.msg || `Error ${res.status}`);
            }
            const response = await res.json();
            if (onSuccess) {
                onSuccess(response.producto || response);
            } else {
                toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
                setTimeout(() => navigate('/dashboard/productos-admin'), 1500);
            }
        } catch (error) {
            toast.error(error.message || 'Error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchivoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Revoke old blob URL if any
            if (previewBlobRef.current) revokePreviewUrl(previewBlobRef.current);
            setImagen(file);
            const blobUrl = getPreviewUrl(file);
            previewBlobRef.current = blobUrl;
            setPreviewImagen(blobUrl);
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        else navigate('/dashboard/crear');
    };

    return (
        <>
            <style>{fpStyles}</style>
            {!onCancel && <div />}
            <form onSubmit={handleSubmit(onSubmit)} className="fp-form" noValidate>
            <div className="fp-form-body">
                {/* Nombre */}
                <div className="fp-field">
                    <label className="fp-label">Nombre del producto *</label>
                    <input
                        type="text"
                        placeholder="Ej: Tela Oxford Premium"
                        className="fp-input"
                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                    />
                    {errors.nombre && <p className="fp-error">⚠ {errors.nombre.message}</p>}
                </div>

                {/* Descripción */}
                <div className="fp-field">
                    <label className="fp-label">Descripción *</label>
                    <textarea
                        placeholder="Descripción del producto..."
                        rows={3}
                        className="fp-textarea"
                        {...register('descripcion', { required: 'La descripción es obligatoria' })}
                    />
                    {errors.descripcion && <p className="fp-error">⚠ {errors.descripcion.message}</p>}
                </div>

                {/* Categoría */}
                <div className="fp-field">
                    <label className="fp-label">Categoría *</label>
                    <select
                        className="fp-select"
                        value={selectedCategoria}
                        onChange={e => setSelectedCategoria(e.target.value)}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categoriasOptions.map(cat => (
                            <option key={cat._id} value={cat.nombre}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="fp-divider" />

                {/* Precio y Stock */}
                <div className="fp-grid-2">
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Precio referencial *</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            className="fp-input"
                            {...register('precio', { required: 'El precio es obligatorio' })}
                        />
                        {errors.precio && <p className="fp-error">⚠ {errors.precio.message}</p>}
                    </div>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Stock (rollos/unidades)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="fp-input"
                            {...register('stock', {
                                onChange: (e) => syncStockToMetros(e.target.value)
                            })}
                        />
                    </div>
                </div>

                {/* Stock en metros */}
                <div className="fp-grid-2" style={{ marginTop: '1rem' }}>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Metros disponibles</label>
                        <input
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                            className="fp-input"
                            {...register('metrosDisponibles', {
                                min: 0,
                                onChange: (e) => syncMetrosToStock(e.target.value)
                            })}
                        />
                        {errors.metrosDisponibles && <p className="fp-error">⚠ {errors.metrosDisponibles.message}</p>}
                    </div>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Metros por rollo</label>
                        <input
                            type="number"
                            placeholder="100"
                            step="1"
                            min="1"
                            className="fp-input"
                            {...register('metrosPorRollo', {
                                min: 1,
                                onChange: (e) => syncMetrosPorRollo(e.target.value)
                            })}
                        />
                    </div>
                </div>

                {/* Precio por metro y por rollo */}
                <div className="fp-grid-2" style={{ marginTop: '1rem' }}>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Precio por metro ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="fp-input"
                            {...register('precioPorMetro', { min: 0 })}
                        />
                    </div>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Precio por rollo ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="fp-input"
                            {...register('precioPorRollo', { min: 0 })}
                        />
                    </div>
                </div>

                {/* Unidad de venta */}
                <div className="fp-field" style={{ marginTop: '1rem' }}>
                    <label className="fp-label">Unidad de venta</label>
                    <select className="fp-select" {...register('unidadVenta')}>
                        <option value="metro">Metro</option>
                        <option value="rollo">Rollo</option>
                        <option value="ambos">Ambos (metro y rollo)</option>
                    </select>
                </div>

                {/* Descuento y Color */}
                <div className="fp-grid-2" style={{ marginTop: '1rem' }}>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Descuento (%)</label>
                        <input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            className="fp-input"
                            {...register('descuento', { min: 0, max: 100 })}
                        />
                    </div>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Color</label>
                        <input
                            type="text"
                            placeholder="Ej: Azul marino"
                            className="fp-input"
                            {...register('color')}
                        />
                    </div>
                </div>

                <div className="fp-divider" />

                {/* Estado y Etiquetas */}
                <div className="fp-grid-2">
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Estado</label>
                        <select className="fp-select" {...register('estado')}>
                            <option value="activo">Activo</option>
                            <option value="agotado">Agotado</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div className="fp-field" style={{ marginBottom: 0 }}>
                        <label className="fp-label">Etiquetas</label>
                        <input
                            type="text"
                            placeholder="oferta, nuevo, ..."
                            className="fp-input"
                            {...register('etiquetas')}
                        />
                    </div>
                </div>

                <div className="fp-divider" />

                {/* Imagen */}
                <div className="fp-field">
                    <label className="fp-label">Imagen {!productoToUpdate && '*'}</label>
                    <div className="fp-img-section">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="fp-input"
                            onChange={handleArchivoChange}
                            style={{ paddingTop: '0.45rem' }}
                        />
                        <p className="fp-img-hint">📤 Se subirá a Cloudinary al guardar. Formatos: JPG, PNG, WebP.</p>

                        {previewImagen && (
                            <div className="fp-preview">
                                <img src={previewImagen} alt="Vista previa" onError={() => setPreviewImagen(null)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>{/* fp-form-body */}

                {/* Acciones */}
                <div className="fp-actions">
                    <button type="button" className="btn-fp-cancel" onClick={handleCancel}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-fp-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : (productoToUpdate ? 'Actualizar producto' : 'Crear producto')}
                    </button>
                </div>
            </form>
        </>
    );
};

export default FormProducto;
