const app = require("./server.js");
require("dotenv").config();
const fs = require("fs");
const { Pool } = require("pg");
const handlebars = require("handlebars");
const helpers = require("./views/helpers/helpers.js");
module.exports = app;

const puerto = process.env.PORT || 4000;
///////////////////////////////////////////////////IMPORTACIONNES////////////////////////////////
const {
  // registrarUsuario,
  nuevo_usuario,
  trae_usuario_email,
  trae_password_encriptada,
  trae_usuario,
  trae_usuario_id,
  trae_vendedor_id,
  nuevo_producto,
  actualizar_usuario,
  elimina_producto,
  desactivar,
  getDate,
  muestra_usuarios,
  muestra_inventario,
  encuentra_producto,
  // trae_usuario,
  obtenerProductosPorUsuario,
  obtenerVendedores,
  obtenerCamposSector,
  trae_usuario_idproducto,
  obtenerTransacciones,
  obtenerNotificaciones,
  insertarOrdenCompra,
  rechazarSolicitud,
  aceptarSolicitud
} = require("./database");

const { encripta, compara } = require("./encriptador");
const { genera_token, verifica_token } = require("./verificadorToken");
const { cookie } = require("./cookie");
const enviar = require('./correo');
Object.keys(helpers).forEach(function (key) {
  handlebars.registerHelper(key, helpers[key]);
});

app.get("/cerrar-sesion", (req, res) => {
  res.clearCookie("retoken");
  res.redirect("/");
});

///////////////////////////////////////////////////////RUTAS POR TRABAJAR GET////////////////////////
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

app.get("/transacciones", async (req, res) => {
  res.render("transacciones");
});

app.get("/403", (req, res) => {
  res.render("index");
});

app.get("/contacto", async (req, res) => {
  res.render("contacto");
});

///////////////////////////////////////////////////////TRAE LA VISTA DEL BUSCADOR PUBLICO/////////
app.get("/", async (req, res) => {
  res.render("index");
});

/////////////////////////////////////////////////////BUSCA PRODUCTO PUBLICO /////////////////////////
app.post("/publico", async (req, res) => {
  try {
    const busquedaInput = req.body["busqueda-input"];

    // Verificar si el campo de búsqueda está vacío
    if (!busquedaInput.trim()) {
      res.render("contacto");
    }

    const productoBuscado = await encuentra_producto(busquedaInput);
    console.log(productoBuscado);

    res.render("productoEncontradoPublico", {
      codigo: productoBuscado.id_codigo,
      marca: productoBuscado.id_marca,
      nombre: productoBuscado.nombrep,
      precio: productoBuscado.precio,
      sexo: productoBuscado.sexo,
    });
  } catch (error) {
    console.error('Error en la ruta "/publico":', error);
    res.status(500).send("Error interno del servidor");
  }
});

///////////////////////////////////////////BUSCAR PRODUCTO PRIVADO//////////////////////////////////////////////

app.post("/privado", async (req, res) => {
  try {
    const busquedaInput = req.body["busqueda-input"];
    console.log(busquedaInput);
    const productoBuscado = await encuentra_producto(busquedaInput);

    const redirectURL = `/listaVendedores/${productoBuscado.codigo}`;

    // Redirecciona al usuario a la URL construida
    res.redirect(redirectURL);
    console.log(redirectURL);
  } catch (error) {
    console.error('Error en la ruta "/privado":', error);
    res.render("index");
  }
});

//////////////////////////////////////////////////LISTAR VENDEDORES POR PRODUCTO con cookie////////////////////////////////////////////////////////

app.get("/listaVendedores", cookie, async (req, res) => {
  try {
    res.render("listaVendedores");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

app.get("/listaVendedores/:idProducto", cookie, async (req, res) => {
  const { idProducto } = req.params;
  try {
    const vendedores = await obtenerVendedores(idProducto);
    const producto = await obtenerVendedores(idProducto);
    console.log(vendedores)

    res.render("listaVendedores", {
      vendedores,
      productos: producto,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

//POST BOTON

app.post("/enviar-notificacion", cookie, async (req, res) => {
  try {
    const token = await verifica_token(req.cookies.retoken);
    const data = token.data;
    const u_solicitante = data.id;
    const objeto = req.body;
    const usuario = objeto.usuario;

    // Aquí se agregan los valores que deseas insertar en la tabla orden_compra
    const cod_producto = objeto.codigo;
    // Agrega la fecha actual
    const duracion = 10;
    const estado_compra = 1;

    // Llama a la función insertarOrdenCompra para insertar los datos en la tabla orden_compra
    await insertarOrdenCompra(
      u_solicitante,
      usuario,
      cod_producto,
      duracion,
      estado_compra
    );

    const redirectURL2 = `/notificacion/${usuario}`;


   // Enviar la URL de redireccionamiento como respuesta JSON
    res.json({ redirectURL: redirectURL2 });
  } catch (error) {
    console.error('Error en la ruta "/enviar-notificacion":', error);
    res.render("contacto");
  }
});



    

////////////////////////////////NOTIFICACION////////////////////////////////////////////////////////

app.get("/notificacion", cookie, async (req, res) => {
  res.render("notificacion");
});

app.get("/notificacion/:idUsuario", cookie, async (req, res) => {
  try {
    const token = await verifica_token(req.cookies.retoken);
    const data = token.data;
    const u_solicita = data.nombre;
   const i = data.id
   const foto = data.foto
   console.log(data)
    const { idUsuario } = req.params;


    const notificacion = await obtenerNotificaciones(idUsuario);
    console.log(notificacion)
    res.render("notificacion", {
      notificacion,
      usuarioObj: {
        usuario: idUsuario,
      },
      foto,
      i,
      u_solicita, // Agregamos u_solicitante al objeto que se pasa a res.render
    });
  } catch (error) {
    console.error(error);
  }
});


app.post("/enviar-confirmacion", async (req, res) => {
  try {
    
  const objeto = req.body;
  const u_solicitado = objeto.u_solicitado;
  const cod_producto = objeto.cod_producto
  console.log(u_solicitado);
  ///
  const nombre_comprador = objeto.n_solicitante
  const nombre_vendedor = objeto.n_solicitado
  const producto = objeto.nombrep;
  // //cambiar cantidad total por unidades despues
  const cantidad_requerida = objeto.cantidad;
  const id = objeto.u_solicitante
  const idv = objeto.u_solicitado
  const comprador = await trae_usuario_id(id);
  const email_comprador = comprador.email;
  const vendedor = await trae_vendedor_id(idv);
  const email_vendedor = vendedor.email;
  console.log(id, nombre_comprador, email_comprador, idv, nombre_vendedor, email_vendedor, producto, cantidad_requerida);
  const datos = {
    id,
    nombre_comprador,
    email_comprador,
    idv,
    nombre_vendedor,
    email_vendedor,
    producto,
    cantidad_requerida
  }; 


    // Llamar a la función rechazarSolicitud con el ID proporcionado en el cuerpo de la solicitud
    await enviar(datos);
    console.log("Datos recibidos:", datos);
    await aceptarSolicitud(objeto.u_solicitado);

    

    // Enviar una respuesta al cliente si se actualiza la base de datos correctamente
    res.status(200).redirect("index");
  } catch (error) {
    // Manejar cualquier error que se produzca durante la actualización de la base de datos
    console.error(error);
    res.status(500).send("Error al rechazar la orden de compra");
  }
});



////////////////////post cambiar estado a orden_compra de 1 a 3//////////
app.post("/enviar-rechazar", async (req, res) => {
  const objeto = req.body;
  const u_solicitado = objeto.u_solicitado;
  const cod_producto = objeto.cod_producto
  console.log(u_solicitado);

  try {
    // Llamar a la función rechazarSolicitud con el ID proporcionado en el cuerpo de la solicitud
    await rechazarSolicitud(objeto.u_solicitado);


    // Enviar una respuesta al cliente si se actualiza la base de datos correctamente
    res.status(200).redirect("index");
  } catch (error) {
    // Manejar cualquier error que se produzca durante la actualización de la base de datos
    console.error(error);
    res.status(500).send("Error al rechazar la orden de compra");
  }
});

///////////////////////////////////////////TRNSACCIONES//////////////////////////////////////////////////

app.get("/transacciones/:idUsuario",cookie, async (req, res) => {
    try {
      const token = await verifica_token(req.cookies.retoken);
  const data = token.data;
  const u_solicitante = data.nombre;
  const { idUsuario } = req.params;


    const transacciones = await obtenerTransacciones(idUsuario);
    res.render("transacciones", {
      transacciones,
      usuarioObj: {
        usuario: idUsuario,
      },
      u_solicitante// Agregamos u_solicitante al objeto que se pasa a res.render
    });


    console.log(transacciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////RUTAS INICIO SESION PERFILES//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// //////////////////////////////////////////////////////TRAE LA VISTA DEL PERFIL////////////////
app.get("/perfil", cookie, async (req, res) => {
  const token = await verifica_token(req.cookies.retoken);
  const data = token.data;
  const { id, nombre, rut, email, telefono, sector, foto } = data;
  const productos = await obtenerProductosPorUsuario(id);
  res.render("perfil", {
    usuario: id,
    nombre,
    rut,
    email,
    telefono,
    sector,
    foto,
    productos,
  });
  console.log(foto);
});

////////////////////////////////hacer funcionar boton notificaciones del perfil/////////////////////////////////////////////////
app.get("/perfilnotificacion", cookie, async (req, res) => {
  try {
    const token = await verifica_token(req.cookies.retoken);
    const data = token.data;
    const u_solicitante = data.id;
    const objeto = req.body;
    console.log(u_solicitante)
   
    const redirectURL3 = `/notificacion/${u_solicitante}`;
    res.redirect(redirectURL3);
  } catch (error) {
    console.error('Error en la ruta "/perfilnotificacion":', error);
    res.render("contacto");
  }
});

//////////////////////////////hacer funcionar boton transacciones//////////////////////////////////////////////////////////////////////////////////////////////
app.get("/perfiltransacciones", cookie, async (req, res) => {
  try {
    const token = await verifica_token(req.cookies.retoken);
    const data = token.data;
    const u_solicitante = data.id;
    const objeto = req.body;
    console.log(u_solicitante)
   
    const redirectURL3 = `/transacciones/${u_solicitante}`;
    res.redirect(redirectURL3);
  } catch (error) {
    console.error('Error en la ruta "/perfiltransacciones":', error);
    res.render("contacto");
  }
});
////////////////////////////////////////////////////////////REGISTRO DE USUARIOS////////////////////

//ruta get registro con el buscador de comunas
app.get("/registro", async (req, res) => {
  try {
    const camposSector = await obtenerCamposSector();
    res.render("registro", {
      camposSector,
    });
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

//ruta post para ingresar datos y crear nuevo usuario, debe redireccionar a inicio de sesion
app.post("/registro", async (req, res) => {
  const { sector, nombree, email, rut, password, telefono, repite_password } =
    req.body;
  const sectorId = parseInt(sector);
  const id_rol = 1;
  const is_active = 1;
  const busca_usuario = await trae_usuario_email(email);

  if (busca_usuario) {
    return res.status(400).send("Usuario ya se encuentra registrado");
  }

  if (
    !sector ||
    !nombree ||
    !email ||
    !rut ||
    !id_rol ||
    !password ||
    !repite_password ||
    !is_active ||
    !telefono
  ) {
    return res.status(400).send("Faltan parámetros");
  }

  if (password != repite_password) {
    return res
      .status(418)
      .send("Debe repetir la misma contraseña para crear su cuenta");
  }

  const { files } = req;
  if (!req.files) {
    return res.status(400).send("Debe ingresar una foto del producto");
  }

  const { foto } = files;
  if (!foto || foto == null) {
    return res.status(400).send("Error al ingresar foto de perfil");
  }
  const [file_tipo, file_extension] = foto.mimetype.split("/");
  if (file_tipo !== "image") {
    return res.status(400).send("Solo se aceptan formatos de imagen");
  }
  const valida_extesion = ["jpg", "jpeg", "png", "webp"];
  if (!valida_extesion.includes(file_extension)) {
    return res.status(400).send("Formato de imagen no válido");
  }

  const password_encriptada = await encripta(password);

  const nombreImagen = `foto_${nombree}_${Date.now()}.${file_extension}`;

  const foto_usuario = `https://marketplace-proyecto-production.up.railway.app/uploads/${nombreImagen}`;

  const usuario = await nuevo_usuario(
    sectorId,
    nombree,
    email,
    rut,
    id_rol,
    password_encriptada,
    is_active,
    telefono,
    foto_usuario
  );

  foto.mv(`${__dirname}/public/uploads/${nombreImagen}`, async (err) => {
    if (err)
      return res.status(500).send({
        error: `algo salio mal... ${err}`,
        code: 500,
      });
    res.redirect("/inicioSesion");
  });
});

///////////////////////////////////////////////eliminiar usuario (o desactivar) ok//////////////
//eliminar usuario con objeto
app.put("/enviar-objeto3", async function (req, res) {
  var objeto = req.body;
  let id = objeto["id"];
  // console.log(id);
  // console.log(objeto);
  try {
    const usuario = await trae_usuario_id(id);
    // console.log(usuario);
    if (usuario) {
      const desactivado = 2;
      console.log(desactivado, id);
      await desactivar(desactivado, id);
      res.status(200).json({
        message: "Su datos han sido eliminados",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Ha ocurrido un error",
    });
  }
  res.redirect("/");
});

//actualizar usuario (solo telefono) hace todo pero no guarda muestra undefine//////////////
app.put("/actualizar/:email", async (req, res) => {
  const email = req.params.email;
  const telefono = req.body.telefono;

  const datos = { email, telefono };

  console.log(email);
  console.log(telefono);

  await actualizar_usuario(datos);

  res.status(200).json({
    message: "Sus datos han sido actualizados",
  });
});

/////////////////////////////////////////////////////// INICIO DE SESION /////////
app.get("/inicio", (req, res) => {
  res.render("inicioSesion");
});

////////////////////////////////////////////////////////INICIO DE SESION trae formulario/////////////////////////////////////////////////////
app.get("/inicioSesion", async (req, res) => {
  res.render("inicioSesion");
});

//inicio de sesion debe redireccionar a perfil con cookie
app.post("/inicioSesion", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      error: "Faltan parametros",
    });
  const usuario = await trae_usuario_email(email);

  if (!usuario) {
    res.status(404).send({
      error: "Este usuario no se ha registrado",
      code: 404,
    });
  } else {
    const usuario_id = await trae_password_encriptada(email);
    password_encriptada = usuario_id.password;
    const compara_password = await compara(password, password_encriptada);

    if (compara_password === false) {
      res.status(401).send({
        error: "Credenciales incorrectas",
        code: 401,
      });
    }
    const usuario = await trae_usuario(email, password_encriptada);
    const token = await genera_token(usuario);
    // console.log(token);
    res.cookie("retoken", token, {
      httpOnly: true,
    });
    res.redirect("/perfil");
  }
});

// //////////////////////////////////////////////TRAE LA VISTA DEL PERFIL con cookie////////////////
app.get("/perfil", cookie, async (req, res) => {
  const token = await verifica_token(req.cookies.retoken);
  const data = token.data;
  const { id, nombre, rut, email, telefono, sector, foto } = data;
  const productos = await obtenerProductosPorUsuario(id);

  console.log(productos);
  res.render("perfil", {
    id,
    nombre,
    rut,
    email,
    telefono,
    sector,
    foto,
    productos,
  });
});
/////////////////////////BUSCA PRODUCTO USUARIO LOGEADO (falta incluir cookie)//////////////////////
// app.get("/productosDisponibles", cookie, async (req, res) => {
//   const token = await verifica_token(req.cookies.retoken);
//   const data = token.data;
//   const { id, nombre, rut, email, telefono, sector, foto } = data;
//   const productos = await obtenerProductosPorUsuario(id);
//   res.render("perfil", {
//     id,
//     nombre,
//     rut,
//     email,
//     telefono,
//     sector,
//     foto,
//     productos,
//   });
// });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INVENTARIO//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////REGISTRAR PRODUCTOS EN EL INVENTARIO///////////
app.get("/inventario", cookie, async (req, res) => {
  res.render("tuInventario");
});

//ruta post que registra un producto, al terminar redirenderisa datos en inventario del usuario
app.post("/tuInventario", cookie, async (req, res) => {
  // console.log(req.body);
  const token = await verifica_token(req.cookies.retoken);
  const data = token.data;
  const { email, id } = data;
  // console.log ({email, id});
  const { marca, nombrep, precio, codigo, cantidad } = req.body;
  const usuario = id;
  // console.log(usuario);
  const id_estado = 1;
  const tipo_cliente = 5;

  if (!marca || !nombrep || !precio || !codigo) {
    return res.status(400).send("Faltan parámetros");
  }

  const { files } = req;
  if (!req.files) {
    return res.status(400).send("Debe ingresar una foto del producto");
  }

  const { foto } = files;
  if (!foto || foto == null) {
    return res.status(400).send("Error al ingresar foto de producto");
  }

  const { nombre } = foto;
  const foto_producto = `http://localhost:` + puerto + `/uploads/${nombre}`;

  try {
    const producto = await nuevo_producto(
      usuario,
      codigo,
      cantidad,
      id_estado,
      marca,
      nombrep,
      precio,
      tipo_cliente,
      foto_producto
    );
    foto.mv(`${__dirname}/public/uploads/${nombre}`, async (err) => {
      if (err)
        return res.status(500).send({
          error: `algo salio mal... ${err}`,
          code: 500,
        });
      res.redirect("/perfil");
    });
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal...${e}`,
      code: 500,
    });
  }
});

//elimina producto de inventario (falta que recargue y refresque)
app.delete("/enviar-objeto2", async function (req, res) {
  var objeto = req.body;
  let id = objeto["id"];
  console.log(id);
  console.log(objeto);
  await elimina_producto(id);
  res.redirect("/perfil");
});

///////////////////////////////////////////////////////ADMINISTRACION////////////

//ruta que trae vista de administarcion ok
app.get("/administracion", async (req, res) => {
  // console.log(req.body);
  res.render("administracion");
});

//autentica a funcionario administardor ok
app.post("/administracion", async (req, res) => {
  const { contrasena_funcionario, nombre_funcionario } = req.body;
  if (contrasena_funcionario === process.env.ADMIN) {
    // console.log(req.body);
    res.render("admin_usuarios");
  } else {
    res.render("/");
  }
});

///////////////////////////////////////////AUTORIZAR USUARIOS/////

//ruta que trae lista de usuarios para su autorizacion
app.get("/admin_usuarios", async (req, res) => {
  try {
    const usuarios = await muestra_usuarios();
    // console.log(usuarios);
    res.render("administracion", {
      usuarios,
    });
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal...${e}`,
      code: 500,
    });
  }
});

//ruta put que cambia estado de usuarios
app.put("/administracion", async (req, res) => {
  const { is_active, email } = req.body;

  try {
    const usuario = await cambiar_estado(is_active, email);
    res.status(200).send(usuario);
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal...${e}`,
      code: 500,
    });
  }
});

//////////////////////////////////////////////////////////////////////////////CODIGO BASURAAAAAA/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////CODIGO BASURAAAAAA/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////CODIGO BASURAAAAAA/////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.post('/enviar-objeto', function(req, res) {
//   var objeto = req.body;
// console.log(objeto);
//   // Hacer algo con el objeto que recibiste, como guardarlo en una base de datos

//   res.send('Objeto recibido correctamente');
// });

////////////////////////////////////////////////////////////////////////////////////

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

// app.get('/inventario/:idUsuario', async (req, res) => {
//   const { idUsuario } = req.params;
//   try {

//     const productos = await obtenerProductosPorUsuario(idUsuario);
//     res.render('tuInventario', { productos });
//     // console.log(productos);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ mensaje: 'Error interno del servidor' });
//   }
// });

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////DESDE AQUI ESTA MAS O MENOS AVANZADO////////////
/////////////////////////////////////////////////////////////////////////////////////////////

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

// app.get('/listaVendedores/:id', async(req, res) => {
//   console.log(req.body.nombre);
//   const idproducto = req.params;
//   try {
//     const vendedores = await trae_usuario_idproducto(idproducto);
//     // const vendedores = await obtenerVendedores(idproducto);
//     console.log(vendedores);
//     res.render('listaVendedores', { vendedores });

//   } catch (e) {
//       res.status(500).send({
//         error: `Algo salio mal...${e}`,
//         code: 500
//     });

//   }
// });

/////
// const{nombre}= foto;
// const foto_usuario = (`http://localhost:`+ puerto +`/uploads/${nombre}`);
// const password_encriptada = await encripta(password);

// try {

//     const usuario = await nuevo_usuario(sectorId, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario);
//     foto.mv(`${__dirname}/public/uploads/${nombre}`, async (err) => {
//         if (err) return res.status(500).send({
//             error: `algo salio mal... ${err}`,
//             code: 500
//         })
//         res.redirect("/inicioSesion");
//     })

// } catch (e) {
//     res.status(500).send({
//         error: `Algo salio mal...${e}`,
//         code: 500
//     })
// }

// const{nombre}= foto;
// // const foto_usuario = (`http://localhost:`+ puerto +`/uploads/${nombre}`);
// const foto_usuario = `https://marketplace-proyecto-production.up.railway.app/uploads/${nombre}`;
// const password_encriptada = await encripta(password);

// try {

//     const usuario = await nuevo_usuario(sectorId, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario);
//     foto.mv(`${__dirname}/public/uploads/${nombre}`, async (err) => {
//         if (err) return res.status(500).send({
//             error: `algo salio mal... ${err}`,
//             code: 500
//         })
//         res.redirect("/inicioSesion");
//     })

// } catch (e) {
//     res.status(500).send({
//         error: `Algo salio mal...${e}`,
//         code: 500
//     })
// }
/////

// app.get("/listaVendedores", async (req, res) => {
//   res.render("listaVendedores");
// });

// app.get('/listaVendedores/:idProducto', async (req, res) => {
//   const { idProducto } = req.params;
//   try {

//     const vendedores = await obtenerVendedores(idProducto);
//     res.render('listaVendedores', { vendedores });
//     console.log(vendedores);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ mensaje: 'Error interno del servidor' });
//   }
// });

// app.post("/enviar-contacto", function (req, res) {
//   var objeto = req.body;
//   console.log(objeto);
// Hacer algo con el objeto que recibiste, como guardarlo en una base de datos

//   res.send("Objeto recibido correctamente");
// });
