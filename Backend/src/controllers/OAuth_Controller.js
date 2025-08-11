import { crearTokenJWT } from '../middlewares/JWT.js';

export const googleCallback = (req, res) => {
  console.log("✅ Google callback ejecutado");
  console.log("Usuario:", req.user);

  const cliente = req.user;
  if (!cliente) {
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  }

  const token = crearTokenJWT(cliente._id, cliente.rol);
  const FRONTEND_REDIRECT = process.env.NODE_ENV === 'production'
    ? process.env.URL_FRONTEND
    : process.env.FRONTEND_URL;


  res.redirect(`${FRONTEND_REDIRECT}/oauth-success?token=${token}`);

};

