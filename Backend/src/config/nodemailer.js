import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const COLORS = {
    primary: '#B2753B',
    background: '#FEFAF1',
    text: '#333333'
};

const baseStyle = `
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: ${COLORS.background};
            font-family: Arial, sans-serif;
            color: ${COLORS.text};
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            border: 1px solid ${COLORS.primary}33;
            border-radius: 8px;
            padding: 30px;
        }
        h2 {
            color: ${COLORS.primary};
            text-align: center;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            background-color: ${COLORS.primary};
            color: #fff;
            padding: 14px 28px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        hr {
            border: none;
            border-top: 1px solid ${COLORS.primary}33;
            margin: 40px 0;
        }
        footer {
            font-size: 12px;
            color: #888;
            text-align: center;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            .button {
                display: block;
                width: 100%;
                text-align: center;
                box-sizing: border-box;
            }
        }
    </style>
`;    

const sendMailToRegister = async (userMail, token) => {
    let mailOptions = {
        from: 'admin@unitex.com',
        to: userMail,
        subject: "Unitex - Confirmación de cuenta",
        html: `
            <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${baseStyle}
        </head>
        <body>
            <div class="container">
                <h2>¡Bienvenido a Unitex!</h2>
                <p>Hola,</p>
                <p>
                    Gracias por unirte a <strong>Unitex</strong>. Para completar tu registro, confirma tu correo electrónico haciendo clic en el siguiente botón:
                </p>
                <div class="button-container">
                    <a href="${process.env.URL_FRONTEND}/confirm/${token}" class="button">Confirmar Cuenta</a>
                </div>
                <p>Si no realizaste esta solicitud, ignora este correo.</p>
                <hr>
                <footer>
                    © ${new Date().getFullYear()} Unitex - Todos los derechos reservados.
                </footer>
            </div>
        </body>
        </html>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    } catch (error) {
        console.error("Error enviando correo de confirmación: ", error);
    }
};

const sendMailToRecoveryPassword = async (userMail, token) => {
    let mailOptions = {
        from: 'admin@unitex.com',
        to: userMail,
        subject: "Unitex - Reestablece tu contraseña",
        html: `
            <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${baseStyle}
        </head>
        <body>
            <div class="container">
                <h2>Restablece tu contraseña</h2>
                <p>Hola,</p>
                <p>
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de <strong>Unitex</strong>. Para continuar, haz clic en el siguiente botón:
                </p>
                <div class="button-container">
                    <a href="${process.env.URL_FRONTEND}/reset/${token}" class="button">Restablecer Contraseña</a>
                </div>
                <p>Si no solicitaste este cambio, ignora este correo. Tu contraseña actual permanecerá segura.</p>
                <hr>
                <footer>
                    © ${new Date().getFullYear()} Unitex - Todos los derechos reservados.
                </footer>
            </div>
        </body>
        </html>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    } catch (error) {
        console.error("Error enviando correo de recuperación: ", error);
    }
};

export {
    sendMailToRegister,
    sendMailToRecoveryPassword
};
