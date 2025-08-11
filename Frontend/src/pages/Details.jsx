import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify"; // Es buena práctica tenerlo para errores

const Details = () => {
    // 1. OBTENER EL ID DEL VENDEDOR DE LA URL
    const { id } = useParams();
    
    // 2. ESTADO ADAPTADO PARA VENDEDOR
    // Empezar con null es mejor para manejar el estado de carga
    const [vendedor, setVendedor] = useState(null); 
    const { fetchDataBackend } = useFetch();

    // 3. FUNCIÓN DE FETCH ADAPTADA Y ROBUSTA
    const getVendedorDetails = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${id}`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));

            if (!storedUser?.state?.token) {
                toast.error("No estás autenticado.");
                return;
            }

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };
            const response = await fetchDataBackend(url, null, "GET", headers);
            if(response) {
                setVendedor(response);
            }
        } catch (error) {
            console.error("Error al obtener los detalles del vendedor:", error);
            toast.error("No se pudieron cargar los datos del vendedor.");
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC' 
        });
    };

    useEffect(() => {
        getVendedorDetails();
    }, [id]); // Es buena práctica añadir el 'id' como dependencia


    // 4. ESTADO DE CARGA MIENTRAS SE OBTIENEN LOS DATOS
    if (!vendedor) {
        return (
            <div className="p-4 mt-5 text-center">
                <p className="font-medium text-gray-500">Cargando detalles del vendedor...</p>
            </div>
        );
    }

    return (
        <>
            <div>
                {/* 5. TÍTULOS ADAPTADOS */}
                <h1 className='font-black text-4xl text-gray-500'>Detalle del Vendedor</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
                <p className='mb-8'>Este módulo te permite visualizar los datos del vendedor seleccionado.</p>
            </div>
            
            <div className='bg-white shadow-lg p-8 rounded-xl'>
                <div className='flex flex-col md:flex-row justify-between gap-10'>

                    {/* SECCIÓN DE INFORMACIÓN DEL VENDEDOR (CORREGIDA) */}
                    <div>
                        <ul className="space-y-3">
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Nombre:</span> 
                                {`${vendedor.nombre} ${vendedor.apellido}`}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Email:</span> 
                                {vendedor.email}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Teléfono:</span> 
                                {vendedor.telefono || 'No registrado'}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Dirección:</span> 
                                {vendedor.direccion || 'No registrada'}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Estado:</span> 
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                // Si el estado es 'activo', usa clases de color verde
                                vendedor.status === 'activo'
                                ? 'bg-green-100 text-green-800'
                                // Si el estado es 'pendiente', usa clases de color amarillo
                                : vendedor.status === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                // Para cualquier otro estado (ej. 'inactivo'), usa clases de color rojo
                                : 'bg-red-100 text-red-800'
                            }`}>
                                {/* Capitaliza la primera letra del estado para que se vea mejor */}
                                {vendedor.status ? vendedor.status.charAt(0).toUpperCase() + vendedor.status.slice(1) : 'N/A'}
                            </span>
                            </li>
                             <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Email Confirmado:</span> 
                                 <span className={vendedor.confirmEmail ? 'text-green-600' : 'text-red-600'}>
                                    {vendedor.confirmEmail ? 'Sí' : 'No'}
                                 </span>
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Fecha de Creación:</span> 
                                {formatDate(vendedor.createdAt)}
                            </li>
                        </ul>
                    </div>

                    {/* 6. SECCIÓN DE AVATAR ADAPTADA */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                        {/* Como la API no devuelve un avatar, mostramos un placeholder genérico */}
                         <div className="h-48 w-48 bg-gray-200 rounded-full flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                             </svg>
                         </div>
                    </div>
                </div>

                {/* 7. SECCIÓN DE TRATAMIENTOS ELIMINADA */}
                {/* Ya no hay necesidad de mostrar una tabla o modal de tratamientos */}
            </div>
        </>
    );
}

export default Details;
