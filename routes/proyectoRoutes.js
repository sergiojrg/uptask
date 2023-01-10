import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador,
    obtenerTareas
} from '../controllers/proyectoController.js'

import checkout from '../middleware/checkout.js'
import express from 'express'

const router = express.Router()

router
    .route('/')
    .get(checkout,obtenerProyectos)
    .post(checkout,nuevoProyecto)

router
    .route('/:id')
    .get(checkout,obtenerProyecto)
    .put(checkout,editarProyecto)
    .delete(checkout,eliminarProyecto)


    
    // router.get('/tareas/:id', checkout,obtenerTareas)
router.post('/colaboradores',checkout,buscarColaborador)
router.post('/agregar-colaborador/:id',checkout,agregarColaborador)
router.post('/eliminar-colaborador/:id',checkout,eliminarColaborador)

export default router