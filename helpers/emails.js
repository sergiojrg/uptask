import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos
    
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    //informacion del email
    const info = await transport.sendMail({
        from: '"uptask - administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "uptask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en uptask",
        html: `
            <p>
                Hola ${nombre} comprueba tu cuenta en uptask
            </p>
            <p>
                Tu cuenta ya esta casi lista solo falta comprobarla en el siguiente enlace:
            </p>

            <a
                href="${process.env.FRONTEND_URL}/confirmar/${token}"
            >
                Comprobar
            </a>
        `
    })
}

export const emailOlvidePassword = async datos => {
    const { email, nombre, token } = datos
    
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    //informacion del email
    const info = await transport.sendMail({
        from: '"uptask - administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "uptask - Reinicia tu password",
        text: "Reestablece tu contraseña",
        html: `
            <p>
                Hola ${nombre}, puedes cambiar tu contraseña
            </p>
            <p>
                Presiona el boton para cambiar tu contraseña
            </p>

            <a
                href="${process.env.FRONTEND_URL}/olvide-password/${token}"
            >
                Cambiar password
            </a>
        `
    })
}



export default emailRegistro
