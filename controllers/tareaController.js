import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tareas.js"

const agregarTarea = async(req,res) => {
    const { proyecto } = req.body

    const proyectoExiste = await Proyecto.findById(proyecto)

    if(!proyectoExiste){
        const error = new Error('No existe el proyecto')
        return res.status(404).json({msg: error.message})
    }

    if(proyectoExiste.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes los permisos')
        return res.status(404).json({msg: error.message})
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body) 
        proyectoExiste.tareas.push(tareaAlmacenada._id)
        await proyectoExiste.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const obtenerTarea = async(req,res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea){
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    res.json(tarea)
}

const actualizarTarea = async(req,res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea){
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaActualizada = await tarea.save()
        res.json(tareaActualizada)

    } catch (error) {
        console.log(error)
    }


}

const eliminarTarea = async(req,res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea){
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    try{
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled[
            await proyecto.save(),
            await tarea.deleteOne()
        ]

        res.json({msg:"Tarea eliminada"})
    }catch(error){
        console.log(error)
    }
}

const cambiarEstado = async(req,res) => {
    const {id} = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea){
        const error = new Error('No existe la tarea')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && tarea.proyecto.colaboradores.some(tareaState => tareaState._id.toString() !== req.usuario._id.toString())){
        const error = new Error('Accion no valida')
        return res.status(404).json({msg: error.message})
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id)
        .populate('completado' ,'nombre')
    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}