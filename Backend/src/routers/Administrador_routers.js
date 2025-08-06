import { Router } from 'express';
import {
    login,
    crearAdministrador,
    actualizar,
    cambiarPassword,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword
} from '../controllers/Administrador_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { esAdmin } from '../middlewares/AuthMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPassword);
router.post('/nuevo-password/:token', crearNuevoPassword);

// --- RUTAS PRIVADAS (Requieren ser ADMIN) ---
router.use(verificarTokenJWT, esAdmin);

router.post('/', crearAdministrador);
router.put('/perfil', actualizar);
router.put('/perfil/password', cambiarPassword);

export default router;