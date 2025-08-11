import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/OAuth_Controller.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));


router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === 'production'
      ? `${process.env.URL_FRONTEND}/login`
      : `${process.env.FRONTEND_URL}/login`
  }),
  googleCallback
);


export default router;
