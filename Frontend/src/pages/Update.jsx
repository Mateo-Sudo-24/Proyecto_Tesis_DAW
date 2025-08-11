import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
// Asegúrate de que la ruta a tu componente de formulario sea correcta
import { Form } from "../components/create/Form"; 

const Update = () => {
    // 1. OBTENER EL ID DEL VENDEDOR DE LA URL
    const { id } = useParams();
    
    // 2. ESTADO ADAPTADO PARA 'VENDEDOR'
    // Inicializamos con 'null' para poder mostrar un estado de "cargando..."
    const [vendedor, setVendedor] = useState(null);
    const { fetchDataBackend } = useFetch();

    useEffect(() => {
        // 3. FUNCIÓN ADAPTADA PARA BUSCAR UN VENDEDOR POR SU ID
        const searchVendedor = async () => {
            try {
                // URL corregida para el endpoint de vendedores
                const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${id}`;
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));

                if (!storedUser?.state?.token) {
                    toast.error("No estás autenticado. Por favor, inicia sesión de nuevo.");
                    return;
                }
                
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser.state.token}`
                };
                
                const response = await fetchDataBackend(url, null, "GET", headers);
                
                // Si la respuesta es válida, actualizamos el estado
                if (response) {
                    setVendedor(response);
                }
            } catch (error) {
                console.error("Error al buscar los datos del vendedor:", error);
                toast.error("No se pudieron cargar los datos del vendedor para actualizar.");
            }
        };
        
        searchVendedor();
    }, [id]); // Se añade 'id' como dependencia para que se recargue si cambia la URL

    return (
        <div>
            {/* 4. TÍTULOS Y TEXTOS ADAPTADOS PARA VENDEDORES */}
            <h1 className='font-black text-4xl text-gray-500'>Actualizar Vendedor</h1>
            <hr className='my-4 border-t-2 border-gray-300' />
            <p className='mb-8'>Este módulo te permite actualizar los datos de un vendedor existente.</p>
            
            {/* 5. RENDERIZADO CONDICIONAL MEJORADO */}
            {vendedor ? (
                // Pasamos el vendedor encontrado como una prop al formulario.
                // Es buena práctica usar un nombre de prop específico como 'vendedorToUpdate'.
                <Form vendedorToUpdate={vendedor} />
            ) : (
                // Se muestra un mensaje de carga mientras se obtienen los datos.
                <div className="p-4 mb-4 text-sm text-center text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                    <span className="font-medium">Cargando datos del vendedor...</span>
                </div>
            )}
        </div>
    );
};

export default Update;