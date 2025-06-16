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

const sendMailToRegister = async (userMail, token) => {
    let mailOptions = {
        from: 'admin@unitex.com',
        to: userMail,
        subject: "Unitex - Confirmación de cuenta",
        html: `
            <p>Hola, haz clic <a href="${process.env.URL_FRONTEND}/confirm/${token}">aquí</a> para confirmar tu cuenta.</p>
            <hr>
            <footer>El equipo de Unitex te da la más cordial bienvenida.</footer>
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
            <h1>Unitex - Plataforma de Gestión</h1>
            <hr>
            <p>Haz clic en el siguiente enlace para reestablecer tu contraseña:</p>
            <a href="${process.env.URL_FRONTEND}/reset/${token}">Reestablecer contraseña</a>
            <hr>
            <footer>El equipo de Unitex te da la más cordial bienvenida.</footer>
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
