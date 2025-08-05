import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/OAuth_Controller.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

export default router;
