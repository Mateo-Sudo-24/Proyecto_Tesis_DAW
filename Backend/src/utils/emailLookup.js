const normalizarEmail = (email = '') => String(email).toLowerCase().trim();

const buscarDocumentoPorEmail = async (Model, email, extraQuery = {}) => {
    const emailNorm = normalizarEmail(email);
    const emailOriginal = String(email || '').trim();
    const intentos = [...new Set([emailNorm, emailOriginal].filter(Boolean))];

    for (const emailIntento of intentos) {
        const documento = await Model.findOne({ ...extraQuery, email: emailIntento });
        if (documento) return documento;
    }

    const documento = await Model.findOne({ ...extraQuery, email: emailNorm })
        .collation({ locale: 'en', strength: 2 });

    return documento;
};

export { normalizarEmail, buscarDocumentoPorEmail };
