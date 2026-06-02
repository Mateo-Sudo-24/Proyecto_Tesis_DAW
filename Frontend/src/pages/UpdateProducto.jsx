import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FormProducto from "../components/create/FormProducto";

const updateProductStyles = `
    .upp-page { min-height: 100%; padding: 1.5rem; background: #f9fafb; }
    .upp-header { margin-bottom: 1.25rem; }
    .upp-kicker { margin: 0 0 0.35rem; color: #e8760a; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
    .upp-title { margin: 0; color: #111827; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.02em; }
    .upp-subtitle { margin: 0.45rem 0 0; color: #6b7280; font-size: 0.95rem; line-height: 1.5; }
    .upp-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 10px 30px rgba(17,24,39,0.06); padding: 1.25rem; }
    .upp-loading { min-height: 65vh; display: grid; place-items: center; background: #f9fafb; padding: 1.5rem; color: #6b7280; text-align: center; font-weight: 800; }
    .upp-loading-box { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 10px 30px rgba(17,24,39,0.06); padding: 2rem; width: min(100%, 360px); }
    .upp-spinner { width: 42px; height: 42px; border: 4px solid #fed7aa; border-top-color: #e8760a; border-radius: 999px; animation: upp-spin 0.8s linear infinite; margin: 0 auto 0.85rem; }
    @keyframes upp-spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) {
        .upp-page { padding: 1rem; }
        .upp-title { font-size: 1.45rem; }
        .upp-panel { padding: 0.9rem; }
    }
`;

const UpdateProducto = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;

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
                console.error("Error al cargar el producto:", error);
                toast.error("No se pudo cargar el producto");
            }
        };

        if (token && id) fetchProducto();
    }, [id, token]);

    if (!producto) {
        return (
            <>
                <style>{updateProductStyles}</style>
                <div className="upp-loading">
                    <div className="upp-loading-box">
                        <div className="upp-spinner" />
                        <p>Cargando producto...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{updateProductStyles}</style>
            <div className="upp-page">
                <div className="upp-header">
                    <p className="upp-kicker">Inventario</p>
                    <h1 className="upp-title">Actualizar producto</h1>
                    <p className="upp-subtitle">Edita los datos comerciales, stock e imagen del producto seleccionado.</p>
                </div>
                <div className="upp-panel">
                    <FormProducto productoToUpdate={producto} />
                </div>
            </div>
        </>
    );
};

export default UpdateProducto;
