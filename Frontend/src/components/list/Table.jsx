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
    .tbl-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .tbl {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        min-width: 520px;
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
    .tbl-badge.activo    { background: #d1fae5; color: #065f46; }
    .tbl-badge.inactivo  { background: #fee2e2; color: #991b1b; }
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

    /* ── Mobile cards ── */
    .tbl-cards { display: none; }
    .tbl-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.875rem;
        padding: 1rem 1.1rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .tbl-card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.3rem 0;
        font-size: 0.82rem;
        border-bottom: 1px solid #f3f4f6;
    }
    .tbl-card-row:last-child { border-bottom: none; padding-bottom: 0; }
    .tbl-card-label { color: #9ca3af; font-weight: 600; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .tbl-card-value { color: #111827; font-weight: 600; text-align: right; }
    .tbl-card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
    .tbl-card-num { font-size: 0.72rem; font-weight: 800; color: var(--orange-main); margin-bottom: 0.5rem; }

    @media (max-width: 640px) {
        .tbl-scroll { display: none; }
        .tbl-cards  { display: block; }
    }
`;

const Table = ({ tipo = 'clientes' }) => {
    const { fetchDataBackend } = useFetch();
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const { user } = storeProfile();

    const isVendedor = user?.rol === "vendedor";
    const esClientes = tipo === 'clientes';

    const listData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            if (!storedUser?.state?.token) {
                toast.error("No estás autenticado.");
                return;
            }
            const url = `${import.meta.env.VITE_BACKEND_URL}/${tipo}`;
            const response = await fetchDataBackend(url, null, "GET");
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
        setData([]);
        listData();
        // eslint-disable-next-line
    }, [tipo]);

    if (data.length === 0) {
        return (
            <>
                <style>{tableStyles}</style>
                <div className="tbl-empty">
                    <div className="tbl-empty-icon">{esClientes ? '👤' : '🏪'}</div>
                    <p>{esClientes ? 'No existen clientes registrados.' : 'No existen vendedores registrados.'}</p>
                </div>
            </>
        );
    }

    const deleteItem = async (id) => {
        const confirmDelete = window.confirm(
            esClientes
                ? "Vas a eliminar este cliente de forma permanente. ¿Estás seguro?"
                : "Vas a eliminar este vendedor de forma permanente. ¿Estás seguro?"
        );
        if (confirmDelete) {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/${tipo}/${id}`;
                const response = await fetchDataBackend(url, null, "DELETE");

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

    const getNombre = (item) => {
        if (esClientes) return `${item.nombre || ''} ${item.apellido || ''}`.trim();
        return item.nombrePropietario || item.nombre || '—';
    };

    const getEstadoBadge = (item) => {
        const s = item.status;
        const cls = s === true || s === 'activo' ? 'activo' : s === 'pendiente' ? 'pendiente' : 'inactivo';
        const label = typeof s === 'boolean' ? (s ? 'Activo' : 'Inactivo') : s ? s.charAt(0).toUpperCase() + s.slice(1) : 'N/A';
        return <span className={`tbl-badge ${cls}`}>{label}</span>;
    };

    return (
        <>
            <style>{tableStyles}</style>
            <ToastContainer />
            <div className="tbl-wrap">

                {/* ── Vista tabla (desktop) ── */}
                <div className="tbl-scroll">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Nombre completo</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                {esClientes && <th>Estado</th>}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item._id}>
                                    <td className="tbl-num">{index + 1}</td>
                                    <td className="tbl-name">{getNombre(item)}</td>
                                    <td className="tbl-email">{item.email}</td>
                                    <td className="tbl-phone">{item.telefono || "—"}</td>
                                    <td>
                                        <span className={`tbl-badge ${item.rol === 'vendedor' ? 'rol-vendedor' : 'rol-cliente'}`}>
                                            {item.rol === 'vendedor' ? '🏪 Vendedor' : '👤 Cliente'}
                                        </span>
                                    </td>
                                    {esClientes && <td>{getEstadoBadge(item)}</td>}
                                    <td className="tbl-actions">
                                        {!isVendedor && (
                                            <button title="Actualizar" className="tbl-icon-btn gray" onClick={() => navigate(`/dashboard/actualizar/${item._id}`)}>
                                                <MdPublishedWithChanges size={20} />
                                            </button>
                                        )}
                                        <button title="Más información" className="tbl-icon-btn blue" onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}>
                                            <MdInfo size={20} />
                                        </button>
                                        <button title="Eliminar" className="tbl-icon-btn red" onClick={() => deleteItem(item._id)}>
                                            <MdDeleteForever size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Vista cards (móvil) ── */}
                <div className="tbl-cards" style={{padding:'0.75rem'}}>
                    {data.map((item, index) => (
                        <div key={item._id} className="tbl-card">
                            <div className="tbl-card-num">#{index + 1}</div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Nombre</span>
                                <span className="tbl-card-value">{getNombre(item)}</span>
                            </div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Email</span>
                                <span className="tbl-card-value" style={{fontSize:'0.78rem'}}>{item.email}</span>
                            </div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Teléfono</span>
                                <span className="tbl-card-value">{item.telefono || '—'}</span>
                            </div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Rol</span>
                                <span className={`tbl-badge ${item.rol === 'vendedor' ? 'rol-vendedor' : 'rol-cliente'}`}>
                                    {item.rol === 'vendedor' ? '🏪 Vendedor' : '👤 Cliente'}
                                </span>
                            </div>
                            {esClientes && (
                                <div className="tbl-card-row">
                                    <span className="tbl-card-label">Estado</span>
                                    {getEstadoBadge(item)}
                                </div>
                            )}
                            <div className="tbl-card-actions">
                                {!isVendedor && (
                                    <button title="Actualizar" className="tbl-icon-btn gray" onClick={() => navigate(`/dashboard/actualizar/${item._id}`)}>
                                        <MdPublishedWithChanges size={22} />
                                    </button>
                                )}
                                <button title="Ver" className="tbl-icon-btn blue" onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}>
                                    <MdInfo size={22} />
                                </button>
                                <button title="Eliminar" className="tbl-icon-btn red" onClick={() => deleteItem(item._id)}>
                                    <MdDeleteForever size={22} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
};

export default Table;
