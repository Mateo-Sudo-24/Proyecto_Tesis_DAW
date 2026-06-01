export const letrasConTildesRegex = /^[\p{L}\p{M}\s.'-]{2,}$/u;

export const textoConTildesYEmojisRegex = /^[\p{L}\p{M}\p{N}\p{Extended_Pictographic}\s.,;:¡!¿?'"()/_-]+$/u;

export const esTextoConTildesYEmojis = (value = "") =>
    textoConTildesYEmojisRegex.test(String(value).trim());
