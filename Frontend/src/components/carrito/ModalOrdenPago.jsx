import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/useFetch.js'
import storeProfile from '../../context/storeProfile'
import deUnaQr from '../../assets/qr.jpeg'

const IVA = 0.12
const fmt = (n) => `$${Number(n).toFixed(2)}`
const CAVA_COORDS = [-0.28916521175994486, -78.5384308610558]
const LEAFLET_CSS_ID = 'leaflet-css'
const LEAFLET_SCRIPT_ID = 'leaflet-js'
const limpiarTexto = (value) => String(value ?? '').trim()
const soloDigitos = (value) => String(value ?? '').replace(/\D/g, '')
const numeroSeguro = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

const metodosCliente = [
    { value: 'Stripe', label: 'Tarjeta', helper: 'Pago con tarjeta mediante pasarela segura.' },
    { value: 'De Una', label: 'De Una', helper: 'Escanea el QR y confirma tu pago.' },
]

const metodosVendedor = [
    { value: 'Transferencia Bancaria', label: 'Transferencia', helper: 'Registra una transferencia bancaria.' },
    { value: 'Efectivo', label: 'Efectivo', helper: 'Pago manual recibido por vendedor.' },
    { value: 'De Una', label: 'De Una', helper: 'Pago con QR para confirmar la compra.' },
]

const cargarLeaflet = () => new Promise((resolve, reject) => {
    if (window.L) {
        resolve(window.L)
        return
    }

    if (!document.getElementById(LEAFLET_CSS_ID)) {
        const link = document.createElement('link')
        link.id = LEAFLET_CSS_ID
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
    }

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID)
    if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L), { once: true })
        existingScript.addEventListener('error', reject, { once: true })
        return
    }

    const script = document.createElement('script')
    script.id = LEAFLET_SCRIPT_ID
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
})

const agregarCanvasPaginado = (pdf, canvas) => {
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgH = canvas.height * (pdfW / canvas.width)
    const imgData = canvas.toDataURL('image/png')

    let remainingHeight = imgH
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH)
    remainingHeight -= pdfH

    while (remainingHeight > 0) {
        position -= pdfH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH)
        remainingHeight -= pdfH
    }
}

const modalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

    :root {
        --orange: #e8760a;
        --orange-dark: #c4620a;
        --orange-light: #fde8ce;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-400: #9ca3af;
        --gray-600: #4b5563;
        --gray-800: #1f2937;
        --gray-900: #111827;
    }

    /* ── Overlay ── */
    .mop-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        z-index: 900;
        backdrop-filter: blur(2px);
    }

    /* ── Modal container ── */
    .mop-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(740px, 96vw);
        max-height: 92vh;
        background: var(--gray-100);
        border-radius: 1.25rem;
        box-shadow: 0 24px 80px rgba(0,0,0,0.35);
        z-index: 901;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', system-ui, sans-serif;
    }

    /* ── Modal header ── */
    .mop-header {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 1.1rem 1.5rem;
        background: var(--gray-800);
        flex-shrink: 0;
    }
    .mop-header-icon {
        width: 38px;
        height: 38px;
        background: var(--orange);
        border-radius: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
    }
    .mop-header-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        line-height: 1.2;
    }
    .mop-header-sub {
        font-size: 0.75rem;
        color: var(--gray-400);
        margin: 0;
    }
    .mop-close {
        margin-left: auto;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 0.5rem;
        color: #d1d5db;
        font-size: 1rem;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
    }
    .mop-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

    /* ── Scrollable body ── */
    .mop-body {
        flex: 1;
        min-height: 0;
        max-height: calc(92vh - 142px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .mop-body::-webkit-scrollbar { width: 10px; }
    .mop-body::-webkit-scrollbar-track { background: var(--gray-100); }
    .mop-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; border: 2px solid var(--gray-100); }
    .mop-body::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

    /* ── Footer ── */
    .mop-footer {
        padding: 0.875rem 1.25rem;
        background: var(--gray-50);
        border-top: 1px solid var(--gray-200);
        display: flex;
        gap: 0.625rem;
        justify-content: flex-end;
        flex-shrink: 0;
        flex-wrap: wrap;
    }

    /* ── Form cards ── */
    .op-card {
        background: #fff;
        border-radius: 0.875rem;
        border: 1px solid var(--gray-200);
        overflow: hidden;
    }
    .op-section-title {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gray-400);
        padding: 0.75rem 1.25rem 0.4rem;
        background: var(--gray-50);
        border-bottom: 1px solid var(--gray-200);
    }
    .op-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.875rem 1rem;
        padding: 1rem 1.25rem;
    }
    .op-field { display: flex; flex-direction: column; gap: 0.25rem; }
    .op-field.full { grid-column: 1 / -1; }
    .op-label {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--gray-600);
    }
    .op-input, .op-select {
        padding: 0.5rem 0.8rem;
        border: 1.5px solid var(--gray-200);
        border-radius: 0.55rem;
        font-size: 0.875rem;
        font-family: 'DM Sans', sans-serif;
        color: var(--gray-900);
        background: var(--gray-50);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        width: 100%;
        box-sizing: border-box;
    }
    .op-input:focus, .op-select:focus {
        border-color: var(--orange);
        box-shadow: 0 0 0 3px rgba(232,118,10,0.1);
        background: #fff;
    }
    .op-input.error { border-color: #ef4444; }
    .op-error-msg { font-size: 0.68rem; color: #ef4444; }
    .op-pay-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
        padding: 0.875rem 1.25rem;
    }
    .op-pay-card {
        border: 1.5px solid var(--gray-200);
        border-radius: 0.75rem;
        background: var(--gray-50);
        padding: 0.85rem;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .op-pay-card:hover { border-color: var(--orange); background: #fff; }
    .op-pay-card.active {
        border-color: var(--orange);
        background: #fff7ed;
        box-shadow: 0 0 0 3px rgba(232,118,10,0.12);
    }
    .op-pay-title { display: block; font-size: 0.86rem; font-weight: 800; color: var(--gray-900); margin-bottom: 0.25rem; }
    .op-pay-helper { display: block; font-size: 0.72rem; line-height: 1.35; color: var(--gray-600); }
    .op-qr-box {
        margin: 0 1.25rem 1rem;
        border: 1.5px solid var(--gray-200);
        border-radius: 0.875rem;
        background: #fff;
        padding: 1rem;
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 1rem;
        align-items: center;
    }
    .op-qr-box img { width: 140px; height: 140px; object-fit: contain; border-radius: 0.5rem; border: 1px solid var(--gray-100); }
    .op-qr-box strong { display: block; color: var(--gray-900); margin-bottom: 0.35rem; }
    .op-qr-box p { margin: 0; color: var(--gray-600); font-size: 0.8rem; line-height: 1.45; }

    /* ── Mapa collapsible ── */
    .mop-mapa-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.65rem 1.25rem;
        background: none;
        border: none;
        border-top: 1px solid var(--gray-200);
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--orange);
        font-family: 'DM Sans', sans-serif;
        transition: background 0.15s;
    }
    .mop-mapa-toggle:hover { background: var(--gray-50); }
    .mop-mapa-chevron { margin-left: auto; font-size: 0.6rem; transition: transform 0.2s; }
    .mop-mapa-chevron.open { transform: rotate(180deg); }
    .mop-mapa-body {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.3s ease;
    }
    .mop-mapa-body.open { max-height: 340px; }
    .mop-mapa-iframe-wrap {
        padding: 0.75rem 1.25rem 1rem;
        border-top: 1px solid var(--gray-100);
    }
    .mop-mapa-iframe-wrap iframe {
        width: 100%;
        height: 260px;
        border: 1.5px solid var(--gray-200);
        border-radius: 0.625rem;
        display: block;
    }
    .mop-map-canvas {
        width: 100%;
        height: 260px;
        border: 1.5px solid var(--gray-200);
        border-radius: 0.625rem;
        overflow: hidden;
        background: var(--gray-100);
    }

    /* ── Items table ── */
    .mop-items-header {
        display: grid;
        grid-template-columns: 1fr 64px 86px 86px;
        gap: 0.5rem;
        padding: 0.55rem 1.25rem;
        background: var(--gray-50);
        border-bottom: 1px solid var(--gray-200);
        border-top: 1px solid var(--gray-200);
    }
    .mop-items-header span {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--gray-400);
    }
    .mop-item-row {
        display: grid;
        grid-template-columns: 1fr 64px 86px 86px;
        gap: 0.5rem;
        align-items: center;
        padding: 0.55rem 1.25rem;
        border-bottom: 1px solid var(--gray-100);
        font-size: 0.82rem;
    }
    .mop-item-row:last-child { border-bottom: none; }
    .mop-items-scroll {
        max-height: 260px;
        overflow-y: auto;
    }

    /* ── Totals ── */
    .op-totales {
        padding: 0.875rem 1.25rem;
        border-top: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        align-items: flex-end;
    }
    .op-total-row {
        display: flex;
        gap: 2.5rem;
        font-size: 0.82rem;
        color: var(--gray-600);
    }
    .op-total-row span:last-child {
        font-family: 'DM Mono', monospace;
        min-width: 80px;
        text-align: right;
    }
    .op-total-row.grand {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--gray-900);
        border-top: 1.5px solid var(--gray-200);
        padding-top: 0.4rem;
        margin-top: 0.2rem;
    }

    /* ── Action buttons ── */
    .op-btn-reset {
        padding: 0.6rem 1.1rem;
        background: none;
        border: 1.5px solid var(--gray-200);
        border-radius: 0.55rem;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        color: var(--gray-600);
        cursor: pointer;
        transition: background 0.15s;
    }
    .op-btn-reset:hover { background: var(--gray-100); }

    .op-btn-pdf {
        padding: 0.6rem 1.1rem;
        background: var(--orange);
        border: none;
        border-radius: 0.55rem;
        font-size: 0.875rem;
        font-weight: 700;
        font-family: 'DM Sans', sans-serif;
        color: #fff;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        box-shadow: 0 3px 10px rgba(232,118,10,0.28);
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .op-btn-pdf:hover { background: var(--orange-dark); transform: translateY(-1px); }
    .op-btn-pdf:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* ── PDF template (off-screen) ── */
    .pdf-template {
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        background: #fff;
        padding: 48px 56px;
        box-sizing: border-box;
        font-family: 'DM Sans', sans-serif;
        z-index: -1;
    }
    .pdf-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e8760a;
    }
    .pdf-brand { display: flex; flex-direction: column; gap: 2px; }
    .pdf-brand-name { font-size: 1.5rem; font-weight: 900; color: #111827; letter-spacing: -0.02em; }
    .pdf-brand-name span { color: #e8760a; }
    .pdf-brand-sub { font-size: 0.7rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; }
    .pdf-meta { text-align: right; }
    .pdf-meta-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .pdf-meta-num { font-size: 0.8rem; color: #9ca3af; font-family: 'DM Mono', monospace; }
    .pdf-meta-date { font-size: 0.72rem; color: #9ca3af; margin-top: 2px; }
    .pdf-parties {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 24px;
    }
    .pdf-party-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 5px; }
    .pdf-party-name { font-size: 0.95rem; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .pdf-party-detail { font-size: 0.78rem; color: #6b7280; line-height: 1.5; }
    .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .pdf-table th {
        font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
        color: #fff; background: #1f2937; padding: 7px 10px; text-align: left;
    }
    .pdf-table th:last-child, .pdf-table td:last-child { text-align: right; }
    .pdf-table th:nth-child(2), .pdf-table td:nth-child(2) { text-align: center; }
    .pdf-table th:nth-child(3), .pdf-table td:nth-child(3) { text-align: right; }
    .pdf-table td { padding: 8px 10px; font-size: 0.8rem; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .pdf-table tr:nth-child(even) td { background: #f9fafb; }
    .pdf-totals { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-bottom: 28px; }
    .pdf-total-row { display: flex; gap: 60px; font-size: 0.8rem; color: #6b7280; }
    .pdf-total-row span:last-child { font-family: 'DM Mono', monospace; min-width: 80px; text-align: right; }
    .pdf-total-row.grand { font-size: 0.9rem; font-weight: 700; color: #111827; border-top: 1.5px solid #e5e7eb; padding-top: 5px; margin-top: 3px; }
    .pdf-footer { border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .pdf-footer-note { font-size: 0.7rem; color: #9ca3af; max-width: 60%; line-height: 1.5; }
    .pdf-footer-stamp {
        font-size: 0.68rem; color: #e8760a; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; border: 2px solid #e8760a; padding: 5px 12px; border-radius: 5px;
    }

    @keyframes mop-spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
        .op-grid { grid-template-columns: 1fr; }
        .op-field.full { grid-column: 1; }
        .mop-items-header, .mop-item-row { grid-template-columns: 1fr 50px 70px 70px; }
    }
`;

const ModalOrdenPago = ({
    tipoEntrega,
    cartItems = [],
    subtotalCart = 0,
    onClose,
    onOrdenCreada,
    onNeedStripe,
}) => {
    const { fetchDataBackend } = useFetch()
    const { user } = storeProfile()
    const [form, setForm] = useState({ nombre: '', apellido: '', ruc: '', email: '', telefono: '', direccion: '' })
    const isVendedor = user?.rol === 'vendedor'
    const metodosPago = isVendedor ? metodosVendedor : metodosCliente
    const [metodoPago, setMetodoPago] = useState(metodosPago[0].value)
    const [direccionDomicilio, setDireccionDomicilio] = useState('CAVA CORP — Almacenes Intex')
    const [mapaVisible, setMapaVisible] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [loadingPdf, setLoadingPdf] = useState(false)
    const [errors, setErrors] = useState({})
    const pdfRef = useRef(null)
    const mapContainerRef = useRef(null)
    const leafletMapRef = useRef(null)

    const iva = subtotalCart * IVA
    const total = subtotalCart + iva

    const numeroOrden = `OP-${String(Date.now()).slice(-6)}`
    const fechaHoy = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })

    useEffect(() => {
        if (!metodosPago.some((m) => m.value === metodoPago)) {
            setMetodoPago(metodosPago[0].value)
        }
    }, [metodoPago, metodosPago])

    const handleForm = (e) => {
        const { name, value } = e.target
        const nextValue = ['ruc', 'telefono'].includes(name) ? soloDigitos(value) : String(value ?? '')
        setForm(f => ({ ...f, [name]: nextValue }))
        setErrors(er => ({ ...er, [name]: '' }))
    }

    useEffect(() => {
        if (!mapaVisible || !mapContainerRef.current) return

        let cancelled = false

        cargarLeaflet()
            .then((L) => {
                if (cancelled || !mapContainerRef.current) return

                if (!leafletMapRef.current) {
                    leafletMapRef.current = L.map(mapContainerRef.current, {
                        scrollWheelZoom: false,
                    }).setView(CAVA_COORDS, 17)

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap',
                    }).addTo(leafletMapRef.current)

                    L.marker(CAVA_COORDS)
                        .addTo(leafletMapRef.current)
                        .bindPopup('CAVA CORP - Almacenes Intex')
                        .openPopup()
                }

                setTimeout(() => leafletMapRef.current?.invalidateSize(), 80)
            })
            .catch(() => {
                toast.error('No se pudo cargar el mapa con Leaflet.')
            })

        return () => {
            cancelled = true
        }
    }, [mapaVisible])

    const validate = () => {
        const errs = {}
        const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const documentoValido = /^(\d{10}|\d{13})$/
        const telefonoValido = /^0\d{8,9}$/
        const itemsValidos = cartItems.every((it) => {
            const cantidad = Number(it?.cantidad)
            const precio = Number(it?.producto?.precio)
            return Number.isInteger(cantidad) && cantidad > 0 && Number.isFinite(precio) && precio >= 0
        })

        if (!soloLetras.test(form.nombre.trim()))   errs.nombre   = 'Ingresa al menos 2 letras'
        if (!soloLetras.test(form.apellido.trim())) errs.apellido  = 'Ingresa al menos 2 letras'
        if (!documentoValido.test(form.ruc.trim())) errs.ruc       = 'Usa cédula de 10 dígitos o RUC de 13'
        if (!emailValido.test(form.email.trim()))   errs.email     = 'Correo inválido'
        if (form.telefono.trim() && !telefonoValido.test(form.telefono.trim())) errs.telefono = 'Teléfono inválido'
        if (!form.direccion.trim()) errs.direccion = 'Ingresa la dirección de facturación'
        if (tipoEntrega === 'domicilio' && !direccionDomicilio) errs.mapaDireccion = 'Selecciona tu dirección en el mapa'
        if (!itemsValidos) errs.items = 'Hay productos con cantidad o precio invalido'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const generarPDF = async () => {
        setLoadingPdf(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ])
            const el = pdfRef.current
            el.style.left = '0'
            el.style.visibility = 'hidden'
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
            el.style.left = '-9999px'
            el.style.visibility = 'visible'
            const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' })
            agregarCanvasPaginado(pdf, canvas)
            pdf.save(`orden-pago-${Date.now()}.pdf`)
        } catch (err) {
            console.error(err)
            toast.error('Error al generar el PDF.')
        }
        setLoadingPdf(false)
    }

    const handleConfirmar = async () => {
        if (!validate()) return
        setIsCreating(true)

        const datosFacturacion = {
            nombre: limpiarTexto(form.nombre),
            apellido: limpiarTexto(form.apellido),
            correo: limpiarTexto(form.email).toLowerCase(),
            direccion: limpiarTexto(form.direccion || direccionDomicilio),
            ruc: soloDigitos(form.ruc),
            telefono: soloDigitos(form.telefono),
        }

        const direccionEnvio = tipoEntrega === 'domicilio'
            ? { direccion: limpiarTexto(direccionDomicilio), ciudad: 'N/A', provincia: 'N/A', codigoPostal: '000000', pais: 'Ecuador' }
            : { direccion: 'Retiro en almacenes' + (form.direccion ? ' — ' + form.direccion : ''), ciudad: 'N/A', provincia: 'N/A', codigoPostal: '000000', pais: 'Ecuador' }

        if (tipoEntrega === 'retiro') {
            direccionEnvio.direccion = `Retiro en almacenes - ${datosFacturacion.direccion}`
        }

        const orderData = {
            direccionEnvio,
            metodoPago: limpiarTexto(metodoPago),
            tipoEntrega: limpiarTexto(tipoEntrega),
            datosFacturacion,
        }

        const response = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/ordenes`,
            orderData,
            'POST'
        )

        if (!response?.orden) {
            setIsCreating(false)
            return
        }

        const ordenRecien = response.orden

        if (metodoPago === 'Stripe') {
            setIsCreating(false)
            toast.success('Orden creada. Completa el pago con tarjeta.')
            onNeedStripe(ordenRecien)
            return
        }

        const pagoRes = await fetchDataBackend(
            `${import.meta.env.VITE_BACKEND_URL}/ordenes/pagar`,
            { ordenId: ordenRecien._id },
            'POST'
        )

        setIsCreating(false)

        if (pagoRes) {
            const msg = tipoEntrega === 'domicilio'
                ? '🚚 ¡Pedido enviado! Tu pedido está en camino.'
                : '🏪 ¡Pedido listo! Pasa a retirarlo en nuestros almacenes.'
            toast.success(msg)
            onOrdenCreada(ordenRecien, {
                nombre: form.nombre,
                apellido: form.apellido,
                correo: form.email,
                direccion: form.direccion || direccionDomicilio,
                ruc: form.ruc,
                telefono: form.telefono,
            })
        }
    }

    return (
        <>
            <style>{modalStyles}</style>

            {/* Backdrop */}
            <div className="mop-overlay" onClick={onClose} />

            {/* Modal */}
            <div className="mop-modal">

                {/* Header */}
                <div className="mop-header">
                    <div className="mop-header-icon">🧾</div>
                    <div>
                        <h2 className="mop-header-title">Orden de pago</h2>
                        <p className="mop-header-sub">
                            {tipoEntrega === 'domicilio' ? '🛵 Envío a domicilio' : '🏪 Retiro en almacenes'}
                        </p>
                    </div>
                    <button className="mop-close" onClick={onClose} type="button">✕</button>
                </div>

                {/* Scrollable body */}
                <div className="mop-body">

                    {/* Dirección de entrega (solo domicilio) */}
                    {tipoEntrega === 'domicilio' && (
                        <div className="op-card">
                            <div className="op-section-title">📍 Dirección de entrega</div>
                            <div style={{ padding: '0.875rem 1.25rem 0.5rem' }}>
                                <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:'0.6rem', padding:'0.6rem 1rem', fontSize:'0.875rem', color:'#166534', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                    📍 <span style={{ flex:1 }}>{direccionDomicilio}</span>
                                </div>
                                {errors.mapaDireccion && (
                                    <span className="op-error-msg" style={{ display:'block', marginTop:'0.4rem' }}>⚠ {errors.mapaDireccion}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mop-mapa-toggle"
                                onClick={() => setMapaVisible(v => !v)}
                            >
                                🗺 Ver ubicación en el mapa
                                <span className={`mop-mapa-chevron${mapaVisible ? ' open' : ''}`}>▼</span>
                            </button>
                            <div className={`mop-mapa-body${mapaVisible ? ' open' : ''}`}>
                                <div className="mop-mapa-iframe-wrap">
                                    <div
                                        ref={mapContainerRef}
                                        className="mop-map-canvas"
                                        aria-label="Ubicación CAVA CORP en Leaflet"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Datos de facturación */}
                    <div className="op-card">
                        <div className="op-section-title">Datos de facturación</div>
                        <div className="op-grid">
                            <div className="op-field">
                                <label className="op-label">Nombre</label>
                                <input className={`op-input${errors.nombre ? ' error' : ''}`} name="nombre" placeholder="Juan" value={form.nombre} onChange={handleForm} />
                                {errors.nombre && <span className="op-error-msg">⚠ {errors.nombre}</span>}
                            </div>
                            <div className="op-field">
                                <label className="op-label">Apellido</label>
                                <input className={`op-input${errors.apellido ? ' error' : ''}`} name="apellido" placeholder="García" value={form.apellido} onChange={handleForm} />
                                {errors.apellido && <span className="op-error-msg">⚠ {errors.apellido}</span>}
                            </div>
                            <div className="op-field">
                                <label className="op-label">RUC / Cédula</label>
                                <input className={`op-input${errors.ruc ? ' error' : ''}`} name="ruc" inputMode="numeric" maxLength={13} placeholder="1234567890001" value={form.ruc} onChange={handleForm} />
                                {errors.ruc && <span className="op-error-msg">⚠ {errors.ruc}</span>}
                            </div>
                            <div className="op-field">
                                <label className="op-label">Teléfono</label>
                                <input className={`op-input${errors.telefono ? ' error' : ''}`} name="telefono" inputMode="tel" maxLength={10} placeholder="0987654321" value={form.telefono} onChange={handleForm} />
                                {errors.telefono && <span className="op-error-msg">âš  {errors.telefono}</span>}
                            </div>
                            <div className="op-field full">
                                <label className="op-label">Correo electrónico</label>
                                <input className={`op-input${errors.email ? ' error' : ''}`} name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={handleForm} />
                                {errors.email && <span className="op-error-msg">⚠ {errors.email}</span>}
                            </div>
                            <div className="op-field full">
                                <label className="op-label">Dirección de facturación</label>
                                <input className={`op-input${errors.direccion ? ' error' : ''}`} name="direccion" placeholder="Av. Principal 123, ciudad" value={form.direccion} onChange={handleForm} />
                                {errors.direccion && <span className="op-error-msg">âš  {errors.direccion}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Productos del carrito */}
                    <div className="op-card">
                        <div className="op-section-title">Productos del carrito</div>
                        {errors.items && <span className="op-error-msg" style={{ display:'block', padding:'0.6rem 1.25rem 0' }}>âš  {errors.items}</span>}
                        <div className="mop-items-header">
                            <span>Producto</span>
                            <span style={{ textAlign:'center' }}>Cant.</span>
                            <span style={{ textAlign:'right' }}>P. unitario</span>
                            <span style={{ textAlign:'right' }}>Total</span>
                        </div>
                        <div className="mop-items-scroll">
                            {cartItems.map((it, i) => (
                                <div className="mop-item-row" key={i}>
                                    <span style={{ color:'#374151', fontWeight:600 }}>{it.producto?.nombre || 'Producto'}</span>
                                    <span style={{ textAlign:'center', color:'#6b7280' }}>{Math.trunc(numeroSeguro(it.cantidad))}</span>
                                    <span style={{ textAlign:'right', color:'#6b7280' }}>{fmt(numeroSeguro(it.producto?.precio))}</span>
                                    <span style={{ textAlign:'right', color:'#111827', fontWeight:700 }}>{fmt(numeroSeguro(it.producto?.precio) * Math.trunc(numeroSeguro(it.cantidad)))}</span>
                                </div>
                            ))}
                        </div>
                        <div className="op-totales">
                            <div className="op-total-row"><span>Subtotal</span><span>{fmt(subtotalCart)}</span></div>
                            <div className="op-total-row"><span>IVA (12%)</span><span>{fmt(iva)}</span></div>
                            <div className="op-total-row grand"><span>Total</span><span>{fmt(total)}</span></div>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="op-card">
                        <div className="op-section-title">Método de pago</div>
                        <div className="op-pay-grid">
                            {metodosPago.map((metodo) => (
                                <button
                                    type="button"
                                    key={metodo.value}
                                    className={`op-pay-card${metodoPago === metodo.value ? ' active' : ''}`}
                                    onClick={() => setMetodoPago(metodo.value)}
                                >
                                    <span className="op-pay-title">{metodo.label}</span>
                                    <span className="op-pay-helper">{metodo.helper}</span>
                                </button>
                            ))}
                        </div>
                        {metodoPago === 'De Una' && (
                            <div className="op-qr-box">
                                <img src={deUnaQr} alt="QR de pago De Una" />
                                <div>
                                    <strong>Pago con De Una</strong>
                                    <p>Escanea el QR, realiza el pago por el total mostrado y conserva el comprobante para validación.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer — acciones */}
                <div className="mop-footer">
                    <button className="op-btn-reset" onClick={onClose} type="button">Cancelar</button>
                    <button
                        className="op-btn-pdf"
                        onClick={generarPDF}
                        disabled={loadingPdf}
                        type="button"
                        style={{ background:'#374151', boxShadow:'none' }}
                    >
                        {loadingPdf ? '⏳ Generando...' : '📄 PDF orden de pago'}
                    </button>
                    <button className="op-btn-pdf" onClick={handleConfirmar} disabled={isCreating} type="button">
                        {isCreating ? (
                            <>
                                <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'mop-spin 0.7s linear infinite' }} />
                                Procesando...
                            </>
                        ) : '✅ Confirmar pedido'}
                    </button>
                </div>
            </div>

            {/* Plantilla oculta para el PDF */}
            <div ref={pdfRef} className="pdf-template">
                <div className="pdf-top">
                    <div className="pdf-brand">
                        <div className="pdf-brand-name"><span>IN</span>TEX</div>
                        <div className="pdf-brand-sub">Textiles</div>
                    </div>
                    <div className="pdf-meta">
                        <div className="pdf-meta-title">Orden de Pago</div>
                        <div className="pdf-meta-num">{numeroOrden}</div>
                        <div className="pdf-meta-date">{fechaHoy}</div>
                    </div>
                </div>

                <div className="pdf-parties">
                    <div>
                        <div className="pdf-party-label">Emisor</div>
                        <div className="pdf-party-name">Intex Textiles</div>
                        <div className="pdf-party-detail">
                            RUC: 1791234560001<br />
                            facturacion@intextextiles.com<br />
                            Ecuador
                        </div>
                    </div>
                    <div>
                        <div className="pdf-party-label">Facturar a</div>
                        <div className="pdf-party-name">{form.nombre || '—'} {form.apellido}</div>
                        <div className="pdf-party-detail">
                            {form.ruc && <>RUC/CI: {form.ruc}<br /></>}
                            {form.email && <>{form.email}<br /></>}
                            {form.telefono && <>{form.telefono}<br /></>}
                            {(form.direccion || direccionDomicilio) && <>{form.direccion || direccionDomicilio}</>}
                        </div>
                    </div>
                </div>

                <table className="pdf-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>P. unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((it, i) => (
                            <tr key={i}>
                                <td>{it.producto?.nombre || 'Producto'}</td>
                                <td style={{ textAlign:'center' }}>{Math.trunc(numeroSeguro(it.cantidad))}</td>
                                <td style={{ textAlign:'right' }}>{fmt(numeroSeguro(it.producto?.precio))}</td>
                                <td style={{ textAlign:'right' }}>{fmt(numeroSeguro(it.producto?.precio) * Math.trunc(numeroSeguro(it.cantidad)))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pdf-totals">
                    <div className="pdf-total-row"><span>Subtotal</span><span>{fmt(subtotalCart)}</span></div>
                    <div className="pdf-total-row"><span>IVA 12%</span><span>{fmt(iva)}</span></div>
                    <div className="pdf-total-row grand"><span>Total a pagar</span><span>{fmt(total)}</span></div>
                </div>

                <div className="pdf-footer">
                    <div className="pdf-footer-note">
                        Gracias por su confianza. Este documento es válido como orden de pago interna.<br />
                        Para consultas: facturacion@intextextiles.com
                    </div>
                    <div className="pdf-footer-stamp">Pendiente de pago</div>
                </div>
            </div>

        </>
    )
}

export default ModalOrdenPago
