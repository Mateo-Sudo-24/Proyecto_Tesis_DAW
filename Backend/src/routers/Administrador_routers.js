import { Router } from 'express';
import {
  actualizar,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  cambiarPassword,
  login,
  crearAdministrador,
  registroVendedor
} from '../controllers/Administrador_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Actualizar datos del administrador (excepto password)
router.put('/actualizar', verificarTokenJWT, actualizar);

// Recuperar contraseña (envía correo con token)
router.post('/recuperarpassword', verificarTokenJWT, recuperarPassword);

// Comprobar token para recuperación de password
router.get('/recuperarpassword/:token', verificarTokenJWT, comprobarTokenPassword);

// Crear nueva contraseña con token
router.post('/nuevopassword/:token', verificarTokenJWT, crearNuevoPassword);

// Cambiar contraseña con contraseña actual
router.put('/cambiarpassword', verificarTokenJWT, cambiarPassword);

// Login del administrador
router.post('/login', verificarTokenJWT, login);

// Crear un nuevo administrador (solo para el administrador principal)
router.post('/crear', crearAdministrador);

// Registrar un nuevo vendedor (hecho por el administrador)
router.post('/vendedor/registro', verificarTokenJWT, registroVendedor);

export default router;
