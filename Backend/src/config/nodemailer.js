import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// Configuración del transportador de correo (usando tus credenciales de Gmail)
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

// Paleta de colores y estilos base para todos los correos
const COLORS = {
    primary: '#B2753B',
    background: '#FEFAF1',
    text: '#333333'
};

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

// --- PLANTILLAS DE CORREO ---

/**
 * Correo para confirmar la cuenta de un nuevo usuario (Cliente o Admin).
 * @param {string} userMail - El email del destinatario.
 * @param {string} token - El token de confirmación.
 */
const sendMailToRegister = async (userMail, token) => {
    const confirmationLink = `${process.env.URL_FRONTEND}/confirmar/${token}`;
    const mailOptions = {
        from: `"Soporte Unitex" <${process.env.USER_MAILTRAP}>`,
        to: userMail,
        subject: "Unitex - Confirma tu cuenta",
        html: `
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
            <div class="container">
                <h2>¡Bienvenido a Unitex!</h2>
                <p>Gracias por registrarte. Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente botón:</p>
                <div class="button-container">
                    <a href="${confirmationLink}" class="button">Confirmar Mi Cuenta</a>
                </div>
                <p>Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                <hr>
                <footer>© ${new Date().getFullYear()} Unitex. Todos los derechos reservados.</footer>
            </div></body></html>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo de confirmación enviado a:", userMail);
    } catch (error) {
        console.error("Error al enviar correo de confirmación:", error);
    }
};

/**
 * Correo para permitir a un usuario restablecer su contraseña olvidada.
 * @param {string} userMail - El email del destinatario.
 * @param {string} token - El token de recuperación.
 */
const sendMailToRecoveryPassword = async (userMail, token) => {
    const recoveryLink = `${process.env.URL_FRONTEND}/reset/${token}`;
    const mailOptions = {
        from: `"Soporte Unitex" <${process.env.USER_MAILTRAP}>`,
        to: userMail,
        subject: "Unitex - Restablece tu contraseña",
        html: `
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
            <div class="container">
                <h2>Restablece tu Contraseña</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para crear una nueva, haz clic en el siguiente botón:</p>
                <div class="button-container">
                    <a href="${recoveryLink}" class="button">Crear Nueva Contraseña</a>
                </div>
                <p>Si tú no solicitaste este cambio, por favor ignora este correo. Tu cuenta permanece segura.</p>
                <hr>
                <footer>© ${new Date().getFullYear()} Unitex. Todos los derechos reservados.</footer>
            </div></body></html>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo de recuperación enviado a:", userMail);
    } catch (error) {
        console.error("Error al enviar correo de recuperación:", error);
    }
};

/**
 * Correo para invitar a un nuevo Vendedor a activar su cuenta.
 * @param {string} userMail - El email del destinatario.
 * @param {string} token - El token de activación.
 */
const sendMailToInviteUser = async (userMail, token) => {
    const inviteLink = `${process.env.URL_FRONTEND}/vendedores/setup-account/${token}`;
    const mailOptions = {
        from: `"Soporte Unitex" <${process.env.USER_MAILTRAP}>`,
        to: userMail,
        subject: "Unitex - ¡Has sido invitado a unirte!",
        html: `
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
            <div class="container">
                <h2>¡Bienvenido al Equipo Unitex!</h2>
                <p>Has sido invitado a unirte a la plataforma de Unitex como vendedor. Para activar tu cuenta y establecer tu contraseña personal, haz clic en el botón de abajo:</p>
                <div class="button-container">
                    <a href="${inviteLink}" class="button">Activar Mi Cuenta</a>
                </div>
                <p>Este enlace es de un solo uso y expirará por seguridad. Si no esperabas esta invitación, puedes ignorar este correo.</p>
                <hr>
                <footer>© ${new Date().getFullYear()} Unitex. Todos los derechos reservados.</footer>
            </div></body></html>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo de invitación enviado a:", userMail);
    } catch (error) {
        console.error("Error al enviar correo de invitación:", error);
    }
};

export { 
    sendMailToRegister, 
    sendMailToRecoveryPassword, 
    sendMailToInviteUser 
};