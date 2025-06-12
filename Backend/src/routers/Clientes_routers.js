import { Router } from 'express';
import { 
    registro, 
    confirmarMail, 
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword, 
    login 
} from '../controllers/Cliente_controller.js';

const router = Router();

// Registro de cliente
router.post('/registro', registro);

// Confirmar correo electrónico
router.get('/confirmar/:token', confirmarMail);

// Recuperación de contraseña
router.post('/recuperarpassword', recuperarPassword);
router.get('/recuperarpassword/:token', comprobarTokenPasword);
router.post('/nuevopassword/:token', crearNuevoPassword);

// Login
router.post('/login', login);

export default router;
