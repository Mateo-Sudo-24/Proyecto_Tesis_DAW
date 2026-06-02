import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import FormVendedor from "../components/create/FormVendedor";
import FormCliente from "../components/create/FormCliente";

const Update = () => {
    const { id } = useParams();
    const location = useLocation();
    const tipo = location.state?.tipo || 'vendedores';
    const [entity, setEntity] = useState(null);
    const { fetchDataBackend } = useFetch();

    useEffect(() => {
        const searchEntity = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tipo}/${id}`;
                const response = await fetchDataBackend(url, null, "GET");
                if (response) {
                    setEntity(response);
                }
            } catch (error) {
                toast.error("No se pudieron cargar los datos.");
            }
        };
        searchEntity();
    }, [id, tipo]);

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Actualizar</h1>
            <hr className='my-4 border-t-2 border-gray-300' />
            <p className='mb-8'>Este módulo te permite actualizar un registro</p>

            {entity ? (
                tipo === 'clientes'
                    ? <FormCliente clienteToUpdate={entity} />
                    : <FormVendedor vendedor={entity} />
            ) : (
                <div className="text-center py-10 text-gray-500">
                    Cargando datos...
                </div>
            )}
        </div>
    );
};

export default Update;