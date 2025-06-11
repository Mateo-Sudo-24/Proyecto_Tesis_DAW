import { Router } from 'express';
import {
  actualizar,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  cambiarPassword
} from '../controllers/Administrador_controller.js';

const router = Router();

// Actualizar datos del administrador (excepto password)
router.put('/actualizar', actualizar);

// Recuperar contraseña (envía correo con token)
router.post('/recuperarpassword', recuperarPassword);

// Comprobar token para recuperación de password
router.get('/recuperarpassword/:token', comprobarTokenPassword);

// Crear nueva contraseña con token
router.post('/nuevopassword/:token', crearNuevoPassword);

// Cambiar contraseña con contraseña actual
router.put('/cambiarpassword', cambiarPassword);

export default router;
