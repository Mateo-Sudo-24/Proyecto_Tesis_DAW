/**
 * Retorna el precio segun unidad de venta del producto.
 * No usa precio referencial.
 */
export const getPrecioDisplay = (producto) => {
    return {
        porMetro: Number(producto?.precioPorMetro) || 0,
        porRollo: Number(producto?.precioPorRollo) || 0,
        unidad: producto?.unidadVenta || 'metro'
    };
};

export const getPrecioSegunUnidad = (producto, unidad) => {
    if (unidad === 'rollo') {
        return Number(producto?.precioPorRollo) || 0;
    }

    return Number(producto?.precioPorMetro) || 0;
};

export const formatPrecioCard = (producto) => {
    const { porMetro, porRollo, unidad } = getPrecioDisplay(producto);

    if (unidad === 'ambos') {
        return {
            metro: porMetro,
            rollo: porRollo,
            mostrarAmbos: true
        };
    }

    if (unidad === 'rollo') {
        return {
            rollo: porRollo,
            mostrarAmbos: false
        };
    }

    return {
        metro: porMetro,
        mostrarAmbos: false
    };
};
