import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Importa toast para notificaciones
import { useNavigate } from 'react-router'
import { ToastContainer } from "react-toastify"

const Table = () => {
    const { fetchDataBackend } = useFetch();
    // 1. Renombrar el estado para mayor claridad
    const [vendedores, setVendedores] = useState([]);
    const navigate = useNavigate()

    const listVendedores = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));

            // Validar si el token existe
            if (!storedUser?.state?.token) {
                toast.error("No estás autenticado.");
                return;
            }

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };

            const response = await fetchDataBackend(url, null, "GET", headers);

            // 2. Corregir la actualización del estado y validar que la respuesta sea un array
            if (response && Array.isArray(response)) {
                setVendedores(response);
            } else {
                // Si la respuesta no es un array, no actualices el estado con datos inválidos
                console.error("La respuesta de la API no es un array:", response);
                setVendedores([]);
            }
        } catch (error) {
            console.error("Error al obtener la lista de vendedores:", error);
            toast.error("No se pudo cargar la lista de vendedores.");
        }
    };

    useEffect(() => {
        listVendedores();
    }, []);

    // Mensaje de carga o si no hay registros
    if (vendedores.length === 0) {
        return (
            <div className="p-4 mt-5 text-sm text-center text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                <span className="font-medium">No existen vendedores registrados o se están cargando...</span>
            </div>
        );
    }
    const deleteVendedor = async (id) => {
        // --- INICIO DE LA MODIFICACIÓN ---
        // 1. Mostramos por consola el ID que se va a eliminar
        console.log("ID del vendedor a eliminar:", id);
        // --- FIN DE LA MODIFICACIÓN ---

        const confirmDelete = window.confirm("Vas a eliminar este vendedor de forma permanente. ¿Estás seguro?");
        if (confirmDelete) {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/vendedores/${id}`;
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));
                
                // Cabeceras correctas: Solo autorización para DELETE
                const headers = {
                    Authorization: `Bearer ${storedUser.state.token}`,
                };
                
                const response = await fetchDataBackend(url, undefined, "DELETE", headers);
                
                if (response?.msg) {
                    setVendedores((prevVendedores) => prevVendedores.filter(vendedor => vendedor._id !== id));
                    // El toast de éxito ya lo maneja useFetch si está configurado para ello
                } else {
                    toast.error(response?.msg || "No se pudo eliminar el vendedor.");
                }
            } catch (error) {
                // El toast de error ya lo maneja useFetch
                console.error("Error detallado al eliminar el vendedor:", error);
            }
        }
    };

    return (
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
             <ToastContainer/>
            <thead className="bg-gray-800 text-slate-400">
                <tr>
                    {/* 3. Actualizar los encabezados de la tabla */}
                    {["N°", "Nombre Completo", "Email", "Teléfono", "Estado", "Acciones"].map((header) => (
                        <th key={header} className="p-2">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {/* 4. Mapear sobre el estado 'vendedores' y usar las propiedades correctas */}
                {vendedores.map((vendedor, index) => (
                    <tr className="border-b hover:bg-gray-100 text-center" key={vendedor._id}>
                        <td className="p-2">{index + 1}</td>
                        {/* Combinar nombre y apellido */}
                        <td className="p-2">{`${vendedor.nombre} ${vendedor.apellido}`}</td>
                        <td className="p-2">{vendedor.email}</td>
                        <td className="p-2">{vendedor.telefono}</td>
                        <td className="p-2">
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
                        </td>
                        <td className='py-2 text-center'>
                            <MdPublishedWithChanges
                                title="Actualizar"
                                className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-blue-600"
                            />
                            <MdInfo
                                title="Más información"
                                className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                            onClick={() => navigate(`/dashboard/visualizar/${vendedor._id}`)}
                            />
                            <MdDeleteForever
                                title="Eliminar"
                                className="h-7 w-7 text-red-900 cursor-pointer inline-block hover:text-red-600"
                                onClick={() => { deleteVendedor(vendedor._id) }}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;   