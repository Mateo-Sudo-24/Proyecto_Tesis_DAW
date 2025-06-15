import { Router } from 'express';
import {
  actualizar,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  cambiarPassword,
  login,
  crearAdministrador
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

// Login del administrador
router.post('/login', login);

// Crear un nuevo administrador (solo para el administrador principal)
router.post('/crear', crearAdministrador);

export default router;
