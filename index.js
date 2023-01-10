import express from 'express'
import conectarDB from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'

import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import TareasRoutes from './routes/TareasRoutes.js'

const app = express()

// poder utilizar json verlo y mandar
app.use(express.json())

dotenv.config()

conectarDB()

//configurar cors
const whiteList = [process.env.FRONTEND_URL]
const corsOption = {
    origin: function(origin,callback){
        if(whiteList.includes(origin)){
            //puede consultar api
            callback(null,true)
        }else{
            //no esta permitido
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOption))

//Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', TareasRoutes)

const PORT = process.env.PORT || 4000   

const servidor = app.listen(PORT,()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection',(socket) => {
    console.log('conectado a socket.io')

    // Definir los eventso de socket.io
    
    socket.on('abrir proyecto',(proyecto)=>{
        socket.join(proyecto)
    })

    socket.on('nueva tarea',(tarea)=>{
        socket.to(tarea.proyecto).emit('tarea agregada',tarea)
    })

    socket.on('eliminar tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea eliminada',tarea)
    })

    socket.on('actualizar tarea',(tarea) => {
        socket.to(tarea.proyecto._id).emit('tarea actualizada',tarea)
    })

    socket.on('cambiar estado',(tarea)=>{
        console.log(tarea.proyecto)
        socket.to(tarea.proyecto).emit('estado cambiado',tarea)
    })
})