// Importamos el modelo Cliente y las funciones de envío de correos
import Cliente from "../models/Cliente.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"

// REGISTRO DE CLIENTES
const registro = async (req, res) => {
    const { email, password } = req.body

    // Validar que todos los campos estén llenos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    }

    // Verificar si el email ya está registrado en la base de datos
    const verificarEmailBDD = await Cliente.findOne({ email })
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" })
    }

    // Crear nuevo cliente con los datos del formulario
    const nuevoCliente = new Cliente(req.body)

    // Encriptar el password antes de guardarlo
    nuevoCliente.password = await nuevoCliente.encrypPassword(password)

    // Generar un token de verificación y enviar correo
    const token = nuevoCliente.crearToken()
    await sendMailToRegister(email, token)

    // Guardar cliente en la base de datos
    await nuevoCliente.save()

    // Respuesta al cliente
    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" })
}

// CONFIRMAR EMAIL DEL CLIENTE CON TOKEN
const confirmarMail = async (req, res) => {
    const token = req.params.token

    // Buscar al cliente por el token
    const clienteBDD = await Cliente.findOne({ token })

    // Si ya está confirmado o el token es inválido
    if (!clienteBDD?.token) {
        return res.status(404).json({ msg: "La cuenta ya ha sido confirmada o el token es inválido" })
    }

    // Confirmar el correo y eliminar el token
    clienteBDD.token = null
    clienteBDD.confirmEmail = true
    await clienteBDD.save()

    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" })
}

// ENVIAR CORREO PARA RECUPERAR CONTRASEÑA
const recuperarPassword = async (req, res) => {
    const { email } = req.body

    // Verificar que el campo no esté vacío
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    }

    // Buscar cliente por email
    const clienteBDD = await Cliente.findOne({ email })
    if (!clienteBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
    }

    // Generar nuevo token para recuperación
    const token = clienteBDD.crearToken()
    clienteBDD.token = token

    // Enviar correo con instrucciones para recuperar la contraseña
    await sendMailToRecoveryPassword(email, token)
    await clienteBDD.save()

    res.status(200).json({ msg: "Revisa tu correo electrónico para restablecer tu cuenta" })
}

// COMPROBAR TOKEN DE RECUPERACIÓN DE CONTRASEÑA
const comprobarTokenPasword = async (req, res) => {
    const { token } = req.params

    // Buscar cliente con ese token
    const clienteBDD = await Cliente.findOne({ token })

    // Verificar que el token sea válido
    if (clienteBDD?.token !== token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    }

    // Si el token es válido, se permite continuar
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
}

// CAMBIAR LA CONTRASEÑA USANDO EL TOKEN DE RECUPERACIÓN
const crearNuevoPassword = async (req, res) => {
    const { password, confirmpassword } = req.body

    // Validar que todos los campos estén llenos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirmpassword) {
        return res.status(400).json({ msg: "Lo sentimos, los passwords no coinciden" })
    }

    // Buscar cliente por token
    const clienteBDD = await Cliente.findOne({ token: req.params.token })

    // Verificar si el token es válido
    if (clienteBDD?.token !== req.params.token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    }

    // Guardar la nueva contraseña encriptada y eliminar el token
    clienteBDD.token = null
    clienteBDD.password = await clienteBDD.encrypPassword(password)
    await clienteBDD.save()

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" })
}

// INICIAR SESIÓN
const login = async (req, res) => {
    const { email, password } = req.body

    // Validar que los campos no estén vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    }

    // Buscar cliente por email
    const clienteBDD = await Cliente.findOne({ email }).select("-__v -token -updatedAt -createdAt")
    if (!clienteBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
    }

    // Verificar si la cuenta fue confirmada
    if (clienteBDD.confirmEmail === false) {
        return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" })
    }

    // Validar contraseña
    const verificarPassword = await clienteBDD.matchPassword(password)
    if (!verificarPassword) {
        return res.status(401).json({ msg: "Lo sentimos, el password no es el correcto" })
    }

    // Extraer datos del cliente para la sesión
    const { nombre, apellido, direccion, telefono, _id, rol } = clienteBDD
    res.status(200).json({
        rol,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email: clienteBDD.email
    })
}

// Exportar todas las funciones del controlador
export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login
}
