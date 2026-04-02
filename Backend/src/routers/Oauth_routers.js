import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/OAuth_Controller.js';

const router = Router();

// Verificar si Google OAuth está configurado
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL;

// Ruta: GET /api/auth/google
if (isGoogleConfigured) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ msg: 'Google OAuth no está configurado. Agrega GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_CALLBACK_URL en .env' });
  });
}

// Ruta: GET /api/auth/google/callback
if (isGoogleConfigured) {
  router.get('/google/callback',
    passport.authenticate('google', {
      failureRedirect: process.env.NODE_ENV === 'production'
        ? `${process.env.URL_FRONTEND}/login`
        : `${process.env.FRONTEND_URL}/login`
    }),
    googleCallback
  );
} else {
  router.get('/google/callback', (req, res) => {
    res.status(503).json({ msg: 'Google OAuth no está configurado.' });
  });
}

export default router;
