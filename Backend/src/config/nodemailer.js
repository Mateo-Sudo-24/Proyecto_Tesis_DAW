import dotenv from 'dotenv';
dotenv.config();

// Brevo API HTTP — no usa SMTP, funciona en Render sin restricciones de puerto
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendBrevo = async (to, subject, html) => {
    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'Soporte Intex', email: 'mateo.paredes.0012@gmail.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Brevo API error ${res.status}`);
    }
    console.log('✅ Correo enviado vía Brevo API a:', to);
};

console.log('✅ Brevo HTTP API lista.');

const COLORS = { primary: '#B2753B', background: '#FEFAF1', text: '#333333' };

const baseStyle = `
    <style>
        body { margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: Arial, sans-serif; color: ${COLORS.text}; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; }
        h2 { color: ${COLORS.primary}; text-align: center; }
        p { font-size: 16px; line-height: 1.5; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: ${COLORS.primary}; color: #ffffff !important; padding: 14px 28px; border-radius: 5px; text-decoration: none; font-weight: bold; }
        hr { border: none; border-top: 1px solid #e0e0e0; margin: 30px 0; }
        footer { font-size: 12px; color: #888; text-align: center; }
    </style>
`;

const sendMailToRegister = async (userMail, token) => {
    const link = `${process.env.URL_FRONTEND}/confirmar/${token}`;
    await sendBrevo(userMail, 'Intex - Confirma tu cuenta', `
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
        <div class="container">
            <h2>¡Bienvenido a Intex!</h2>
            <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el botón:</p>
            <div class="button-container"><a href="${link}" class="button">Confirmar Mi Cuenta</a></div>
            <p>Si no realizaste esta solicitud, ignora este correo.</p>
            <hr><footer>© ${new Date().getFullYear()} Intex. Todos los derechos reservados.</footer>
        </div></body></html>`);
};

const sendMailToRecoveryPassword = async (userMail, token) => {
    const link = `${process.env.URL_FRONTEND}/reset/${token}`;
    await sendBrevo(userMail, 'Intex - Restablece tu contraseña', `
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
        <div class="container">
            <h2>Restablece tu Contraseña</h2>
            <p>Haz clic en el botón para crear una nueva contraseña:</p>
            <div class="button-container"><a href="${link}" class="button">Crear Nueva Contraseña</a></div>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
            <hr><footer>© ${new Date().getFullYear()} Intex. Todos los derechos reservados.</footer>
        </div></body></html>`);
};

const sendMailToInviteUser = async (userMail, token) => {
    const link = `${process.env.URL_FRONTEND}/vendedores/setup-account/${token}`;
    await sendBrevo(userMail, 'Intex - ¡Has sido invitado a unirte!', `
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
        <div class="container">
            <h2>¡Bienvenido al Equipo Intex!</h2>
            <p>Has sido invitado como vendedor. Activa tu cuenta:</p>
            <div class="button-container"><a href="${link}" class="button">Activar Mi Cuenta</a></div>
            <p>Este enlace es de un solo uso.</p>
            <hr><footer>© ${new Date().getFullYear()} Intex. Todos los derechos reservados.</footer>
        </div></body></html>`);
};

const sendMailToInviteCliente = async (userMail, token) => {
    const link = `${process.env.URL_FRONTEND}/clientes/setup-account/${token}`;
    await sendBrevo(userMail, 'Intex - ¡Tu cuenta ha sido creada!', `
        <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
        <div class="container">
            <h2>¡Bienvenido a Intex!</h2>
            <p>Un administrador creó una cuenta para ti. Actívala aquí:</p>
            <div class="button-container"><a href="${link}" class="button">Activar Mi Cuenta</a></div>
            <p>Este enlace es de un solo uso.</p>
            <hr><footer>© ${new Date().getFullYear()} Intex. Todos los derechos reservados.</footer>
        </div></body></html>`);
};

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToInviteUser,
    sendMailToInviteCliente
};
