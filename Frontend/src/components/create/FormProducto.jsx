import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';

const fpStyles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --orange-border: #f0943a;
    }
    .fp-form { width: 100%; }
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
        display: flex;
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
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [imagenUrl, setImagenUrl] = useState('');
    const [metodoImagen, setMetodoImagen] = useState('archivo');
    const [previewImagen, setPreviewImagen] = useState(null);
    const [categoriasOptions, setCategoriasOptions] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');

    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

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
                descuento: productoToUpdate.descuento || 0,
                color: productoToUpdate.color || '',
                estado: productoToUpdate.estado || 'activo',
                etiquetas: productoToUpdate.etiquetas?.join(', ') || ''
            });
            setSelectedCategoria(productoToUpdate.categoria || '');
            if (productoToUpdate.imagenUrl) setPreviewImagen(productoToUpdate.imagenUrl);
        }
    }, [productoToUpdate, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        if (!selectedCategoria) {
            toast.error('Debes seleccionar una categoría');
            setIsSubmitting(false);
            return;
        }
        if (!productoToUpdate && metodoImagen === 'archivo' && !imagen) {
            toast.error('Debes cargar una imagen o proporcionar URL');
            setIsSubmitting(false);
            return;
        }
        if (!productoToUpdate && metodoImagen === 'url' && !imagenUrl) {
            toast.error('Debes ingresar una URL de imagen');
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
            const etiquetas = data.etiquetas ? data.etiquetas.split(',').map(e => e.trim()).filter(Boolean) : [];
            formData.append('etiquetas', JSON.stringify(etiquetas));
            if (metodoImagen === 'archivo' && imagen) formData.append('imagen', imagen);
            else if (metodoImagen === 'url' && imagenUrl) formData.append('imagenUrl', imagenUrl);

            const isEdit = Boolean(productoToUpdate?._id);
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
            setImagen(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPreviewImagen(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        else navigate('/dashboard/crear');
    };

    return (
        <>
            <style>{fpStyles}</style>
            {!onCancel && <ToastContainer />}
            <form onSubmit={handleSubmit(onSubmit)} className="fp-form" noValidate>
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
                        <label className="fp-label">Precio *</label>
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
                        <label className="fp-label">Stock *</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="fp-input"
                            {...register('stock', { required: 'El stock es obligatorio' })}
                        />
                        {errors.stock && <p className="fp-error">⚠ {errors.stock.message}</p>}
                    </div>
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
                        <div className="fp-img-toggle">
                            <label className="fp-img-option">
                                <input
                                    type="radio"
                                    value="archivo"
                                    checked={metodoImagen === 'archivo'}
                                    onChange={() => { setMetodoImagen('archivo'); setImagenUrl(''); }}
                                />
                                📤 Subir archivo
                            </label>
                            <label className="fp-img-option">
                                <input
                                    type="radio"
                                    value="url"
                                    checked={metodoImagen === 'url'}
                                    onChange={() => { setMetodoImagen('url'); setImagen(null); }}
                                />
                                🔗 URL de imagen
                            </label>
                        </div>
                        {metodoImagen === 'archivo' ? (
                            <>
                                <input type="file" accept="image/*" className="fp-input" onChange={handleArchivoChange} />
                                <p className="fp-img-hint">Máximo 5MB — JPG, PNG, WebP</p>
                            </>
                        ) : (
                            <>
                                <input
                                    type="url"
                                    placeholder="https://res.cloudinary.com/..."
                                    className="fp-input"
                                    value={imagenUrl}
                                    onChange={e => { setImagenUrl(e.target.value); setPreviewImagen(e.target.value); }}
                                />
                                <p className="fp-img-hint">URL completa de la imagen (Cloudinary, etc.)</p>
                            </>
                        )}
                        {previewImagen && (
                            <div className="fp-preview">
                                <img src={previewImagen} alt="Vista previa" onError={() => setPreviewImagen(null)} />
                            </div>
                        )}
                    </div>
                </div>

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
