/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';

const IVA = 0.15;
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const canalPago = (metodo = '') => {
    const value = String(metodo).toLowerCase();
    if (value.includes('de una')) return 'Canal: De Una (QR)';
    if (value.includes('tarjeta en linea') || value.includes('stripe')) return 'Canal: Stripe / tarjeta en linea';
    if (value.includes('efectivo') || value.includes('debito')) return 'Canal: efectivo / tarjeta debito';
    return 'Canal: N/D';
};

const normalizarItemsOrden = (orden) => {
    const source = orden?.productoPedido ?? orden?.items ?? [];
    return source.map((it) => ({
        nombre: it.nombre ?? it.descripcion ?? it.producto?.nombre ?? 'Producto',
        cantidad: Number(it.cantidad || 1),
        precio: Number(it.precio ?? it.precioUnitario ?? it.producto?.precio ?? 0),
        unidad: it.unidadSeleccionada ?? null,
        subtotal: Number(it.subtotal ?? 0),
    }));
};

const tplStyles = `
    .fpdf-btn {
        padding: 0.6rem 1.25rem;
        background: #1f2937;
        color: #fff;
        border: none;
        border-radius: 0.6rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        box-shadow: 0 3px 8px rgba(0,0,0,0.2);
    }
    .fpdf-btn:hover:not(:disabled) { background: #374151; transform: translateY(-1px); }
    .fpdf-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Plantilla oculta PDF ── */
    .fpdf-tpl {
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        background: #ffffff;
        padding: 48px 56px;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
        font-size: 14px;
        line-height: 1.5;
    }
    .fpdf-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 3px solid #e8760a;
    }
    .fpdf-brand-name { font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -0.02em; }
    .fpdf-brand-name span { color: #e8760a; }
    .fpdf-brand-sub { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
    .fpdf-doc-title { font-size: 20px; font-weight: 700; color: #111827; text-align: right; }
    .fpdf-doc-num { font-size: 13px; color: #9ca3af; text-align: right; margin-top: 4px; font-family: 'Courier New', monospace; }
    .fpdf-doc-date { font-size: 12px; color: #9ca3af; text-align: right; margin-top: 2px; }
    .fpdf-parties { display: flex; gap: 40px; margin-bottom: 28px; }
    .fpdf-party { flex: 1; }
    .fpdf-party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 6px; }
    .fpdf-party-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 3px; }
    .fpdf-party-detail { font-size: 12px; color: #6b7280; line-height: 1.7; }
    table.fpdf-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table.fpdf-table th {
        font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
        color: #fff; background: #1f2937; padding: 10px 12px; text-align: left;
    }
    table.fpdf-table th:nth-child(2) { text-align: center; }
    table.fpdf-table th:nth-child(3) { text-align: right; }
    table.fpdf-table th:nth-child(4) { text-align: right; }
    table.fpdf-table td { padding: 9px 12px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    table.fpdf-table tr:nth-child(even) td { background: #f9fafb; }
    table.fpdf-table td:nth-child(2) { text-align: center; }
    table.fpdf-table td:nth-child(3) { text-align: right; font-family: 'Courier New', monospace; }
    table.fpdf-table td:nth-child(4) { text-align: right; font-weight: 700; color: #111827; font-family: 'Courier New', monospace; }
    .fpdf-totals { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-bottom: 32px; }
    .fpdf-total-row { display: flex; gap: 80px; font-size: 13px; color: #6b7280; }
    .fpdf-total-row span:last-child { font-family: 'Courier New', monospace; min-width: 100px; text-align: right; }
    .fpdf-total-row.grand { font-size: 15px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 8px; margin-top: 4px; }
    .fpdf-footer {
        border-top: 1px solid #e5e7eb;
        padding-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .fpdf-footer-note { font-size: 11px; color: #9ca3af; max-width: 60%; line-height: 1.7; }
    .fpdf-footer-stamp {
        font-size: 11px; color: #e8760a; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; border: 2px solid #e8760a; padding: 6px 14px; border-radius: 6px;
    }
`;

const FacturaPDF = ({ orden, facturacion, label = 'Descargar factura' }) => {
    const [loading, setLoading] = useState(false);
    const pdfRef = useRef(null);

    const items = normalizarItemsOrden(orden);
    const subtotal = orden?.subtotal ?? items.reduce((s, it) => s + (it.subtotal || (it.precio * it.cantidad)), 0);
    const descuentoTotal = orden?.descuentoTotal ?? 0;
    const subtotalBruto = subtotal + descuentoTotal;
    const iva = orden?.iva ?? subtotal * IVA;
    const envio = orden?.envio ?? 0;
    const comisionPago = orden?.comisionPago ?? 0;
    const total = orden?.totalFinal ?? (subtotal + iva + envio + comisionPago);

    const nombreCliente = facturacion
        ? `${facturacion.nombre || ''} ${facturacion.apellido || ''}`.trim()
        : `${orden?.cliente?.nombre || ''} ${orden?.cliente?.apellido || ''}`.trim();
    const correoCliente = facturacion?.correo || orden?.cliente?.email || '';
    const direccionCliente = facturacion?.direccion || orden?.direccionEnvio?.direccion || '';
    const rucCliente = facturacion?.ruc || orden?.datosFacturacion?.ruc || '';
    const telefonoCliente = facturacion?.telefono || orden?.datosFacturacion?.telefono || '';

    const fechaDoc = new Date(orden?.createdAt || Date.now()).toLocaleDateString('es-EC', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const numeroOrden = orden?.codigoOrden || orden?._id?.slice(-8).toUpperCase() || `OP-${String(Date.now()).slice(-6)}`;

    const estadoLabel = (s) => {
        const map = { entregado: 'Entregado', pagado: 'Pagado', procesando: 'En proceso', enviado: 'Enviado', listo: 'Listo para retiro' };
        return map[s] || 'Pendiente de pago';
    };

    const generarPDF = async () => {
        setLoading(true);
        try {
            const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
            const pageW = pdf.internal.pageSize.getWidth();
            let y = 48;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(24);
            pdf.setTextColor(17, 24, 39);
            pdf.text('INTEX', 48, y);
            pdf.setFontSize(16);
            pdf.text('Factura', pageW - 48, y, { align: 'right' });
            y += 18;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.text('Textiles', 48, y);
            pdf.text(`#${numeroOrden}`, pageW - 48, y, { align: 'right' });
            y += 10;
            pdf.text(fechaDoc, pageW - 48, y, { align: 'right' });
            y += 24;
            pdf.setDrawColor(232, 118, 10);
            pdf.setLineWidth(2);
            pdf.line(48, y, pageW - 48, y);
            y += 28;

            pdf.setTextColor(17, 24, 39);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text('Emisor', 48, y);
            pdf.text('Facturar a', 310, y);
            y += 16;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(75, 85, 99);
            pdf.text(['Intex Textiles', 'RUC: 1791234560001', 'Ecuador'], 48, y);
            pdf.text([
                nombreCliente || 'Sin cliente',
                rucCliente ? `RUC/CI: ${rucCliente}` : '',
                correoCliente,
                telefonoCliente,
                direccionCliente,
            ].filter(Boolean), 310, y);
            y += 78;

            pdf.setFillColor(31, 41, 55);
            pdf.rect(48, y, pageW - 96, 24, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Descripcion', 60, y + 16);
            pdf.text('Cant.', 300, y + 16, { align: 'center' });
            pdf.text('P. unitario', 410, y + 16, { align: 'right' });
            pdf.text('Total', pageW - 60, y + 16, { align: 'right' });
            y += 24;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(55, 65, 81);
            const rows = items.length ? items : [{ nombre: 'Sin items', cantidad: 0, precio: 0, subtotal: 0 }];
            rows.forEach((it, idx) => {
                if (y > 730) {
                    pdf.addPage();
                    y = 48;
                }
                if (idx % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(48, y, pageW - 96, 22, 'F');
                }
                pdf.text(String(it.nombre).slice(0, 42), 60, y + 15);
                pdf.text(`${it.cantidad}${it.unidad ? ` ${it.unidad}` : ''}`, 300, y + 15, { align: 'center' });
                pdf.text(fmt(it.precio), 410, y + 15, { align: 'right' });
                pdf.text(fmt(it.subtotal || it.precio * it.cantidad), pageW - 60, y + 15, { align: 'right' });
                y += 22;
            });
            y += 24;

            const totalRows = [
                ['Subtotal bruto', subtotalBruto],
                ...(descuentoTotal > 0 ? [['Descuentos', -descuentoTotal]] : []),
                ['Subtotal', subtotal],
                ['IVA (15%)', iva],
                ...(envio > 0 ? [['Envio', envio]] : []),
                ...(comisionPago > 0 ? [['Comision pago', comisionPago]] : []),
                ['Total a pagar', total],
            ];
            totalRows.forEach(([labelRow, value], idx) => {
                pdf.setFont('helvetica', idx === totalRows.length - 1 ? 'bold' : 'normal');
                pdf.setFontSize(idx === totalRows.length - 1 ? 12 : 10);
                pdf.setTextColor(idx === totalRows.length - 1 ? 17 : 75, idx === totalRows.length - 1 ? 24 : 85, idx === totalRows.length - 1 ? 39 : 99);
                pdf.text(labelRow, pageW - 190, y, { align: 'left' });
                pdf.text(fmt(value), pageW - 60, y, { align: 'right' });
                y += 18;
            });
            y += 18;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(107, 114, 128);
            pdf.text(`Metodo de pago: ${orden?.metodoPago || 'N/D'}`, 48, y);
            pdf.text(canalPago(orden?.metodoPago), 48, y + 14);
            pdf.text(`Vendedor asignado: ${
                orden?.vendedor
                    ? `${orden.vendedor.nombrePropietario || orden.vendedor.nombre || ''} ${orden.vendedor.apellido || ''}`.trim()
                    : 'Pendiente'
            }`, 48, y + 28);
            pdf.text(`Estado: ${estadoLabel(orden?.estadoOrden)}`, 48, y + 42);
            pdf.save(`factura-${numeroOrden}.pdf`);
        } catch (err) {
            console.error('Error generando PDF:', err);
        }
        setLoading(false);
    };

    return (
        <>
            <style>{tplStyles}</style>

            <button className="fpdf-btn" onClick={generarPDF} disabled={loading}>
                {loading ? '⏳ Generando...' : label}
            </button>

            {/* Plantilla oculta para html2canvas */}
            <div ref={pdfRef} className="fpdf-tpl">
                {/* Cabecera */}
                <div className="fpdf-top">
                    <div>
                        <div className="fpdf-brand-name"><span>IN</span>TEX</div>
                        <div className="fpdf-brand-sub">Textiles</div>
                    </div>
                    <div>
                        <div className="fpdf-doc-title">Factura</div>
                        <div className="fpdf-doc-num">#{numeroOrden}</div>
                        <div className="fpdf-doc-date">{fechaDoc}</div>
                    </div>
                </div>

                {/* Partes */}
                <div className="fpdf-parties">
                    <div className="fpdf-party">
                        <div className="fpdf-party-label">Emisor</div>
                        <div className="fpdf-party-name">Intex Textiles</div>
                        <div className="fpdf-party-detail">
                            RUC: 1791234560001<br />
                            facturacion@intextextiles.com<br />
                            Ecuador
                        </div>
                    </div>
                    <div className="fpdf-party">
                        <div className="fpdf-party-label">Facturar a</div>
                        <div className="fpdf-party-name">{nombreCliente || '—'}</div>
                        <div className="fpdf-party-detail">
                            {rucCliente && <>RUC/CI: {rucCliente}<br /></>}
                            {correoCliente && <>{correoCliente}<br /></>}
                            {telefonoCliente && <>{telefonoCliente}<br /></>}
                            {direccionCliente && <>{direccionCliente}</>}
                        </div>
                    </div>
                </div>

                {/* Tabla de ítems */}
                <table className="fpdf-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cant.</th>
                            <th>P. unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((it, i) => (
                            <tr key={i}>
                                <td>{it.nombre}</td>
                                <td>{it.cantidad}{it.unidad ? ` ${it.unidad}` : ''}</td>
                                <td>{fmt(it.precio)}</td>
                                <td>{fmt(it.subtotal || it.precio * it.cantidad)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>Sin ítems</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totales */}
                <div className="fpdf-totals">
                    <div className="fpdf-total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div className="fpdf-total-row"><span>IVA (15%)</span><span>{fmt(iva)}</span></div>
                    {comisionPago > 0 && <div className="fpdf-total-row"><span>Comisión pago</span><span>{fmt(comisionPago)}</span></div>}
                    <div className="fpdf-total-row grand"><span>Total a pagar</span><span>{fmt(total)}</span></div>
                </div>

                {/* Pie de página */}
                <div className="fpdf-footer">
                    <div className="fpdf-footer-note">
                        Método de pago: {orden?.metodoPago || '—'}<br />
                        Gracias por su confianza. Este documento es válido como orden de pago interna.<br />
                        Para consultas: facturacion@intextextiles.com
                    </div>
                    <div className="fpdf-footer-stamp">{estadoLabel(orden?.estadoOrden)}</div>
                </div>
            </div>
        </>
    );
};

export default FacturaPDF;
