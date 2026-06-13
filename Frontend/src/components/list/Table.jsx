/* eslint-disable react/prop-types */
import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import storeProfile from "../../context/storeProfile";

const tableStyles = `
    :root {
        --orange-main: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
    }
    .tbl-wrap { background:#fff; border-radius:1rem; box-shadow:0 4px 20px rgba(0,0,0,0.07); overflow:hidden; }
    .tbl-empty { padding:3rem 2rem; text-align:center; color:#9ca3af; font-size:0.9rem; background:#fff; border-radius:1rem; border:2px dashed #e5e7eb; }
    .tbl-empty-icon { width:54px; height:54px; margin:0 auto 0.7rem; border:2px solid #e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#6b7280; font-size:1.6rem; }
    .tbl-empty-icon::before { content:'\\2315'; }
    .tbl-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
    .tbl { width:100%; border-collapse:collapse; font-size:0.875rem; min-width:700px; }
    .tbl thead { background:#1f2937; color:#9ca3af; text-align:left; }
    .tbl thead th { padding:0.85rem 1.1rem; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; white-space:nowrap; }
    .tbl thead th:last-child { text-align:center; }
    .tbl tbody tr { border-bottom:1px solid #f3f4f6; transition:background 0.12s; }
    .tbl tbody tr:last-child { border-bottom:none; }
    .tbl tbody tr:hover { background:#fdf6ef; }
    .tbl td { padding:0.8rem 1.1rem; color:#374151; vertical-align:middle; }
    .tbl-num { font-weight:700; color:var(--orange-main); font-size:0.8rem; }
    .tbl-email { color:#6b7280; font-size:0.82rem; }
    .tbl-phone { color:#6b7280; }
    .tbl-actions { text-align:center; white-space:nowrap; }
    .tbl-badge { display:inline-flex; align-items:center; gap:0.3rem; padding:0.25rem 0.7rem; border-radius:999px; font-size:0.72rem; font-weight:700; text-transform:capitalize; white-space:nowrap; }
    .tbl-badge.activo { background:#d1fae5; color:#065f46; }
    .tbl-badge.inactivo { background:#fee2e2; color:#991b1b; }
    .tbl-badge.pendiente { background:#fef3c7; color:#92400e; }
    .tbl-badge.verificado { background:#d1fae5; color:#065f46; }
    .tbl-badge.no-verificado { background:#f3f4f6; color:#9ca3af; }
    .tbl-cell-main { font-weight:600; color:#111827; line-height:1.3; }
    .tbl-cell-sub { font-size:0.72rem; color:#9ca3af; margin-top:0.15rem; }
    .tbl-icon-btn { background:none; border:none; cursor:pointer; padding:0.3rem; border-radius:0.375rem; transition:background 0.12s; display:inline-flex; align-items:center; justify-content:center; }
    .tbl-icon-btn.blue { color:#3b82f6; }
    .tbl-icon-btn.blue:hover { background:#eff6ff; color:#1d4ed8; }
    .tbl-icon-btn.gray { color:#6b7280; }
    .tbl-icon-btn.gray:hover { background:#f3f4f6; color:#111827; }
    .tbl-icon-btn.red { color:#f87171; }
    .tbl-icon-btn.red:hover { background:#fef2f2; color:#dc2626; }
    .confirm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1000; animation:cfade 0.18s ease; }
    @keyframes cfade { from{opacity:0} to{opacity:1} }
    .confirm-box { background:#fff; border-radius:1rem; padding:2rem; width:90%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.22); animation:cslide 0.2s cubic-bezier(.4,0,.2,1); text-align:center; }
    @keyframes cslide { from{transform:translateY(-14px) scale(0.96);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
    .confirm-icon { font-size:2.2rem; margin:0 auto 0.75rem; line-height:1; width:54px; height:54px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; font-weight:900; }
    .confirm-title { font-size:1.1rem; font-weight:800; color:#111827; margin:0 0 0.4rem; }
    .confirm-text { font-size:0.875rem; color:#6b7280; margin:0 0 1.5rem; line-height:1.5; }
    .confirm-name { font-weight:700; color:#dc2626; }
    .confirm-actions { display:flex; gap:0.75rem; justify-content:center; }
    .confirm-btn { flex:1; max-width:160px; padding:0.65rem 1rem; border-radius:0.625rem; font-size:0.875rem; font-weight:700; border:none; cursor:pointer; transition:background 0.15s,transform 0.1s; }
    .confirm-btn:active { transform:scale(0.97); }
    .confirm-btn.cancel { background:#f3f4f6; color:#374151; }
    .confirm-btn.cancel:hover { background:#e5e7eb; }
    .confirm-btn.danger { background:#dc2626; color:#fff; }
    .confirm-btn.danger:hover { background:#b91c1c; }
    .tbl-cards { display:none; }
    .tbl-card { background:#fff; border:1px solid #e5e7eb; border-radius:0.875rem; padding:1rem 1.1rem; margin-bottom:0.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
    .tbl-card-row { display:flex; justify-content:space-between; align-items:center; padding:0.3rem 0; font-size:0.82rem; border-bottom:1px solid #f3f4f6; gap:1rem; }
    .tbl-card-row:last-child { border-bottom:none; padding-bottom:0; }
    .tbl-card-label { color:#9ca3af; font-weight:600; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; }
    .tbl-card-value { color:#111827; font-weight:600; text-align:right; }
    .tbl-card-actions { display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid #f3f4f6; }
    .tbl-card-num { font-size:0.72rem; font-weight:800; color:var(--orange-main); margin-bottom:0.5rem; }
    @media (max-width:640px) { .tbl-scroll{display:none} .tbl-cards{display:block} }
`;

const ConfirmModal = ({ nombre, esCliente, pedidosCount = 0, onConfirm, onCancel }) => {
    const bloqueado = Number(pedidosCount || 0) > 0;
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
                <div className="confirm-icon">!</div>
                <p className="confirm-title">{bloqueado ? "No se puede eliminar" : "Estas seguro?"}</p>
                <p className="confirm-text">
                    {bloqueado ? (
                        <>
                            Este usuario tiene pedidos registrados y no puede ser eliminado.
                            Primero revisa su historial de pedidos.
                        </>
                    ) : (
                        <>
                            Vas a eliminar {esCliente ? "al cliente" : "al vendedor"}{" "}
                            <span className="confirm-name">{nombre}</span>{" "}
                            de forma permanente. Esta accion no se puede deshacer.
                        </>
                    )}
                </p>
                <div className="confirm-actions">
                    <button className="confirm-btn cancel" onClick={onCancel}>Cancelar</button>
                    {!bloqueado && <button className="confirm-btn danger" onClick={onConfirm}>Si, eliminar</button>}
                </div>
            </div>
        </div>
    );
};

const Table = ({ tipo = "clientes" }) => {
    const { fetchDataBackend } = useFetch();
    const [data, setData] = useState([]);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const navigate = useNavigate();
    const { user } = storeProfile();

    const isVendedor = user?.rol === "vendedor";
    const esClientes = tipo === "clientes";

    const listData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            if (!storedUser?.state?.token) {
                toast.error("No estas autenticado.");
                return;
            }
            const url = `${import.meta.env.VITE_BACKEND_URL}/${tipo}`;
            const response = await fetchDataBackend(url, null, "GET");
            setData(Array.isArray(response) ? response : []);
        } catch {
            toast.error("No se pudo cargar la lista.");
        }
    };

    useEffect(() => { setData([]); listData(); }, [tipo]); // eslint-disable-line

    const getNombre = (item) =>
        esClientes
            ? `${item.nombre || ""} ${item.apellido || ""}`.trim() || "Sin nombre"
            : `${item.nombre || ""} ${item.apellido || ""}`.trim() || "Sin nombre";

    const getSector = (item) => item.sector || item.barrio || item.zona || item.direccion || "";

    const getEstadoBadge = (item) => {
        const s = item.status;
        const tienePedidos = Number(item.pedidosCount || 0) > 0;
        const cls = esClientes
            ? (s === false ? "inactivo" : "activo")
            : (s === "activo" ? "activo" : "inactivo");
        const label = esClientes
            ? (tienePedidos ? "Activo con pedido" : (s === false ? "Inactivo" : "Activo"))
            : (s === "activo" ? "Activo" : "Offline");
        return <span className={`tbl-badge ${cls}`}>{label}</span>;
    };

    const pedirConfirmacion = (item) => setConfirmTarget({ id: item._id, nombre: getNombre(item), pedidosCount: Number(item.pedidosCount || 0) });

    const confirmarEliminacion = async () => {
        if (!confirmTarget) return;
        const { id } = confirmTarget;
        setConfirmTarget(null);
        const url = `${import.meta.env.VITE_BACKEND_URL}/${tipo}/${id}`;
        const res = await fetchDataBackend(url, null, "DELETE");
        if (!res) return;
        setData(prev => prev.filter(item => item._id !== id));
    };

    if (data.length === 0) {
        return (
            <>
                <style>{tableStyles}</style>
                <div className="tbl-empty">
                    <div className="tbl-empty-icon" />
                    <p>{esClientes ? "No existen clientes registrados." : "No existen vendedores registrados."}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{tableStyles}</style>

            {confirmTarget && (
                <ConfirmModal
                    nombre={confirmTarget.nombre}
                    esCliente={esClientes}
                    pedidosCount={confirmTarget.pedidosCount}
                    onConfirm={confirmarEliminacion}
                    onCancel={() => setConfirmTarget(null)}
                />
            )}

            <div className="tbl-wrap">
                <div className="tbl-scroll">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Nombre y apellido</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                {esClientes ? (
                                    <>
                                        <th>Sector</th>
                                        <th>Estado</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Pedido</th>
                                        <th>Estado</th>
                                    </>
                                )}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item._id}>
                                    <td className="tbl-num">{index + 1}</td>
                                    <td>
                                        <div className="tbl-cell-main">{getNombre(item)}</div>
                                        {esClientes && item.empresa && <div className="tbl-cell-sub">{item.empresa}</div>}
                                        {!esClientes && item.nombreTienda && <div className="tbl-cell-sub">{item.nombreTienda}</div>}
                                    </td>
                                    <td className="tbl-email">{item.email}</td>
                                    <td className="tbl-phone">{item.telefono || "Sin teléfono"}</td>
                                    {esClientes ? (
                                        <>
                                            <td style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                                                {getSector(item)}
                                            </td>
                                            <td>{getEstadoBadge(item)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{Number(item.pedidosCount || 0)} pedido{Number(item.pedidosCount || 0) !== 1 ? "s" : ""}</td>
                                            <td>{getEstadoBadge(item)}</td>
                                        </>
                                    )}
                                    <td className="tbl-actions">
                                        {!isVendedor && (
                                            <button title="Actualizar" className="tbl-icon-btn gray" onClick={() => navigate(`/dashboard/actualizar/${item._id}`, { state: { tipo } })}>
                                                <MdPublishedWithChanges size={20} />
                                            </button>
                                        )}
                                        <button title="M?s informaci?n" className="tbl-icon-btn blue" onClick={() => navigate(`/dashboard/visualizar/${item._id}`, { state: { tipo } })}>
                                            <MdInfo size={20} />
                                        </button>
                                        <button title="Eliminar" className="tbl-icon-btn red" onClick={() => pedirConfirmacion(item)}>
                                            <MdDeleteForever size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="tbl-cards" style={{ padding: "0.75rem" }}>
                    {data.map((item, index) => (
                        <div key={item._id} className="tbl-card">
                            <div className="tbl-card-num">#{index + 1}</div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Nombre</span>
                                <span className="tbl-card-value">{getNombre(item)}</span>
                            </div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Email</span>
                                <span className="tbl-card-value" style={{ fontSize: "0.78rem" }}>{item.email}</span>
                            </div>
                            <div className="tbl-card-row">
                                <span className="tbl-card-label">Teléfono</span>
                                <span className="tbl-card-value">{item.telefono || "Sin teléfono"}</span>
                            </div>
                            {esClientes ? (
                                <>
                                    {getSector(item) && (
                                        <div className="tbl-card-row">
                                            <span className="tbl-card-label">Sector</span>
                                            <span className="tbl-card-value">{getSector(item)}</span>
                                        </div>
                                    )}
                                    <div className="tbl-card-row">
                                        <span className="tbl-card-label">Estado</span>
                                        {getEstadoBadge(item)}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="tbl-card-row">
                                        <span className="tbl-card-label">Pedido</span>
                                        <span className="tbl-card-value">{Number(item.pedidosCount || 0)} pedido{Number(item.pedidosCount || 0) !== 1 ? "s" : ""}</span>
                                    </div>
                                    <div className="tbl-card-row">
                                        <span className="tbl-card-label">Estado</span>
                                        {getEstadoBadge(item)}
                                    </div>
                                </>
                            )}
                            <div className="tbl-card-actions">
                                {!isVendedor && (
                                    <button title="Actualizar" className="tbl-icon-btn gray" onClick={() => navigate(`/dashboard/actualizar/${item._id}`, { state: { tipo } })}>
                                        <MdPublishedWithChanges size={22} />
                                    </button>
                                )}
                                <button title="Ver" className="tbl-icon-btn blue" onClick={() => navigate(`/dashboard/visualizar/${item._id}`, { state: { tipo } })}>
                                    <MdInfo size={22} />
                                </button>
                                <button title="Eliminar" className="tbl-icon-btn red" onClick={() => pedirConfirmacion(item)}>
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
