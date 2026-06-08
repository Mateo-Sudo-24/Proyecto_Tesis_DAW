export const letrasConTildesRegex = /^[\p{L}\p{M}\s.'-]{2,12}$/u;
export const nombreRealRegex = /^(?=.{2,12}$)(?=(?:.*[\p{L}]){2,10})[\p{L}\p{M}]+(?:[\s.'-][\p{L}\p{M}]+)*$/u;
export const nombreOrdenPagoRegex = /^(?=.{5,12}$)(?=(?:.*[\p{L}]){5,10})[\p{L}\p{M}]+(?:[\s.'-][\p{L}\p{M}]+)*$/u;
export const emailRealistaRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;
export const telefonoEcuadorRegex = /^0\d{9}$/;
export const cedulaRucRegex = /^(\d{10}|\d{13})$/;

export const textoConTildesYEmojisRegex = /^[\p{L}\p{M}\p{N}\p{Extended_Pictographic}\s.,;:¡!¿?'"()/_-]+$/u;

export const esTextoConTildesYEmojis = (value = "") =>
    textoConTildesYEmojisRegex.test(String(value).trim());

export const validarNombreReal = (value = "", minLetras = 2) => {
    const limpio = String(value || "").trim().replace(/\s+/g, " ");
    const letras = (limpio.match(/[\p{L}]/gu) || []).length;
    if (letras < minLetras) return `Debe tener al menos ${minLetras} letras`;
    if (limpio.length > 12) return "Maximo 12 caracteres";
    if (letras > 10) return "Maximo 10 letras";
    return (minLetras >= 5 ? nombreOrdenPagoRegex : nombreRealRegex).test(limpio)
        || "Usa solo nombres reales con letras y espacios";
};

export const validarDescripcionProducto = (value = "") => {
    const texto = String(value || "").trim().replace(/\s+/g, " ");
    const palabras = texto ? texto.split(" ").filter(Boolean).length : 0;
    if (!texto) return "La descripcion es obligatoria";
    if (texto.length > 300) return "Maximo 300 caracteres";
    if (palabras > 50) return "Maximo 50 palabras";
    return true;
};

export const validarEmailRealista = (value = "") => {
    const email = String(value || "").trim().toLowerCase();
    const dominio = email.split("@")[1] || "";
    if (!emailRealistaRegex.test(email)) return "Ingresa un correo valido (ej: usuario@dominio.com)";
    if (!dominio.includes(".") || dominio.endsWith(".test") || dominio.endsWith(".local")) {
        return "Ingresa un dominio de correo valido";
    }
    return true;
};

export const validarTelefono10 = (value = "") =>
    telefonoEcuadorRegex.test(String(value || "").replace(/\D/g, ""))
        || "El telefono debe tener 10 digitos";

export const validarCedulaRuc = (value = "") =>
    cedulaRucRegex.test(String(value || "").replace(/\D/g, ""))
        || "Usa cedula de 10 digitos o RUC de 13";
