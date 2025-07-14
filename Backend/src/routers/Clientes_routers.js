import { Router } from 'express';
import { 
    registro, 
    confirmarMail, 
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword, 
    login 
} from '../controllers/Cliente_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Registro de cliente
router.post('/registro',verificarTokenJWT, registro);

// Confirmar correo electrónico
router.get('/confirmar/:token',verificarTokenJWT, confirmarMail);

// Recuperación de contraseña
router.post('/recuperarpassword',verificarTokenJWT, recuperarPassword);
router.get('/recuperarpassword/:token', verificarTokenJWT,comprobarTokenPasword);
router.post('/nuevopassword/:token',verificarTokenJWT, crearNuevoPassword);

// Login
router.post('/login',verificarTokenJWT, login);

export default router;
