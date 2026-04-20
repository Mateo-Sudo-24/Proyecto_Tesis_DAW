// Router de Chatbot - Define endpoints de Groq e IA
import { Router } from 'express';
import {
    consultarGroqPublic,
    consultarGroqAuth,
    generarAvatarPublic,
    generarAvatarAuth
} from '../controllers/Chatbot_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Endpoints Públicos (Sin autenticación)
router.post('/groq', consultarGroqPublic);
router.post('/avatar', generarAvatarPublic);

// Endpoints Autenticados (Requieren JWT)
router.post('/groq-auth', verificarTokenJWT, consultarGroqAuth);
router.post('/avatar-auth', verificarTokenJWT, generarAvatarAuth);

export default router;
