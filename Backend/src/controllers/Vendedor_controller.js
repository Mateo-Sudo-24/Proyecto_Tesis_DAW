import Vendedor from '../models/Vendedor.js'

const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Vendedor.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoVendedor = new Vendedor(req.body)
    nuevoVendedor.password = await nuevoVendedor.encrypPassword(password)
    nuevoVendedor.crearToken()
    await nuevoVendedor.save()
    res.status(200).json({nuevoVendedor})
}



export {
    registro
}
