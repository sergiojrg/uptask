import Proyecto from '../models/Proyecto.js'
import Tareas from '../models/Tareas.js'
import Usuario from '../models/Usuario.js'

const obtenerProyectos = async(req,res) => {

    const proyectos = await Proyecto.find({
        '$or': [
           {'colaboradores': {$in: req.usuario}}, 
           {'creador': {$in: req.usuario}}, 
        ]
    })
        .select('-tareas')

    res.json(proyectos)
}

const nuevoProyecto = async(req,res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async(req,res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)
                    .populate({ path: 'tareas',populate: {path:'completado',select:'nombre'} })
                    .populate('colaboradores', "nombre email")

    if(!proyecto){
        const error = new Error('No encontrado')
        return res.status(404).json({msg: error.message})
    }

    if ( proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("Acción No Válida");
        return res.status(401).json({ msg: error.message });
    }

    res.json(
        proyecto
    )
}

const editarProyecto = async(req,res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)

    if(!proyecto){
        const error = new Error('No encontrado')
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida')
        return res.status(404).json({msg: error.message})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const eliminarProyecto = async(req,res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)

    if(!proyecto){
        const error = new Error('No encontrado')
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida')
        return res.status(404).json({msg: error.message})
    }

    try {
        await proyecto.deleteOne()
        res.json({msg: 'Proyecto eliminado.'})
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async(req,res) => {
    try {
        const {email} = req.body
        const usuarioExiste = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ')

        if(!usuarioExiste){
            const error = new Error('Usuarios no encontrado')
            return res.status(404).json({msg:error.message})
        }
        res.status(200).json(usuarioExiste)
    } catch (error) {

    }
}

const agregarColaborador = async(req,res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id)
        const { email } = req.body

        if(!proyecto){
            const error = new Error('Proyecto no encontrado')
            return res.status(404).json({msg:error.message})
        }

        if(proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error('Accion no valida')
            return res.status(404).json({msg:error.message})
        }

        const usuarioExiste = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ')

        if(!usuarioExiste){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({msg:error.message})
        }

        // El colaborador no es admin
        if(proyecto.creador.toString() === usuarioExiste._id.toString()){
            const error = new Error('No se puede agregar el administrador')
            return res.status(404).json({msg:error.message})
        }

        //Checar si no esta ya en los colaboradores
        if(proyecto.colaboradores.includes(usuarioExiste._id)){
            const error = new Error('Ya esta el usuario en el proyecto')
            return res.status(404).json({msg:error.message})
        }

        //Agregar
        proyecto.colaboradores.push(usuarioExiste._id)
        await proyecto.save()
        res.json({msg: 'Colaborador agregado correctamente'})

    } catch (error) {
        console.log(error)
    }
    
}

const eliminarColaborador = async(req,res) => {
    try {
        const proyecto = Proyecto.findById(req.params.id)        
        if(!proyecto){
            const error = new Error('El proyecto no existe')
            return res.status(404).json({msg:error.message})
        }

        if(proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error('Accion no valida')
            return res.status(404).json({msg:error.message})
        }

        proyecto.colaboradores.pull(req.body.id)
        await proyecto.save()
        res.json({msg:'Colaborador eliminado'})
        
    } catch (error) {
        console.log(error)
    }
}

const obtenerTareas = async(req,res) => {
    const { id } = req.params

    const existeProyecto = await Proyecto.findById(id)

    if(!existeProyecto){
        const error = new Error('No existe el proyecto')
        return res.status(404).json({msg: error.message})
    }

    // tienes que ser el creador del proyecto o colaborador

    const tareas = await Tareas.find().where('proyecto').equals(id)

    res.json(tareas)
} 

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    obtenerTareas,
    buscarColaborador
}