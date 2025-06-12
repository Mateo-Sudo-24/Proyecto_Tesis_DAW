import { Router } from 'express';
import { 
    registro, 
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword, 
    login 
} from '../controllers/Vendedor_controller.js';

const router = Router();

// Creación del vendedor (por el administrador)
router.post('/registro', registro);

// Recuperación de contraseña
router.post('/recuperarpassword', recuperarPassword);
router.get('/recuperarpassword/:token', comprobarTokenPasword);
router.post('/nuevopassword/:token', crearNuevoPassword);

// Login
router.post('/login', login);

export default router;
