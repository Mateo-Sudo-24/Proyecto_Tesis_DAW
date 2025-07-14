import Vendedor from '../models/Vendedor.js'
import { sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from '../middlewares/JWT.js'


// Recuperar contraseña
const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    const vendedorBDD = await Vendedor.findOne({ email });
    if (!vendedorBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    }

    const token = vendedorBDD.crearToken();
    vendedorBDD.token = token;
    await sendMailToRecoveryPassword(email, token);
    await vendedorBDD.save();

    res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" });
};

// Comprobar token de recuperación
const comprobarTokenPasword = async (req, res) => {
    const { token } = req.params;
    const vendedorBDD = await Vendedor.findOne({ token });
    if (vendedorBDD?.token !== req.params.token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    await vendedorBDD.save();
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
};

// Crear nuevo password
const crearNuevoPassword = async (req, res) => {
    const { password, confirmpassword } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    if (password != confirmpassword) {
        return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" });
    }

    const vendedorBDD = await Vendedor.findOne({ token: req.params.token });
    if (vendedorBDD?.token !== req.params.token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    vendedorBDD.token = null;
    vendedorBDD.password = await vendedorBDD.encrypPassword(password);
    await vendedorBDD.save();

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    const vendedorBDD = await Vendedor.findOne({ email }).select("-status -__v -token -updatedAt -createdAt");
    if (!vendedorBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    }

    const verificarPassword = await vendedorBDD.matchPassword(password);
    if (!verificarPassword) {
        return res.status(401).json({ msg: "Lo sentimos, el password no es el correcto" });
    }

    const token = crearTokenJWT(vendedorBDD._id, vendedorBDD.rol);

    const { nombre, apellido, direccion, telefono, _id, rol } = vendedorBDD;

    res.status(200).json({
        token,
        rol,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email: vendedorBDD.email
    });
};

// LOGICA VENDEDOR
// CRUD DE VENTAS Generar ventas -- Actualizar ventas -- Eliminar ventas
// CRUD DE PEDIDOS Gestion de pedidos -- Crear pedidos -- Ver pedidos -- Correciones
// Uso de la IA -- USAR LA CAMARA PARA ESCANEAR EL TIPO DE TELA (En produccion)


export {
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login
};
// Nota: Asegúrate de que el modelo Vendedor tenga los métodos encrypPassword y matchPassword definidos, así como el método crearToken para generar el token de recuperación.