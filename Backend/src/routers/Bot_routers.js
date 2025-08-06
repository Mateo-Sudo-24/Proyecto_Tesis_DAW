import { Router } from 'express';
import {
    buscarProductos,
    agregarAlCarrito,
    verCarrito
} from '../controllers/Bot_controller.js';
import { verificarBotApiKey } from '../middlewares/AuthBotMiddleware.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Todas las rutas del bot deben estar protegidas por la clave de API.
router.use(verificarBotApiKey);

// --- RUTAS PÚBLICAS DEL BOT (No necesitan saber qué usuario es) ---
// El bot puede buscar productos sin que el usuario haya iniciado sesión.
router.get('/buscar-productos', buscarProductos);

// --- RUTAS PRIVADAS DEL BOT (Requieren que el usuario esté logueado) ---
// Para estas rutas, el bot necesita enviar tanto su API Key (ya verificada)
// como el JWT del usuario.
router.post('/carrito/agregar', verificarTokenJWT, agregarAlCarrito);
router.get('/carrito', verificarTokenJWT, verCarrito);

export default router;