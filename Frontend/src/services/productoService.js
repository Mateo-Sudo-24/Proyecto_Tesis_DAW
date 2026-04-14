const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const buscarProductosSimilares = async (nombre, color, textura) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/productos/buscar-similares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, color, textura })
    });

    if (!response.ok) {
      throw new Error('Error al buscar productos similares');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en buscarProductosSimilares:', error);
    throw error;
  }
};
