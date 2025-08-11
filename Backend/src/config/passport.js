import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Cliente from '../models/Cliente.js'
import { crearTokenJWT } from '../middlewares/JWT.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
      ? `${process.env.URL_BACKEND_PRODUCTION}/api/auth/google/callback`
      : process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value
        const nombreCompleto = profile.displayName.split(' ')
        const nombre = nombreCompleto[0]
        const apellido = nombreCompleto.slice(1).join(' ') || 'GoogleUser'

        // Buscar si el correo ya existe
        const clienteExistente = await Cliente.findOne({ email })

        if (clienteExistente) {
          // Si el cliente ya está registrado con proveedor "google"
          if (clienteExistente.proveedor === 'google') {
            return done(null, clienteExistente)
          }

          // Si el cliente existe pero fue registrado con email/password tradicional
          return done(
            new Error(
              'El correo ya está registrado con otro método. Por favor, inicia sesión manualmente.'
            ),
            null
          )
        }

        // Si no existe, creamos uno nuevo con proveedor Google
        const nuevoCliente = await Cliente.create({
          nombre,
          apellido,
          email,
          password: 'google_auth', // Dummy, no se usa
          confirmEmail: true,
          proveedor: 'google',
          rol: 'cliente'
        })

        return done(null, nuevoCliente)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

// Serialización mínima
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  const user = await Cliente.findById(id)
  done(null, user)
})
