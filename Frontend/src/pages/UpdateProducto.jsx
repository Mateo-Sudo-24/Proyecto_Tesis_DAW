import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormProducto from '../components/create/FormProducto';

const UpdateProducto = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const token = JSON.parse(localStorage.getItem('auth-token'))?.state?.token;

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/editar/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                setProducto(data);
            } catch (error) {
                console.error('Error al cargar el producto:', error);
                toast.error('No se pudo cargar el producto');
            }
        };

        if (token && id) {
            fetchProducto();
        }
    }, [id, token]);

    if (!producto) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Cargando producto...</p>
            </div>
        );
    }

    return <FormProducto productoToUpdate={producto} />;
};

export default UpdateProducto;
