const app = require("./middleware.js");
require("dotenv").config();
const fs = require("fs");
const {
  Pool
} = require('pg');

//////////////////////////////////////////////////////
const { registrarUsuario,
  getDate,
  muestra_usuarios, 
  muestra_inventario, 
  encuentra_producto
} = require("./database");

// const  { encripta, compara }  = require('./encriptador');
// const { genera_token, verifica_token } = require('./verificadorToken');
// const { cookie } = require('./cookie');

////////////////////////RUTAS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/", async (req, res) => {
  res.render("index");
});
///////////////////////////////////////////inicio de sesion////////////////
app.get("/inicioSesion", async (req, res) => {
  res.render("inicioSesion");
});

app.post("/inicioSesion", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  console.log(email, password);
  if(!email || !password) return res.status(400).json(({error: 'Faltan parametros'}))    
    const usuario = await trae_usuario(email, password);
    console.log(usuario.id,usuario.sector, usuario.nombre,usuario.email, usuario.rut, usuario.id_rol, usuario.password, usuario.is_active, usuario.foto);
         
    if(!usuario) {
        res.status(404).send({
            error: 'Este usuario no se ha registrado',
            code: 404,
    }); 

    }if (usuario.is_active !== 1) {        
        res.status(401).send({
        error: 'Este usuario se encuentra en evaluacion',
        code: 401,
        });               
                         
    } else {

      
        // const usuario_id = await trae_contrasena_encriptada(email);           
        // contrasena_encriptada = usuario_id.password;    
        // const compara_contrasena = await compara(password_tutor, password_encriptada); 
        
        // if (compara_contrasena === false) {
        //     res.status(401).send({
        //         error: 'Credenciales incorrectas',
        //         code: 401,
        //     });
        // }
        // const usuario = await trae_usuario(email, password_encriptada);        
        // const token = await genera_token(usuario);
        // res.cookie('retoken', token, {httpOnly: true});
        res.render("perfil",{
          id: usuario.id,
          sector: usuario.sector,
          nombre: usuario.nombrep, 
          email: usuario.email,
          rut: usuario.rut,
          id_rol: usuario.id_rol,
          password: usuario.password,
          is_active: usuario.is_active,
          foto: usuario.foto
        });

    } 

  // res.send("aqui");
});

///////////////////////////////////////////////////////////////
app.get("/registro", async (req, res) => {
  res.render("registro");
});

app.post("/registro", async (req, res) => {
  const {
    foto
  } = req.files;
  const {
    name
  } = foto;
  const {
    nombre,
    email,
    password,
  } = req.body
  try {
    await registrarUsuario(nombre, email, password, name);
    res.status(201);
    res.render('inicio');
  } catch (e) {
    res.status(500).json({
      error: `Algo salió mal... ${e}`,
      code: 500
    });
  };
  foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
    if (err) return res.status(500).json({
      error: `Algo salió mal...${err}`,
      code: 500
    });
    res.status(201);
  });
});

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
////////////////////////////////////////////////////

// getDate();
// muestra_usuarios();
// muestra_inventario();


//////////////////////////////////////////////////////////////////BUSCA PRODUCTO//////////////////////////////////////////////////////////////////
app.post("/", async (req, res) => {
  console.log(req.body);
  // const productoBuscado = req.body;
  // console.log(productoBuscado);run  
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
  
  // res.render("productoEncontradoPublico", {
  //   codigo: productoBuscado.id_codigo,
  //   marca: productoBuscado.id_marca,
  //   nombre: productoBuscado.nombrep,
  //   precio: productoBuscado.precio,
  //   sexo: productoBuscado.sexo,
  // });

  /////////////////////////////////////////////////////lo de abajo es del hito 2//////////////////////////////

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
});

///////////////////////////////////////////////////////TRAE FORMULARIO INICIO DE SESION REDIRECCIONA A PERFIL////////////////////////////////

app.get("/inicio", (req, res) => {
  console.log(req.body);
  res.render("inicioSesion");
});

//////////////////////////////////////////////////////TRAE PERFIL////////////////////////////////////////////////////////////////////

const usuarios = require("./usuarios.json");

app.get("/perfil", (req, res) => {
  const usuario = usuarios.usuarios.find(
    (u) => u.Email === "carlos.garcia@example.com"
  );

  if (!usuario) {
    res.redirect("/login");
    return;
  }

  res.render("perfil", {
    nombre: usuario.nombre,
    email: usuario.Email,
    contraseña: usuario.contraseña,
    telefono: usuario.telefono,
    direccion: usuario.direccion,
    comuna: usuario.Comuna.trim(),
  });
});

//////////////////////////////////////////////////////////////////////BORRAR USUARIO///////////////////////////////////////////////////////////////////

app.use((req, res, next) => {
  if (req.headers['x-http-method-override']) {
    req.method = req.headers['x-http-method-override'];
  }
  next();
});

// Ruta para manejar solicitudes DELETE
app.delete("/eliminar/:RUT", (req, res) => {
  const RUT = req.params.RUT;
  if (!RUT || typeof RUT !== 'string') {
    return res.status(400).json({
      message: 'RUT inválido'
    });
  }

  let usuarios = JSON.parse(fs.readFileSync('usuarios.json'));

  const index = usuarios.usuarios.findIndex((u) => u.RUT === RUT);

  if (index < 0) {
    return res.status(404).json({
      message: 'Usuario no encontrado'
    });
  }

  usuarios.usuarios.splice(index, 1);

  fs.writeFileSync('usuarios.json', JSON.stringify(usuarios), 'utf-8');

  // Agrega el siguiente código para mostrar una alerta al usuario
  const mensaje = 'Usuario eliminado con éxito';
  res.send(`
     <script>
       alert('${mensaje}');
       window.location.href = '/'; // redirige al usuario a la página principal
     </script>
   `);
});


//borrar producto

app.delete("/productos/:codigo_p", (req, res) => {
  const codigo_p = req.params.codigo_p;

  const productoEliminado = productos.find(
    (p) => p.codigo_p === parseInt(codigo_p)
  );

  if (productoEliminado) {
    productos = productos.filter((p) => p.codigo_p !== parseInt(codigo_p));
    return res.status(200).json({
      message: "Producto eliminado con éxito",
    });
  }

  return res.status(404).json({
    message: "Producto no encontrado",
  });
});


///////////////////////////////////////////////////////LOGIN////////////////////////////////////////////////////////////////////////////////////////



app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const usuario = usuarios.usuarios.find((u) => u.Email === email);

  if (!usuario) {
    res.render("login", {
      mensaje: "Usuario no encontrado",
    });
    return;
  }

  if (usuario.contraseña !== password) {
    res.render("login", {
      mensaje: "Contraseña incorrecta",
    });
    return;
  }

  res.redirect("/perfil");
});

//////////////////////////////////////////////////////CODIGO COMENTADO/////////////////////////////////////////////////

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