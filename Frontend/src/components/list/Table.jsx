import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router'
import { ToastContainer } from "react-toastify"
import storeProfile from "../../context/storeProfile";

const Table = () => {
    const { fetchDataBackend } = useFetch();
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const { user } = storeProfile();

    // Detectar si es vendedor
    const isVendedor = user?.rol === "vendedor";

    const listData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            if (!storedUser?.state?.token) {
                toast.error("No estás autenticado.");
                return;
            }
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };

            // Cambia la URL según el rol
            const url = isVendedor
                ? `${import.meta.env.VITE_BACKEND_URL}/clientes`
                : `${import.meta.env.VITE_BACKEND_URL}/vendedores`;

            const response = await fetchDataBackend(url, null, "GET", headers);

            if (response && Array.isArray(response)) {
                setData(response);
            } else {
                setData([]);
            }
        } catch (error) {
            toast.error("No se pudo cargar la lista.");
        }
    };

    useEffect(() => {
        listData();
        // eslint-disable-next-line
    }, [user?.rol]);

    // Mensaje de carga o si no hay registros
    if (data.length === 0) {
        return (
            <div className="p-4 mt-5 text-sm text-center text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                <span className="font-medium">
                    {isVendedor
                        ? "No existen clientes registrados o se están cargando..."
                        : "No existen vendedores registrados o se están cargando..."}
                </span>
            </div>
        );
    }

    // Eliminar (clientes para vendedor, vendedores para admin)
    const deleteItem = async (id) => {
        const confirmDelete = window.confirm(
            isVendedor
                ? "Vas a eliminar este cliente de forma permanente. ¿Estás seguro?"
                : "Vas a eliminar este vendedor de forma permanente. ¿Estás seguro?"
        );
        if (confirmDelete) {
            try {
                const url = isVendedor
                    ? `${import.meta.env.VITE_BACKEND_URL}/clientes/${id}`
                    : `${import.meta.env.VITE_BACKEND_URL}/vendedores/${id}`;
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));
                const headers = {
                    Authorization: `Bearer ${storedUser.state.token}`,
                };
                const response = await fetchDataBackend(url, null, "DELETE", headers);

                if (response?.msg) {
                    setData((prev) => prev.filter(item => item._id !== id));
                } else {
                    toast.error(response?.msg || "No se pudo eliminar.");
                }
            } catch (error) {
                toast.error("Error al eliminar.");
            }
        }
    };

    return (
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <ToastContainer />
            <thead className="bg-gray-800 text-slate-400">
                <tr>
                    <th className="p-2">N°</th>
                    <th className="p-2">Nombre Completo</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Teléfono</th>
                    {isVendedor
                        ? <th className="p-2">Acciones</th>
                        : <>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Acciones</th>
                        </>
                    }
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr className="border-b hover:bg-gray-100 text-center" key={item._id}>
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{`${item.nombre} ${item.apellido}`}</td>
                        <td className="p-2">{item.email}</td>
                        <td className="p-2">{item.telefono || "No registrado"}</td>
                        {isVendedor ? (
                            <td className='py-2 text-center'>
                                <MdInfo
                                    title="Más información"
                                    className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                                    onClick={() => navigate(`/dashboard/visualizar-cliente/${item._id}`)}
                                />
                                <MdDeleteForever
                                    title="Eliminar"
                                    className="h-7 w-7 text-red-900 cursor-pointer inline-block hover:text-red-600"
                                    onClick={() => { deleteItem(item._id) }}
                                />
                            </td>
                        ) : (
                            <>
                                <td className="p-2">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                        item.status === 'activo' || item.status === true
                                            ? 'bg-green-100 text-green-800'
                                            : item.status === 'pendiente'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {typeof item.status === "boolean"
                                            ? (item.status ? "Activo" : "Inactivo")
                                            : item.status
                                                ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                                                : 'N/A'}
                                    </span>
                                </td>
                                <td className='py-2 text-center'>
                                    <MdPublishedWithChanges
                                        title="Actualizar"
                                        className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-blue-600"
                                        onClick={() => navigate(`/dashboard/actualizar/${item._id}`)}
                                    />
                                    <MdInfo
                                        title="Más información"
                                        className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                                        onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}
                                    />
                                    <MdDeleteForever
                                        title="Eliminar"
                                        className="h-7 w-7 text-red-900 cursor-pointer inline-block hover:text-red-600"
                                        onClick={() => { deleteItem(item._id) }}
                                    />
                                </td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;