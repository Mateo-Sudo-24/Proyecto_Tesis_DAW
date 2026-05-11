import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// Puerto como número (las variables de entorno siempre llegan como string)
const smtpPort = Number(process.env.PORT_MAILTRAP) || 587;

// Si se usa Gmail, forzar el host IPv4 exclusivo para evitar ENETUNREACH en Render
const smtpHost = (() => {
    const h = process.env.HOST_MAILTRAP || '';
    if (h === 'smtp.gmail.com') return 'smtp4.gmail.com';
    return h;
})();

// Para Gmail en Render forzar siempre 465 (SSL/IPv4), ignora PORT_MAILTRAP si el host es Gmail
const isGmail = smtpHost === 'smtp4.gmail.com';
const smtpPortFinal = isGmail ? 465 : smtpPort;

// Configuración limpia: sólo host/port/secure (sin "service" que entra en conflicto)
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPortFinal,
    secure: smtpPortFinal === 465,  // true → SSL (465)  |  false → STARTTLS (587)
    family: 4,                      // Forzar IPv4 (Render no soporta IPv6 en plan gratuito)
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    },
});

// Verificar conexión SMTP al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error de conexión SMTP:", error.message);
        console.error("   Host:", smtpHost, "| Puerto:", smtpPortFinal, "| Usuario:", process.env.USER_MAILTRAP);
    } else {
        console.log("✅ Servidor SMTP conectado correctamente. Host:", smtpHost, "| Puerto:", smtpPortFinal);
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
                <p>Gracias por registrarte. Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente botón: </p>
                <div class="button-container">
                    <a href="${confirmationLink}" class="button">Confirmar Mi Cuenta</a>
                </div>
                <p>Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                <hr>
                <footer>© ${new Date().getFullYear()} Unitex. Todos los derechos reservados.</footer>
            </div></body></html>`
    };
    await transporter.sendMail(mailOptions);
    console.log("Correo de confirmación enviado a:", userMail);
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
    await transporter.sendMail(mailOptions);
    console.log("Correo de recuperación enviado a:", userMail);
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
    await transporter.sendMail(mailOptions);
    console.log("Correo de invitación enviado a:", userMail);
};

/**
 * Correo para invitar a un nuevo Cliente (creado por admin) a activar su cuenta.
 * @param {string} userMail - El email del destinatario.
 * @param {string} token - El token de activación.
 */
const sendMailToInviteCliente = async (userMail, token) => {
    const inviteLink = `${process.env.URL_FRONTEND}/clientes/setup-account/${token}`;
    const mailOptions = {
        from: `"Soporte Unitex" <${process.env.USER_MAILTRAP}>`,
        to: userMail,
        subject: "Unitex - ¡Tu cuenta ha sido creada!",
        html: `
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">${baseStyle}</head><body>
            <div class="container">
                <h2>¡Bienvenido a Unitex!</h2>
                <p>Un administrador ha creado una cuenta para ti en la plataforma de Unitex. Para activar tu cuenta y establecer tu contraseña personal, haz clic en el botón de abajo:</p>
                <div class="button-container">
                    <a href="${inviteLink}" class="button">Activar Mi Cuenta</a>
                </div>
                <p>Este enlace es de un solo uso y expirará por seguridad. Si no esperabas esta invitación, puedes ignorar este correo.</p>
                <hr>
                <footer>© ${new Date().getFullYear()} Unitex. Todos los derechos reservados.</footer>
            </div></body></html>`
    };
    await transporter.sendMail(mailOptions);
    console.log("Correo de invitación a cliente enviado a:", userMail);
};

export { 
    sendMailToRegister, 
    sendMailToRecoveryPassword, 
    sendMailToInviteUser,
    sendMailToInviteCliente
};