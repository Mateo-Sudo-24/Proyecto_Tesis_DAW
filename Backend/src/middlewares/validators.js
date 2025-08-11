import { body, validationResult, param } from 'express-validator';

// Middleware reutilizable para manejar los errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// --- VALIDACIONES COMUNES (MEJORADAS) ---
const validateEmail = body('email').isEmail().withMessage('Por favor, ingresa un correo electrónico válido.').normalizeEmail();
const validatePassword = body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.');

// --- ¡REGLAS MEJORADAS PARA NOMBRE Y APELLIDO! ---
const validateNombre = body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo puede contener letras y espacios.'); // Permite letras y espacios

const validateApellido = body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio.')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo puede contener letras y espacios.');

const validateMongoId = param('id').isMongoId().withMessage('El ID proporcionado no es válido.');

// --- VALIDACIONES POR ROL (Ahora usan las reglas mejoradas) ---

// Administrador
export const validateAdminCreation = [validateNombre, validateApellido, validateEmail, validatePassword, handleValidationErrors];
export const validateLogin = [validateEmail, body('password').notEmpty().withMessage('La contraseña es obligatoria.'), handleValidationErrors];
export const validatePasswordRecovery = [validateEmail, handleValidationErrors];
export const validatePasswordReset = [validatePassword, handleValidationErrors];
export const validateProfileUpdate = [
    body('nombre').optional().trim().notEmpty().isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo puede contener letras y espacios.'),
    body('apellido').optional().trim().notEmpty().isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo puede contener letras y espacios.'),
    body('email').optional().isEmail().normalizeEmail(),
    handleValidationErrors
];
export const validatePasswordChange = [
    body('passwordActual').notEmpty().withMessage('La contraseña actual es obligatoria.'),
    body('passwordNuevo').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
    handleValidationErrors
];

// Vendedor
export const validateVendedorInvitation = [validateNombre, validateApellido, validateEmail, handleValidationErrors];
export const validateAccountSetup = [validatePassword, param('token').notEmpty().withMessage('El token es requerido.'), handleValidationErrors];

// Cliente
export const validateClienteRegistro = [validateNombre, validateApellido, validateEmail, validatePassword, handleValidationErrors];
export const validateAdminClienteCreation = [validateNombre, validateEmail, validatePassword, handleValidationErrors];