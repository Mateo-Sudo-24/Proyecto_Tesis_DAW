import { Stripe } from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Inicializar Stripe solo si la clave privada está disponible
// Esto evita errores si no se usa Stripe en desarrollo
let stripe = null;

if (process.env.STRIPE_PRIVATE_KEY) {
    stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
} else {
    console.warn('⚠️ STRIPE_PRIVATE_KEY no configurada en .env - Pagos con Stripe deshabilitados');
}

export default stripe;
