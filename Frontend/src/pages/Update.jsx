import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import FormVendedor from "../components/create/FormVendedor";

const Update = () => {
    const { id } = useParams();
    const [vendedor, setVendedor] = useState(null);
    const { fetchDataBackend } = useFetch();

    useEffect(() => {
        const searchVendedor = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${id}`;
                const response = await fetchDataBackend(url, null, "GET");
                if (response) {
                    setVendedor(response);
                }
            } catch (error) {
                toast.error("No se pudieron cargar los datos del vendedor.");
            }
        };
        searchVendedor();
    }, [id]);

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Actualizar</h1>
            <hr className='my-4 border-t-2 border-gray-300' />
            <p className='mb-8'>Este módulo te permite actualizar un registro</p>

            {vendedor ? (
                <FormVendedor vendedor={vendedor} />
            ) : (
                <div className="text-center py-10 text-gray-500">
                    Cargando datos del vendedor...
                </div>
            )}
        </div>
    );
};

export default Update;