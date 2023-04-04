const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {        
        user: process.env.NMUSER,
        pass: process.env.NMPASS,
    },
});

// let email1 = process.env.EMAIL1;
// let email2 = process.env.EMAIL2;

const enviar = async (datos) => {  
    console.log(datos); 
    const email_comprador = datos.email_comprador;
    const email_vendedor = datos.email_vendedor;
    const producto = datos.producto;
    const nombre_comprador = datos.nombre_comprador;
    const nombre_vendedor = datos.nombre_vendedor; 
    const cantidad_requerida = datos.cantidad 
    console.log(email_comprador, email_vendedor)  
   
    let mailOptionsComprador = {
        from: process.env.NMUSER,                                                                  
        to: email_comprador,
        subject: `Solicitud de compra producto: ${producto}`,                                               
        html: `<h3>Hola ${nombre_comprador}!!<br><br>Tu solicitud de compra ha sido enviada a ${nombre_vendedor} para el siguiente producto:<br> ${producto}</p>
        <p>Quedo atento(a) a su confirmacion</p><br>
        ${nombre_comprador}`         
    };

    let mailOptionsVendedor = {
        from: process.env.NMUSER,                                                                  
        to: email_vendedor,
        subject: `Solicitud de compra producto: ${producto}`,                                               
        html: `<h3>Hola ${nombre_vendedor}!!<br><br>Mi nombre es ${nombre_comprador} y quiero comprar el siguiente producto:<br> ${producto}</p>     

        <p>Quedo atento(a) a tu confirmacion</p><br>
        ${nombre_comprador}`         
    };
    
    try {
        await transporter.sendMail(mailOptionsComprador);
      } catch (error) {
        console.error("Error al enviar correo al comprador:", error);
      }
      
      try {
        await transporter.sendMail(mailOptionsVendedor);
      } catch (error) {
        console.error("Error al enviar correo al vendedor:", error);
      }

    console.log(`Estimado ${nombre_comprador} su correo ha sido enviado`)
    // res.send(`Estimado ${nombre_comprador}  su correo ha sido enviado`)
};

module.exports = enviar;