import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router';
import { ToastContainer } from "react-toastify";
import storeProfile from "../../context/storeProfile";

const tableStyles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
    }
    .tbl-wrap {
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.07);
        overflow: hidden;
    }
    .tbl-empty {
        padding: 3rem 2rem;
        text-align: center;
        color: #9ca3af;
        font-size: 0.9rem;
        background: #fff;
        border-radius: 1rem;
        border: 2px dashed #e5e7eb;
    }
    .tbl-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .tbl-scroll { overflow-x: auto; }
    .tbl {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }
    .tbl thead {
        background: #1f2937;
        color: #9ca3af;
        text-align: left;
    }
    .tbl thead th {
        padding: 0.85rem 1.1rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        white-space: nowrap;
    }
    .tbl thead th:last-child { text-align: center; }
    .tbl tbody tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.12s;
    }
    .tbl tbody tr:last-child { border-bottom: none; }
    .tbl tbody tr:hover { background: #fdf6ef; }
    .tbl td {
        padding: 0.8rem 1.1rem;
        color: #374151;
        vertical-align: middle;
    }
    .tbl-num {
        font-weight: 700;
        color: var(--orange-main);
        font-size: 0.8rem;
    }
    .tbl-name { font-weight: 600; color: #111827; }
    .tbl-email { color: #6b7280; }
    .tbl-phone { color: #6b7280; }
    .tbl-actions { text-align: center; white-space: nowrap; }
    .tbl-badge {
        display: inline-block;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: capitalize;
    }
    .tbl-badge.activo { background: #d1fae5; color: #065f46; }
    .tbl-badge.inactivo { background: #fee2e2; color: #991b1b; }
    .tbl-badge.pendiente { background: #fef3c7; color: #92400e; }
    .tbl-badge.rol-cliente  { background: #dbeafe; color: #1e40af; }
    .tbl-badge.rol-vendedor { background: var(--orange-light, #fde8ce); color: #92400e; }
    .tbl-icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.3rem;
        border-radius: 0.375rem;
        transition: background 0.12s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .tbl-icon-btn.blue { color: #3b82f6; }
    .tbl-icon-btn.blue:hover { background: #eff6ff; color: #1d4ed8; }
    .tbl-icon-btn.gray { color: #6b7280; }
    .tbl-icon-btn.gray:hover { background: #f3f4f6; color: #111827; }
    .tbl-icon-btn.red { color: #f87171; }
    .tbl-icon-btn.red:hover { background: #fef2f2; color: #dc2626; }
`;

const Table = () => {
    const { fetchDataBackend } = useFetch();
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const { user } = storeProfile();

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

    if (data.length === 0) {
        return (
            <>
                <style>{tableStyles}</style>
                <div className="tbl-empty">
                    <div className="tbl-empty-icon">📋</div>
                    <p>
                        {isVendedor
                            ? "No existen clientes registrados o se están cargando..."
                            : "No existen vendedores registrados o se están cargando..."}
                    </p>
                </div>
            </>
        );
    }

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
        <>
            <style>{tableStyles}</style>
            <ToastContainer />
            <div className="tbl-wrap">
                <div className="tbl-scroll">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Nombre completo</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                {isVendedor
                                    ? <th>Acciones</th>
                                    : <>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                      </>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item._id}>
                                    <td className="tbl-num">{index + 1}</td>
                                    <td className="tbl-name">{`${item.nombre} ${item.apellido}`}</td>
                                    <td className="tbl-email">{item.email}</td>
                                    <td className="tbl-phone">{item.telefono || "—"}</td>
                                    <td>
                                        <span className={`tbl-badge ${item.rol === 'vendedor' ? 'rol-vendedor' : 'rol-cliente'}`}>
                                            {item.rol === 'vendedor' ? '🏪 Vendedor' : '👤 Cliente'}
                                        </span>
                                    </td>
                                    {isVendedor ? (
                                        <td className="tbl-actions">
                                            <button
                                                title="Más información"
                                                className="tbl-icon-btn blue"
                                                onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}
                                            >
                                                <MdInfo size={20} />
                                            </button>
                                            <button
                                                title="Eliminar"
                                                className="tbl-icon-btn red"
                                                onClick={() => deleteItem(item._id)}
                                            >
                                                <MdDeleteForever size={20} />
                                            </button>
                                        </td>
                                    ) : (
                                        <>
                                            <td>
                                                <span className={`tbl-badge ${
                                                    item.status === true || item.status === 'activo'
                                                        ? 'activo'
                                                        : item.status === 'pendiente'
                                                        ? 'pendiente'
                                                        : 'inactivo'
                                                }`}>
                                                    {typeof item.status === "boolean"
                                                        ? (item.status ? "Activo" : "Inactivo")
                                                        : item.status
                                                            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                                                            : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="tbl-actions">
                                                <button
                                                    title="Actualizar"
                                                    className="tbl-icon-btn gray"
                                                    onClick={() => navigate(`/dashboard/actualizar/${item._id}`)}
                                                >
                                                    <MdPublishedWithChanges size={20} />
                                                </button>
                                                <button
                                                    title="Más información"
                                                    className="tbl-icon-btn blue"
                                                    onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}
                                                >
                                                    <MdInfo size={20} />
                                                </button>
                                                <button
                                                    title="Eliminar"
                                                    className="tbl-icon-btn red"
                                                    onClick={() => deleteItem(item._id)}
                                                >
                                                    <MdDeleteForever size={20} />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Table;
