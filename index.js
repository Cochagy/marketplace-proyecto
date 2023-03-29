const app = require("./middleware.js");
require("dotenv").config();
const fs = require("fs");
const { Pool } = require('pg');
const Handlebars = require("handlebars");

const puerto = process.env.PORT || 4000
///////////////////////////////////////////////////IMPORTACIONNES////////////////////////////////
const { 
  
  // registrarUsuario,
  nuevo_usuario,
  trae_usuario_email,
  trae_password_encriptada,
  trae_usuario,  
  nuevo_producto,
  getDate,
  muestra_usuarios, 
  muestra_inventario, 
  encuentra_producto,
  // trae_usuario,
  obtenerProductosPorUsuario,
  obtenerVendedores,
  obtenerCamposSector
} = require("./database");

const  { encripta, compara }  = require('./encriptador');
const { genera_token, verifica_token } = require('./verificadorToken');
const { cookie } = require('./cookie');

/////////////////////////////////////////UTIL PARA REALIZAR PRUEBAS, SOLO SE DESCOMENTA///////////
// getDate();
// muestra_usuarios();
// muestra_inventario();

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////RUTAS/////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////TRAE LA VISTA DEL BUSCADOR PUBLICO/////////
app.get("/", async (req, res) => {
  res.render("index");
});

///////////////////////////////////////////////////////TRAE FORMULARIO INICIO DE SESION /////////
app.get("/inicio", (req, res) => {
  // console.log(req.body);
  res.render("inicioSesion");
});

// //////////////////////////////////////////////////////TRAE LA VISTA DEL PERFIL////////////////
app.get("/perfil", (req, res) => {
  res.render("perfil");
});

///////////////////////////////////////////////////////RUTAS POR TRABAJAR////////////////////////
app.get("/contacto", async (req, res) => {
  res.render("contacto");
});

app.post("/contacto", (req, res) => {
  res.send(req.body);
});

app.get("/registroProductos", async (req, res) => {
  res.render("registroProductos");
});

app.get("/inventario", async (req, res) => {
  res.render("tuInventario");
});

app.get("/productosDisponibles", async (req, res) => {
  res.render("productosDisponibles");
});

app.get("/listaVendedores", async (req, res) => {
  res.render("listaVendedores");
});

app.get("/notificacion", async (req, res) => {
  res.render("notificacion");
});

app.get("/transacciones", async (req, res) => {
  res.render("transacciones");
});

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////DESDE AQUI ESTA MAS O MENOS AVANZADO////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////BUSCA PRODUCTO SIN INICIAR SESION/////////////////////////
app.post("/", async (req, res) => {    
  const busquedaInput = req.body["busqueda-input"];
  console.log(busquedaInput);
  const productoBuscado = await encuentra_producto(busquedaInput);
  console.log(productoBuscado);

  res.render("productoEncontradoPublico", {
    codigo: productoBuscado.id_codigo,
    marca: productoBuscado.id_marca,
    nombre: productoBuscado.nombrep,
    precio: productoBuscado.precio,
    sexo: productoBuscado.sexo,
  });


});
///////////////////////////////aqui termina lo del hito 2///////////

////////////////////////////////////////////////////////////REGISTRO DE USUARIOS////////////////////
//ruta get con formulario para crear un nuevo usuario
// app.get('/registro', (req, res) => {
//   res.render('registro');
// })

//ruta get registro con el buscador de comunas
app.get('/registro', async (req, res) => {
  try {
    const camposSector = await obtenerCamposSector();
    res.render('registro', { camposSector });
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

//ruta post para ingresar datos y crear nuevo usuario, debe redireccionar a inicio de sesion
app.post('/registro', async (req, res) => {
  console.log(req.body);
  const { sector, nombree, email, rut, password, telefono, repite_password} = req.body;    
  const sectorId = parseInt(sector);
  const id_rol = 1;
  const is_active = 1;  
  
  // if (!sector || !nombree || !email || !rut || !id_rol || !password || !repite_password || !is_active || !telefono ) {
  //     return res.status(400).send('Faltan parámetros')
  // }    
          
  // if (password != repite_password) {
  //     return res.status(418).send('Debe repetir la misma contraseña para crear su cuenta')
  // }    
  
  const {files}=req;
  if (!req.files) {
      return res.status(400).send('Debe ingresar una foto del producto')
  }

  const { foto }= files;
  if (!foto || foto == null) {
      return res.status(400).send('Error al ingresar foto de perfil')

  }
  const [file_tipo, file_extension] = foto.mimetype.split('/');
  if (file_tipo !== 'image') {
      return res.status(400).send('Solo se aceptan formatos de imagen')
  }
  const valida_extesion = ['jpg', 'jpeg', 'png', 'webp'];
  if (!valida_extesion.includes(file_extension)) {
      return res.status(400).send('Formato de imagen no válido');
  }

  const{nombre}= foto;    
  const foto_usuario = (`http://localhost:`+ puerto +`/uploads/${nombre}`);    
  const password_encriptada = await encripta(password);    
          
  try {
      
      const usuario = await nuevo_usuario(sectorId, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario);
      foto.mv(`${__dirname}/public/uploads/${nombre}`, async (err) => {
          if (err) return res.status(500).send({
              error: `algo salio mal... ${err}`,
              code: 500
          }) 
          // res.render("perfil");
          // res.status(200).json({ message: 'Bienvenido!! su cuenta ha sido creada' });
          res.render("perfil",{
            id: usuario.id,
            sector: usuario.sectorId,
            nombre: usuario.nombre, 
            email: usuario.email,
            rut: usuario.rut,
            telefono: usuario.telefono,
            id_rol: usuario.id_rol,
            // password: usuario.password,
            // repite_password: usuario.repite_password,
            is_active: usuario.is_active,
            foto: usuario.foto
          });                             
      })       
        
  } catch (e) {
      res.status(500).send({
          error: `Algo salio mal...${e}`,
          code: 500
      })       
  }           
})



///////////////////////////////////////////////////////////////////INICIO DE SESION/////////////////////////////////////////////////////
app.get("/inicioSesion", async (req, res) => {
  res.render("inicioSesion");
});

app.post("/inicioSesion", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  //console.log(email, password);
  if(!email || !password) return res.status(400).json(({error: 'Faltan parametros'}))    
    const usuario = await trae_usuario_email(email);
    // console.log(usuario.id,usuario.sector, usuario.nombre,usuario.email, usuario.rut, usuario.id_rol, usuario.password, usuario.is_active, usuario.foto);
         
    if(!usuario) {
        res.status(404).send({
            error: 'Este usuario no se ha registrado',
            code: 404,
    }); 

    // }if (usuario.is_active !== 1) {        
    //     res.status(401).send({
    //     error: 'Este usuario se encuentra en evaluacion',
    //     code: 401,
    // });  
    
    } else {

      const usuario_id = await trae_password_encriptada(email); 
      console.log(usuario_id);          
        password_encriptada = usuario_id.password;    
        const compara_password = await compara(password, password_encriptada);
        console.log(password);
        console.log(password_encriptada); 
        
        if (compara_password === false) {
            res.status(401).send({
                error: 'Credenciales incorrectas',
                code: 401,
            });
        }
        const usuario = await trae_usuario(email, password_encriptada);        
        const token = await genera_token(usuario);
        res.cookie('retoken', token, {httpOnly: true});
        // res.redirect("/perfil");     
        res.render("perfil",{
          id: usuario.id,
          sector: usuario.sector,
          nombre: usuario.nombre, 
          email: usuario.email,
          rut: usuario.rut,
          telefono: usuario.telefono,
          id_rol: usuario.id_rol,          
          is_active: usuario.is_active,
          foto: usuario.foto
        });
    }
                         
    // } else {      
    //     res.render("perfil",{
    //       id: usuario.id,
    //       sector: usuario.sector,
    //       nombre: usuario.nombrep, 
    //       email: usuario.email,
    //       rut: usuario.rut,
    //       id_rol: usuario.id_rol,
    //       // password: usuario.password,
    //       // is_active: usuario.is_active,
    //       foto: usuario.foto
    //     });
    // } 
  // res.send("aqui");
});

///////////////////////////////////////////BUSCA PRODUCTO USUARIO LOGEADO//////////////////////
app.post("/privado", async (req, res) => {
  console.log(req.body);
  const logeado = req.body;

  const busquedaInput = req.body["busqueda-input"];
  console.log(busquedaInput);
  const productoBuscado = await encuentra_producto(busquedaInput);
  console.log(productoBuscado);
  res.render("productosDisponibles", {
    codigo: productoBuscado.id_codigo,
    marca: productoBuscado.id_marca,
    nombre: productoBuscado.nombrep,
    precio: productoBuscado.precio,
    sexo: productoBuscado.sexo,
  });  
});

///////////////////////////////////////////////////REGISTRAR PRODUCTOS EN EL INVENTARIO///////////
app.get("/inventario", async (req, res) => {
  res.render("tuInventario");
});

//ruta post que crea nueva mascota, al terminar conduce a completar antecedentes de salud
app.post('/tuInventario', async (req, res) => {
  console.log(req.body);

  // const token = await verifica_token(req.cookies.retoken);
  // const data = token.data;
  // const {id} = data;   
  const { marca,nombrep, precio } = req.body;
  // const tutor_id = id;
  
  if (!marca || !nombrep || !precio ) {
      return res.status(400).send('Faltan parámetros')
  }

  const {files}=req    
  if (!req.files) {
      return res.status(400).send('Debe ingresar una foto del producto')
  }

  const { foto } = files;
  if (!foto || foto == null) {
      return res.status(400).send('Error al ingresar foto de producto')

  }

  const{nombre} = foto;    
  const foto_producto = (`http://localhost:`+ puerto +`/uploads/${nombre}`);
  //
  const id_codigo = 100;
  const id_marca = 10;
  const tipo_cliente = 3;
  //

  try {
      const producto = await nuevo_producto( id_codigo, id_marca, nombrep, precio, tipo_cliente, foto_producto);                
      foto.mv(`${__dirname}/public/uploads/${nombre}`, async (err) => {
          if (err) return res.status(500).send({
              error: `algo salio mal... ${err}`,
              code: 500
          })            
          res.redirect('/tuInventario');            
      })       
         
  } catch (e) {
      res.status(500).send({
          error: `Algo salio mal...${e}`,
          code: 500
      })       
  }     
  
});
//////////////////////////////////////////////////PAPELERA DE RECLAJE/////////////////////////////

////////////////////////////////////////////////////CODIGO REPETIDO CANDIDATO A SER ELIMINADO
// app.get("/", async (req, res) => {
//   res.render("index");
// });

// app.get("/", async (req, res) => {
//   res.render("index");
// });

  /////////////////////////////////////////////////SE USO EN EL BUSCADOR DEL HITO 2////////////////

  // const productos = JSON.parse(fs.readFileSync("./productos.json"));

  // const productoBuscado = productos.productos.find(
  //   (p) => p.nombre === busquedaInput
  // );
  // if (!productoBuscado) {
  //   res.redirect("/contacto");
  //   return;
  // }
  // res.render("productosDisponibles", {
  //   codigo: productoBuscado.codigo_p,
  //   marca: productoBuscado.marca,
  //   nombre: productoBuscado.nombre,
  //   precio: productoBuscado.precio,
  //   sexo: productoBuscado.sexo,
  // });
  // if (busquedaInput === productoBuscado.nombre) {
  //   productoBuscado.codigo_p;
  // }

//////////////////////////////////////////////////////TRAE PERFIL hito 2////////////////////////////////////////////////////////////////////

// const usuarios = require("./usuarios.json");

// app.get("/perfil", (req, res) => {
//   const usuario = usuarios.usuarios.find(
//     (u) => u.Email === "carlos.garcia@example.com"
//   );

//   if (!usuario) {
//     res.redirect("/login");
//     return;
//   }

//   res.render("perfil", {
//     nombre: usuario.nombre,
//     email: usuario.Email,
//     contraseña: usuario.contraseña,
//     telefono: usuario.telefono,
//     direccion: usuario.direccion,
//     comuna: usuario.Comuna.trim(),
//   });
// });

////////////////////////////////////////////////LISTAR PRODUCTOS POR USUARIO///////////////////////////////////////////////////////////

app.get('/inventario/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;
  try {

    const productos = await obtenerProductosPorUsuario(idUsuario);
    res.render('tuInventario', { productos });
    console.log(productos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


//////////////////////////////////////////////////LISTAR VENDEDORES POR PRODUCTO////////////////////////////////////////////////////////

app.get('/listaVendedores/:idProducto', async (req, res) => {
  const { idProducto } = req.params;
  try {

    const vendedores = await obtenerVendedores(idProducto);
    res.render('listaVendedores', { vendedores });
    console.log(vendedores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


app.post('/enviar-objeto', function(req, res) {
  var objeto = req.body;
console.log(objeto);
  // Hacer algo con el objeto que recibiste, como guardarlo en una base de datos

  res.send('Objeto recibido correctamente');
});

////////////////////////////////////////////////////////////////////////////////////

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});


//////////////////////////////////////////////////////////////////////BORRAR USUARIO HITO 2///////////////////////////////////////////////////////////////////

// app.use((req, res, next) => {
//   if (req.headers['x-http-method-override']) {
//     req.method = req.headers['x-http-method-override'];
//   }
//   next();
// });

// // Ruta para manejar solicitudes DELETE
// app.delete("/eliminar/:RUT", (req, res) => {
//   const RUT = req.params.RUT;
//   if (!RUT || typeof RUT !== 'string') {
//     return res.status(400).json({
//       message: 'RUT inválido'
//     });
//   }

//   let usuarios = JSON.parse(fs.readFileSync('usuarios.json'));

//   const index = usuarios.usuarios.findIndex((u) => u.RUT === RUT);

//   if (index < 0) {
//     return res.status(404).json({
//       message: 'Usuario no encontrado'
//     });
//   }

//   usuarios.usuarios.splice(index, 1);

//   fs.writeFileSync('usuarios.json', JSON.stringify(usuarios), 'utf-8');

  // Agrega el siguiente código para mostrar una alerta al usuario
//   const mensaje = 'Usuario eliminado con éxito';
//   res.send(`
//      <script>
//        alert('${mensaje}');
//        window.location.href = '/'; // redirige al usuario a la página principal
//      </script>
//    `);
// });


/////////////////////////////////////////////////////////BORRA PRODUCTO HITO 2//////////////////

// app.delete("/productos/:codigo_p", (req, res) => {
//   const codigo_p = req.params.codigo_p;

//   const productoEliminado = productos.find(
//     (p) => p.codigo_p === parseInt(codigo_p)
//   );

//   if (productoEliminado) {
//     productos = productos.filter((p) => p.codigo_p !== parseInt(codigo_p));
//     return res.status(200).json({
//       message: "Producto eliminado con éxito",
//     });
//   }

//   return res.status(404).json({
//     message: "Producto no encontrado",
//   });
// });

/////////////////////////////////////////////////////////////////////LOGIN  HITO 2////////////////

// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const usuario = usuarios.usuarios.find((u) => u.Email === email);

//   if (!usuario) {
//     res.render("login", {
//       mensaje: "Usuario no encontrado",
//     });
//     return;
//   }

//   if (usuario.contraseña !== password) {
//     res.render("login", {
//       mensaje: "Contraseña incorrecta",
//     });
//     return;
//   }

//   res.redirect("/perfil");
// });

////////////////////////////////////////////////////CODIGO COMENTADO DEL HITO 2////////////////////

// nuevo//
// app.get("/inicio", async (req, res) => {
//   res.render("inicioSesion");
// });

//app.get("/perfil", async (req, res) => {
//res.render("perfil");
//});


// // llamar datos perfil
// const usuarios = require('./usuarios.json');

// app.get('/perfil', (req, res) => {
//   // Aquí obtenemos los datos del usuario logeado
//   const usuario = usuarios.usuarios.find(u => u.Email === 'carlos.garcia@example.com');
//   // Si no se encuentra el usuario, redirigimos a la página de inicio de sesión

//   if (!usuario) {
//     res.redirect('/login');
//     return;
//   }

//   // Renderizamos el HTML con los datos del usuario
//   res.render('perfil', {
//     nombre: usuario.nombre,
//     email: usuario.Email,
//     contraseña: usuario.contraseña,
//     telefono: usuario.telefono,
//     direccion: usuario.direccion,
//     comuna: usuario.Comuna.trim(),

//   });

// });

////////////////////////////////////////////////////registro de usuarios pedro///////////////////////////////
// app.get("/registro", async (req, res) => {
//   res.render("registro");
// });

// app.post("/registro", async (req, res) => {
//   const {
//     foto
//   } = req.files;
//   const {
//     name
//   } = foto;
//   const {
//     nombre,
//     email,
//     password,
//   } = req.body
//   try {
//     await registrarUsuario(nombre, email, password, name);
//     res.status(201);
//     res.render('inicio');
//   } catch (e) {
//     res.status(500).json({
//       error: `Algo salió mal... ${e}`,
//       code: 500
//     });
//   };
//   foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
//     if (err) return res.status(500).json({
//       error: `Algo salió mal...${err}`,
//       code: 500
//     });
//     res.status(201);
//   });
// });