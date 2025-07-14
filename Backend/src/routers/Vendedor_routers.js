import { Router } from 'express';
import { 
    recuperarPassword, 
    comprobarTokenPasword, 
    crearNuevoPassword, 
    login 
} from '../controllers/Vendedor_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Recuperación de contraseña
router.post('/recuperarpassword',verificarTokenJWT, recuperarPassword);
router.get('/recuperarpassword/:token',verificarTokenJWT, comprobarTokenPasword);
router.post('/nuevopassword/:token',verificarTokenJWT, crearNuevoPassword);

// Login
router.post('/login',verificarTokenJWT, login);

export default router;
