import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import FormVendedor from "../components/create/FormVendedor";
import FormCliente from "../components/create/FormCliente";

const updateStyles = `
    .upd-page { min-height: 100%; padding: 1.5rem; background: #f9fafb; }
    .upd-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
    .upd-kicker { margin: 0 0 0.35rem; color: #e8760a; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
    .upd-title { margin: 0; color: #111827; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.02em; }
    .upd-subtitle { margin: 0.45rem 0 0; color: #6b7280; font-size: 0.95rem; line-height: 1.5; }
    .upd-badge { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 999px; padding: 0.4rem 0.85rem; font-size: 0.78rem; font-weight: 900; white-space: nowrap; }
    .upd-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 10px 30px rgba(17,24,39,0.06); padding: 1.25rem; }
    .upd-loading { min-height: 260px; display: grid; place-items: center; color: #6b7280; font-weight: 800; text-align: center; }
    .upd-spinner { width: 38px; height: 38px; border: 4px solid #fed7aa; border-top-color: #e8760a; border-radius: 999px; animation: upd-spin 0.8s linear infinite; margin: 0 auto 0.85rem; }
    @keyframes upd-spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) {
        .upd-page { padding: 1rem; }
        .upd-header { display: block; }
        .upd-badge { display: inline-flex; margin-top: 0.85rem; }
        .upd-title { font-size: 1.45rem; }
        .upd-panel { padding: 0.9rem; }
    }
`;

const Update = () => {
    const { id } = useParams();
    const location = useLocation();
    const tipo = location.state?.tipo || "vendedores";
    const [entity, setEntity] = useState(null);
    const { fetchDataBackend } = useFetch();

    useEffect(() => {
        const searchEntity = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/${tipo}/${id}`;
                const response = await fetchDataBackend(url, null, "GET");
                if (response) setEntity(response);
            } catch {
                toast.error("No se pudieron cargar los datos.");
            }
        };
        searchEntity();
    }, [id, tipo]);

    return (
        <>
            <style>{updateStyles}</style>
            <div className="upd-page">
                <div className="upd-header">
                    <div>
                        <p className="upd-kicker">Edicion</p>
                        <h1 className="upd-title">Actualizar registro</h1>
                        <p className="upd-subtitle">
                            Modifica la informacion del {tipo === "clientes" ? "cliente" : "vendedor"} seleccionado.
                        </p>
                    </div>
                    <span className="upd-badge">{tipo === "clientes" ? "Cliente" : "Vendedor"}</span>
                </div>

                <div className="upd-panel">
                    {entity ? (
                        tipo === "clientes"
                            ? <FormCliente clienteToUpdate={entity} />
                            : <FormVendedor vendedor={entity} />
                    ) : (
                        <div className="upd-loading">
                            <div>
                                <div className="upd-spinner" />
                                <p>Cargando datos...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Update;
