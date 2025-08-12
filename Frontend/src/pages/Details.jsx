import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import storeProfile from "../context/storeProfile"; // 1. IMPORTAMOS EL STORE PARA SABER EL ROL

const Details = () => {
    // Obtenemos el ID de la entidad (cliente o vendedor) de la URL
    const { id } = useParams();
    
    // 2. OBTENEMOS EL USUARIO LOGUEADO Y SU ROL
    const { user } = storeProfile();
    const isVendedor = user?.rol === 'vendedor'; // Comprobamos si el usuario es un vendedor

    // Estado para guardar los datos (ahora es genérico, no solo para vendedor)
    const [entityDetails, setEntityDetails] = useState(null); 
    const { fetchDataBackend } = useFetch();

    // Función para obtener los detalles de la entidad (cliente o vendedor)
    const getEntityDetails = async () => {
        // Si no tenemos el rol del usuario, no hacemos nada para evitar errores
        if (!user?.rol) return; 

        try {
            // 3. LA URL AHORA ES DINÁMICA BASADA EN EL ROL
            // Si es vendedor, buscará un cliente. Si es admin, buscará un vendedor.
            const entityType = isVendedor ? 'clientes' : 'vendedores';
            const url = `${import.meta.env.VITE_BACKEND_URL}/${entityType}/${id}`;
            
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
                setEntityDetails(response); // Guardamos los detalles en el estado genérico
            }
        } catch (error) {
            console.error("Error al obtener los detalles:", error);
            toast.error("No se pudieron cargar los datos.");
        }
    };

    // Formateador de fecha (sin cambios)
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' 
        });
    };

    // useEffect se ejecuta cuando el ID o el rol del usuario cambien
    useEffect(() => {
        getEntityDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user?.rol]);


    // Estado de carga mientras se obtienen los datos
    if (!entityDetails) {
        return (
            <div className="p-4 mt-5 text-center">
                <p className="font-medium text-gray-500">Cargando detalles...</p>
            </div>
        );
    }

    // 4. EL COMPONENTE AHORA RENDERIZA TÍTULOS Y DATOS DINÁMICOS
    return (
        <>
            <div>
                <h1 className='font-black text-4xl text-gray-500'>
                    Detalle del {isVendedor ? 'Cliente' : 'Vendedor'}
                </h1>
                <hr className='my-4 border-t-2 border-gray-300' />
                <p className='mb-8'>
                    Este módulo te permite visualizar los datos del {isVendedor ? 'cliente' : 'vendedor'} seleccionado.
                </p>
            </div>
            
            <div className='bg-white shadow-lg p-8 rounded-xl'>
                <div className='flex flex-col md:flex-row justify-between gap-10'>

                    {/* SECCIÓN DE INFORMACIÓN (AHORA GENÉRICA) */}
                    <div>
                        <ul className="space-y-3">
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Nombre:</span> 
                                {`${entityDetails.nombre} ${entityDetails.apellido}`}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Email:</span> 
                                {entityDetails.email}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Teléfono:</span> 
                                {entityDetails.telefono || 'No registrado'}
                            </li>
                            <li className="text-md text-gray-800">
                                <span className="font-bold text-gray-600 w-40 inline-block">Dirección:</span> 
                                {entityDetails.direccion || 'No registrada'}
                            </li>

                            {/* 5. MOSTRAR CAMPOS ADICIONALES SOLO SI SE ESTÁ VIENDO UN VENDEDOR */}
                            {!isVendedor && (
                                <>
                                    <li className="text-md text-gray-800">
                                        <span className="font-bold text-gray-600 w-40 inline-block">Estado:</span> 
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                            entityDetails.status === 'activo'
                                            ? 'bg-green-100 text-green-800'
                                            : entityDetails.status === 'pendiente'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                            {entityDetails.status ? entityDetails.status.charAt(0).toUpperCase() + entityDetails.status.slice(1) : 'N/A'}
                                        </span>
                                    </li>
                                    <li className="text-md text-gray-800">
                                        <span className="font-bold text-gray-600 w-40 inline-block">Email Confirmado:</span> 
                                        <span className={entityDetails.confirmEmail ? 'text-green-600' : 'text-red-600'}>
                                            {entityDetails.confirmEmail ? 'Sí' : 'No'}
                                        </span>
                                    </li>
                                    <li className="text-md text-gray-800">
                                        <span className="font-bold text-gray-600 w-40 inline-block">Fecha de Creación:</span> 
                                        {formatDate(entityDetails.createdAt)}
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* SECCIÓN DE AVATAR (sin cambios, es genérica) */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                         <div className="h-48 w-48 bg-gray-200 rounded-full flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                             </svg>
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Details;