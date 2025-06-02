import Cliente from "../models/Cliente"

const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Cliente.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoCliente = new Cliente(req.body)
    nuevoCliente.password = await nuevoCliente.encrypPassword(password)
    nuevoCliente.crearToken()
    await nuevoCliente.save()
    res.status(200).json({nuevoCliente})
}



export {
    registro
}
