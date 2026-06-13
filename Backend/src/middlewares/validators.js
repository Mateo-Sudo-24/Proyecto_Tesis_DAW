import { body, validationResult, param } from 'express-validator';

const normalizeEmailOptions = {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
};

const nombreRegex = /^(?=.{2,12}$)(?=(?:.*[\p{L}]){2,10})[\p{L}\p{M}]+(?:[\s.'-][\p{L}\p{M}]+)*$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;
const telefonoRegex = /^0\d{9}$/;

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            msg: 'Rellene todos los campos correctamente.',
            errors: errors.array(),
        });
    }
    next();
};

const validateEmail = body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Ingresa un correo electronico valido.')
    .matches(emailRegex)
    .withMessage('Ingresa un correo con dominio valido.')
    .normalizeEmail(normalizeEmailOptions);

const validatePassword = body('password')
    .isLength({ min: 8 })
    .withMessage('La contrasena debe tener al menos 8 caracteres.');

const validateNombre = body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 12 })
    .withMessage('El nombre debe tener entre 2 y 12 caracteres.')
    .matches(nombreRegex)
    .withMessage('Ingresa un nombre real, solo letras y espacios.');

const validateApellido = body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio.')
    .isLength({ min: 2, max: 12 })
    .withMessage('El apellido debe tener entre 2 y 12 caracteres.')
    .matches(nombreRegex)
    .withMessage('Ingresa un apellido real, solo letras y espacios.');

const validateTelefono = body('telefono')
    .trim()
    .matches(telefonoRegex)
    .withMessage('El teléfono debe tener 10 dígitos y empezar con 0.');

const validateDireccion = body('direccion')
    .trim()
    .isLength({ min: 5 })
    .withMessage('La direccion debe tener al menos 5 caracteres.');

export const validateMongoId = [
    param('id').isMongoId().withMessage('El ID proporcionado en la URL no es valido.'),
    handleValidationErrors
];

export const validateAdminCreation = [validateNombre, validateApellido, validateEmail, validatePassword, handleValidationErrors];
export const validateLogin = [validateEmail, body('password').notEmpty().withMessage('La contrasena es obligatoria.'), handleValidationErrors];
export const validatePasswordRecovery = [validateEmail, handleValidationErrors];
export const validatePasswordReset = [validatePassword, handleValidationErrors];

export const validateProfileUpdate = [
    body('nombre').optional().trim().isLength({ min: 2, max: 12 }).withMessage('El nombre debe tener entre 2 y 12 caracteres.').matches(nombreRegex).withMessage('Ingresa un nombre real.'),
    body('apellido').optional().trim().isLength({ min: 2, max: 12 }).withMessage('El apellido debe tener entre 2 y 12 caracteres.').matches(nombreRegex).withMessage('Ingresa un apellido real.'),
    body('email').optional().trim().toLowerCase().isEmail().matches(emailRegex).normalizeEmail(normalizeEmailOptions),
    body('telefono').optional().trim().matches(telefonoRegex).withMessage('El teléfono debe tener 10 dígitos.'),
    body('direccion').optional().trim().isLength({ min: 5 }).withMessage('La direccion debe tener al menos 5 caracteres.'),
    handleValidationErrors
];

export const validatePasswordChange = [
    body('passwordActual').notEmpty().withMessage('La contrasena actual es obligatoria.'),
    body('passwordNuevo').isLength({ min: 8 }).withMessage('La nueva contrasena debe tener al menos 8 caracteres.'),
    handleValidationErrors
];

export const validateVendedorInvitation = [
    validateNombre,
    validateApellido,
    validateEmail,
    validateTelefono,
    validateDireccion,
    handleValidationErrors
];

export const validateAccountSetup = [
    validatePassword,
    param('token').notEmpty().withMessage('El token es requerido.'),
    handleValidationErrors
];

export const validateClienteRegistro = [
    validateNombre,
    validateApellido,
    validateEmail,
    validatePassword,
    validateTelefono,
    validateDireccion,
    handleValidationErrors
];

export const validateAdminClienteCreation = [
    validateNombre,
    validateEmail,
    body('telefono').optional({ checkFalsy: true }).trim().matches(telefonoRegex).withMessage('El teléfono debe tener 10 dígitos.'),
    body('direccion').optional({ checkFalsy: true }).trim().isLength({ min: 5 }).withMessage('La direccion debe tener al menos 5 caracteres.'),
    handleValidationErrors
];
