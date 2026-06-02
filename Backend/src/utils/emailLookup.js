const normalizarEmail = (email = '') => String(email).toLowerCase().trim();

const buscarDocumentoPorEmail = async (Model, email, extraQuery = {}) => {
    const emailNorm = normalizarEmail(email);
    const emailOriginal = String(email || '').trim();
    const intentos = [...new Set([emailNorm, emailOriginal].filter(Boolean))];

    for (const emailIntento of intentos) {
        const documento = await Model.findOne({ ...extraQuery, email: emailIntento });
        if (documento) return normalizarDocumentoEncontrado(Model, documento, emailNorm);
    }

    const documento = await Model.findOne({ ...extraQuery, email: emailNorm })
        .collation({ locale: 'en', strength: 2 });

    if (!documento) return null;
    return normalizarDocumentoEncontrado(Model, documento, emailNorm);
};

const normalizarDocumentoEncontrado = async (Model, documento, emailNorm) => {
    if (documento.email && documento.email !== emailNorm) {
        try {
            await Model.updateOne({ _id: documento._id, email: documento.email }, { $set: { email: emailNorm } });
            documento.email = emailNorm;
        } catch (error) {
            console.warn(`No se pudo normalizar email de ${Model.modelName}:`, error.message);
        }
    }
    return documento;
};

export { normalizarEmail, buscarDocumentoPorEmail };
