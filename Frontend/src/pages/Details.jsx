import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import storeProfile from "../context/storeProfile";

const styles = `
    :root {
        --orange-main:   #e8760a;
        --orange-dark:   #c4620a;
        --orange-light:  #fde8ce;
        --orange-border: #f0943a;
    }
    .dtl-page {
        max-width: 800px;
    }
    /* ── Header ── */
    .dtl-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.75rem;
    }
    .dtl-header-left { display: flex; align-items: center; gap: 0.75rem; }
    .dtl-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #111827;
        margin: 0;
    }
    .dtl-subtitle {
        font-size: 0.8rem;
        color: #9ca3af;
        margin: 0.15rem 0 0;
    }
    .dtl-back-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 1rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        transition: background 0.13s, border-color 0.13s;
        text-decoration: none;
    }
    .dtl-back-btn:hover {
        background: #f9fafb;
        border-color: #d1d5db;
    }
    /* ── Hero card ── */
    .dtl-hero {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border-radius: 1rem;
        padding: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.14);
    }
    .dtl-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--orange-main);
        color: #fff;
        font-size: 2rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 3px solid var(--orange-border);
        box-shadow: 0 0 0 4px rgba(232,118,10,0.18);
    }
    .dtl-hero-name {
        font-size: 1.35rem;
        font-weight: 800;
        color: #f9fafb;
        margin: 0 0 0.35rem;
    }
    .dtl-hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
    }
    .dtl-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.22rem 0.7rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
    }
    .dtl-badge.activo    { background: #d1fae5; color: #065f46; }
    .dtl-badge.inactivo  { background: #fee2e2; color: #991b1b; }
    .dtl-badge.pendiente { background: #fef3c7; color: #92400e; }
    .dtl-badge.cliente   { background: #dbeafe; color: #1e40af; }
    .dtl-badge.vendedor  { background: var(--orange-light); color: #92400e; }
    .dtl-badge.email-ok  { background: #d1fae5; color: #065f46; }
    .dtl-badge.email-no  { background: #fee2e2; color: #991b1b; }
    /* ── Info card ── */
    .dtl-card {
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        overflow: hidden;
        margin-bottom: 1.25rem;
    }
    .dtl-card-header {
        background: #f9fafb;
        border-bottom: 1px solid #f3f4f6;
        padding: 0.9rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .dtl-card-title {
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #6b7280;
        margin: 0;
    }
    .dtl-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
    }
    .dtl-field {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f3f4f6;
    }
    .dtl-field:nth-child(odd)  { border-right: 1px solid #f3f4f6; }
    .dtl-field:nth-last-child(1),
    .dtl-field:nth-last-child(2) { border-bottom: none; }
    .dtl-field-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #9ca3af;
        margin: 0 0 0.3rem;
    }
    .dtl-field-value {
        font-size: 0.9rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
        word-break: break-word;
    }
    .dtl-field-empty { color: #d1d5db; font-style: italic; }
    /* ── Loading ── */
    .dtl-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        color: #9ca3af;
        font-size: 0.9rem;
        gap: 0.75rem;
    }
    .dtl-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #f3f4f6;
        border-top-color: var(--orange-main);
        border-radius: 50%;
        animation: dtl-spin 0.7s linear infinite;
    }
    @keyframes dtl-spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) {
        .dtl-grid { grid-template-columns: 1fr; }
        .dtl-field:nth-child(odd) { border-right: none; }
        .dtl-field:nth-last-child(2) { border-bottom: 1px solid #f3f4f6; }
        .dtl-hero { flex-direction: column; text-align: center; }
        .dtl-hero-meta { justify-content: center; }
    }
`;

const Details = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = storeProfile();
    const isVendedor = user?.rol === 'vendedor';

    const [entityDetails, setEntityDetails] = useState(null);
    const { fetchDataBackend } = useFetch();

    const getEntityDetails = async () => {
        if (!user?.rol) return;
        try {
            const entityType = isVendedor ? 'clientes' : 'vendedores';
            const url = `${import.meta.env.VITE_BACKEND_URL}/${entityType}/${id}`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            if (!storedUser?.state?.token) { toast.error("No estás autenticado."); return; }
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };
            const response = await fetchDataBackend(url, null, "GET", headers);
            if (response) setEntityDetails(response);
        } catch {
            toast.error("No se pudieron cargar los datos.");
        }
    };

    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        });
    };

    useEffect(() => {
        getEntityDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user?.rol]);

    const entityLabel = isVendedor ? 'cliente' : 'vendedor';

    // ── Loading ──────────────────────────────────────────────
    if (!entityDetails) {
        return (
            <>
                <style>{styles}</style>
                <div className="dtl-loading">
                    <div className="dtl-spinner" />
                    <span>Cargando información...</span>
                </div>
            </>
        );
    }

    const initial = (entityDetails.nombre || '?').charAt(0).toUpperCase();
    const fullName = `${entityDetails.nombre || ''} ${entityDetails.apellido || ''}`.trim();
    const rol = entityDetails.rol || entityLabel;

    const statusKey = (() => {
        const s = entityDetails.status;
        if (s === true || s === 'activo') return 'activo';
        if (s === 'pendiente') return 'pendiente';
        return 'inactivo';
    })();
    const statusLabel = (() => {
        const s = entityDetails.status;
        if (s === true) return 'Activo';
        if (s === false) return 'Inactivo';
        if (typeof s === 'string') return s.charAt(0).toUpperCase() + s.slice(1);
        return 'N/A';
    })();

    // ── Render ───────────────────────────────────────────────
    return (
        <>
            <style>{styles}</style>

            <div className="dtl-page">

                {/* Header */}
                <div className="dtl-header">
                    <div className="dtl-header-left">
                        <div>
                            <p className="dtl-title">Detalle de {entityLabel}</p>
                            <p className="dtl-subtitle">Información completa del registro</p>
                        </div>
                    </div>
                    <button className="dtl-back-btn" onClick={() => navigate(-1)}>
                        ← Volver
                    </button>
                </div>

                {/* Hero */}
                <div className="dtl-hero">
                    <div className="dtl-avatar">{initial}</div>
                    <div>
                        <p className="dtl-hero-name">{fullName || 'Sin nombre'}</p>
                        <div className="dtl-hero-meta">
                            <span className={`dtl-badge ${rol === 'vendedor' ? 'vendedor' : 'cliente'}`}>
                                {rol === 'vendedor' ? '🏪 Vendedor' : '👤 Cliente'}
                            </span>
                            <span className={`dtl-badge ${statusKey}`}>
                                {statusLabel}
                            </span>
                            {entityDetails.confirmEmail !== undefined && (
                                <span className={`dtl-badge ${entityDetails.confirmEmail ? 'email-ok' : 'email-no'}`}>
                                    {entityDetails.confirmEmail ? '✅ Email verificado' : '⚠️ Email sin verificar'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data card */}
                <div className="dtl-card">
                    <div className="dtl-card-header">
                        <span>📋</span>
                        <p className="dtl-card-title">Información de contacto</p>
                    </div>
                    <div className="dtl-grid">
                        <div className="dtl-field">
                            <p className="dtl-field-label">Nombre</p>
                            <p className="dtl-field-value">{entityDetails.nombre || <span className="dtl-field-empty">—</span>}</p>
                        </div>
                        <div className="dtl-field">
                            <p className="dtl-field-label">Apellido</p>
                            <p className="dtl-field-value">{entityDetails.apellido || <span className="dtl-field-empty">—</span>}</p>
                        </div>
                        <div className="dtl-field">
                            <p className="dtl-field-label">Correo electrónico</p>
                            <p className="dtl-field-value">{entityDetails.email || <span className="dtl-field-empty">—</span>}</p>
                        </div>
                        <div className="dtl-field">
                            <p className="dtl-field-label">Teléfono</p>
                            <p className="dtl-field-value">{entityDetails.telefono || <span className="dtl-field-empty">No registrado</span>}</p>
                        </div>
                        <div className="dtl-field">
                            <p className="dtl-field-label">Dirección</p>
                            <p className="dtl-field-value">{entityDetails.direccion || <span className="dtl-field-empty">No registrada</span>}</p>
                        </div>
                        {entityDetails.createdAt && (
                            <div className="dtl-field">
                                <p className="dtl-field-label">Fecha de registro</p>
                                <p className="dtl-field-value">{formatDate(entityDetails.createdAt)}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}

export default Details;
