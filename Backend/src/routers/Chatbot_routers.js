// Router de Chatbot - Define endpoints de Groq
import { Router } from 'express';
import {
    consultarGroqPublic,
    consultarGroqAuth
} from '../controllers/Chatbot_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Endpoints Públicos (Sin autenticación)
router.post('/groq', consultarGroqPublic);

// Endpoints Autenticados (Requieren JWT)
router.post('/groq-auth', verificarTokenJWT, consultarGroqAuth);

export default router;
