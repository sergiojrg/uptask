import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import emailRegistro, {emailOlvidePassword} from '../helpers/emails.js'

const registrarUsuarios = async (req,res) => {

    //evitar registros duplicados 
    const { email } = req.body
    const exiteUsuario = await Usuario.findOne({ email: email})


    if(exiteUsuario){
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({msg:error.message})
    }

    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()

        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        res.send({msg:"Usuario creado correctamente, Revisa tu email para confirmar cuenta"})
    } catch (error) {
        console.log(error)
    }

}

const autenticar = async (req,res) => {

    const { email, password } = req.body

    //comprobar si el usuario existe
    const usuario = await Usuario.findOne({
        email: email
    })

    if(!usuario){
        const error = new Error('El usuario no existe')
        res.status(400).json({msg: error.message})
        return
    }

    
    //comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        const error = new Error('El usuario no esta confirmado')
        return res.status(403).json({msg: error.message})
    }
    
    //comprobar su password
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)
        })
    }else{
        const error = new Error('El password es incorrecto')
        return res.status(403).json({msg: error.message})
    }
}

const confirmar = async (req,res) =>{
    const {token} = req.params
    const usuarioConfirmar = await Usuario.findOne({
        token: token
    })

    if(!usuarioConfirmar){
        const error = new Error('Token no valido')
        return res.status(403).json({msg: error.message})
    }

    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ""
        await usuarioConfirmar.save()
        res.json({msg:'Usuario confirmado correctamente'})

    } catch (error) {
        console.log(error)
    }
}

const olvidePassword = async (req,res) => {
    const {email} = req.body;

    const usuario = await Usuario.findOne({
        email
    })

    if(!usuario){
        const error = new Error('No existe el usuario')
        return res.status(400).json({msg: error.message})
    }

    try {
        usuario.token = generarId()
        await usuario.save()
        emailOlvidePassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })
        res.json({msg:'Hemos enviado un email con las instrucciones'})

    } catch (error) {
        console.log(error)
    }

}

const comprobarToken = async (req,res) => {
    const { token } = req.params

    const usuario = await Usuario.findOne({
        token: token
    })

    if(!usuario){
        const error = new Error('El usuario no es valido')
        return res.status(403).json({msg: error.message})
    }

    res.json({msg:'El usuario existe'})
}

const nuevoPassword = async (req,res) => {
    const  {token} = req.params
    const {password} = req.body


    const usuario = await Usuario.findOne({
        token: token
    })

    if(!usuario){
        const error = new Error('El usuario no es valido')
        return res.status(403).json({msg: error.message})
    }

    try {
        usuario.token = ""
        usuario.password = password
        await usuario.save()
        res.json({msg:"Password modificado correctamente"})
    } catch (error) {
        console.log(error)
    }

}


const perfil = async(req,res) => {
    const { usuario } = req

    res.json(usuario)
}

export {
    registrarUsuarios,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
}