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
import { protegerRutaCrearAdmin } from '../middlewares/setupMiddleware.js'; // <-- ¡IMPORTA EL NUEVO MIDDLEWARE!

const router = Router();

// --- RUTAS PÚBLICAS (No requieren token) ---
router.post('/login', login);
router.post('/recuperar-password', recuperarPassword);
router.get('/recuperar-password/:token', comprobarTokenPassword);
router.post('/nuevo-password/:token', crearNuevoPassword);

// --- RUTA ESPECIAL DE CREACIÓN DE ADMIN ---
// Esta ruta usa nuestro nuevo middleware inteligente.
// Será pública la primera vez, y privada todas las veces siguientes.
router.post('/', protegerRutaCrearAdmin, crearAdministrador);

// --- RUTAS PRIVADAS (Requieren ser ADMIN para todo lo demás) ---
// Perfil y cambio de contraseña
router.put('/perfil', verificarTokenJWT, esAdmin, actualizar);
router.put('/perfil/password', verificarTokenJWT, esAdmin, cambiarPassword);

export default router;