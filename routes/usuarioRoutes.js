import express from 'express'
import { perfil, registrarUsuarios, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword } from '../controllers/usuarioController.js'
import checkout from '../middleware/checkout.js'

const router = express.Router()

// Creacion, Autenticacion y Confirmacion de Usuarios

router.post('/',registrarUsuarios) //crear usuario nuevo
router.post('/login',autenticar)  //login de usuario
router.get('/confirmar/:token', confirmar)

router.post('/olvide-password', olvidePassword)
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)

router.get('/perfil', checkout, perfil)


export default router