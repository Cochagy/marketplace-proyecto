require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require('axios');

//Llamar al archivo productos.json
const productosJSON = require('./productos.json');

//Lamar al archivo inventario.json
const inventarioJSON = require('./inventario.json');

const app = express();

// Middlewares

//Permite compartir recursos
app.use(cors());

//Recibe carga de imagenes
app.use(bodyParser.urlencoded({ extended: true }));

//Permite usar PUT o DELETE en lugares donde el cliente no lo admite
app.use(methodOverride("_method"));

//Parsea cookies
app.use(cookieParser());

//RecibE payload de consultas put y post
app.use(bodyParser.json());

//Contenido de carpeta public declarado como estatico
app.use(express.static(__dirname + "/public"));

//Configuracion de css, que accedera directamente a carpeta de bootstrap descargado en node_modules
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

//configuracion de FileUpload
app.use(
  expressFileUpload({
    limits: { fileSize: 100000000 },
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el limite permitido",
  })
);
//configuracion handlebars
app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
    extname: ".handlebars",
  })
);

//puerto
const puerto = process.env.PORT || 4000;
app.listen(puerto, console.log("Servidor en puerto: ", puerto));

///////////////////////////////////////////////

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/registro", async (req, res) => {
  res.render("registro");
});

app.get("/contacto", async (req, res) => {
  res.render("contacto");
});

app.get("/inicio", async (req, res) => {
  res.render("inicioSesion");
});

//app.get("/perfil", async (req, res) => {
  //res.render("perfil");
//});

app.get("/registroProductos", async (req, res) => {
  res.render("registroProductos");
});

app.get("/inventario", async (req, res) => {
  res.render("tuInventario");
});

app.get("/productosDisponibles", async (req, res) => {
    try {
        const productos = await productosJSON;
        res.render("productosDisponibles", { productos });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        });
    };
});

app.get("/listaVendedores", async (req, res) => {
  res.render("listaVendedores");
});

app.get("/notificacion", async (req, res) => {
  res.render("notificacion");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Rutas Jorge

//borrar usuario

app.delete("/usuarios/:RUT", (req, res) => {
  const RUT = req.params.RUT;
  if (!RUT || typeof RUT !== "string") {
    return res.status(400).json({ message: "RUT inválido" });
  }

  const index = usuarios.findIndex((u) => u.RUT === RUT);

  if (index < 0) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  usuarios.splice(index, 1);

  return res.status(200).json({ message: "Usuario eliminado con éxito" });
});

//borrar producto

app.delete('/productos/:codigo_p', (req, res) => {
    const codigo_p = req.params.codigo_p;

    const productoEliminado = productos.find(p => p.codigo_p === parseInt(codigo_p));

    if (productoEliminado) {
      productos = productos.filter(p => p.codigo_p !== parseInt(codigo_p));
      return res.status(200).json({message: 'Producto eliminado con éxito'});
    }

    return res.status(404).json({message: 'Producto no encontrado'});
  });
  

  // llamar datos perfil
  const usuarios = require('./usuarios.json');

  app.get('/perfil', (req, res) => {
    // Aquí obtenemos los datos del usuario logeado
    const usuario = usuarios.usuarios.find(u => u.Email === 'carlos.garcia@example.com');
    // Si no se encuentra el usuario, redirigimos a la página de inicio de sesión
    
    if (!usuario) {
      res.redirect('/login');
      return;
    }
  
    // Renderizamos el HTML con los datos del usuario
    res.render('perfil', {
      nombre: usuario.nombre,
      email: usuario.Email,
      contraseña: usuario.contraseña,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      comuna: usuario.Comuna.trim(),
      
    });

  });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Ruta login

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  

    const usuario = usuarios.usuarios.find(u => u.Email === email);
  
    if (!usuario) {

      res.render('login', { mensaje: 'Usuario no encontrado' });
      return;
    }
  
    if (usuario.contraseña !== password) {

      res.render('login', { mensaje: 'Contraseña incorrecta' });
      return;
    }
  

    res.redirect('/perfil');
  });
  
















////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////