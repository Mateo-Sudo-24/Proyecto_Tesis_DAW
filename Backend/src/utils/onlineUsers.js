const usuariosConectados = new Map();

const isUserOnline = (id) => usuariosConectados.has(String(id));

export { usuariosConectados, isUserOnline };
