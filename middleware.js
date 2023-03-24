const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const puerto = require('./routers');

const app = express();

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


// Middlewares

///ESTOS SON MIDDLEWARES DE PRUEBA//////

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Permite compartir recursos
app.use(cors());

//Recibe carga de imagenes
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    limits: {
      fileSize: 100000000
    },
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el limite permitido",
  })
);

app.listen(puerto, console.log("Servidor en puerto: ", puerto));


module.exports = app;