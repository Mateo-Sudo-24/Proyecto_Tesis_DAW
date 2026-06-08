/**
 * Utilidades de cálculo para órdenes de Intex.
 * IVA: 15%, Comisión Stripe: 5.4% + $0.30
 */

export const IVA_RATE = 0.15;
export const COMISION_STRIPE_PCT = 0.054;
export const COMISION_STRIPE_FIJA = 0.30;

/**
 * Retorna el precio unitario de un producto según la unidad seleccionada,
 * @param {object} producto - Documento Producto del backend
 * @param {'metro'|'rollo'} unidad
 * @returns {number}
 */
export function getPrecioUnitario(producto, unidad = 'metro') {
    const base = unidad === 'rollo'
        ? (producto.precioPorRollo ?? 0)
        : (producto.precioPorMetro ?? 0);
    return parseFloat(Number(base).toFixed(4));
}

/**
 * Subtotal de un ítem del carrito.
 */
export function getSubtotalItem(producto, cantidad, unidad = 'metro') {
    return parseFloat((getPrecioUnitario(producto, unidad) * cantidad).toFixed(2));
}

/**
 * Calcula el desglose completo de una orden.
 * @param {Array} items - [{ producto, cantidad, unidadSeleccionada }]
 * @param {string} metodoPago - nombre del método de pago seleccionado
 * @returns {{ subtotal, iva, comisionPago, totalFinal }}
 */
export function calcularDesglose(items = [], metodoPago = '', envio = 0) {
    let subtotalBase = 0;

    for (const item of items) {
        const { producto, cantidad, unidadSeleccionada: unidad = 'metro' } = item;
        const base = unidad === 'rollo'
            ? (producto.precioPorRollo ?? 0)
            : (producto.precioPorMetro ?? 0);
        subtotalBase += base * cantidad;
    }

    const subtotal = parseFloat(subtotalBase.toFixed(2));
    const iva = parseFloat((subtotal * IVA_RATE).toFixed(2));

    const metodoLower = (metodoPago || '').toLowerCase();
    const usaStripe = metodoLower.includes('tarjeta') || metodoLower === 'stripe' || metodoLower.includes('línea');
    const comisionPago = usaStripe
        ? parseFloat(((subtotal + iva) * COMISION_STRIPE_PCT + COMISION_STRIPE_FIJA).toFixed(2))
        : 0;

    const envioTotal = parseFloat((Number(envio) || 0).toFixed(2));
    const totalFinal = parseFloat((subtotal + iva + comisionPago + envioTotal).toFixed(2));

    return { subtotal, iva, comisionPago, envio: envioTotal, totalFinal };
}

/**
 * Metros equivalentes de un item (para validar stock).
 */
export function getMetrosEquivalentes(cantidad, unidad, metrosPorRollo = 100) {
    return unidad === 'rollo' ? cantidad * metrosPorRollo : cantidad;
}

/**
 * Retorna true si un producto permite la unidad solicitada.
 */
export function unidadDisponible(producto, unidad) {
    const uv = producto.unidadVenta ?? 'metro';
    return uv === 'ambos' || uv === unidad;
}

/**
 * Label de unidad legible.
 */
export function labelUnidad(unidad, cantidad) {
    if (unidad === 'rollo') return `${cantidad} rollo${cantidad !== 1 ? 's' : ''}`;
    return `${cantidad} m`;
}
