require('dotenv').config();
const express = require('express');
const cors = require('cors');
const exphbs = require('express-handlebars');

const app = express();

// Middlewares

//Permite compartir recursos
app.use(cors());

//Contenido de carpeta public declarado como estatico
app.use(express.static(__dirname + '/public'));

//Configuracion de css, que accedera directamente a carpeta de bootstrap descargado en node_modules
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

//configuracion handlebars
app.set('view engine', 'handlebars');
app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/layouts`,
        partialsDir: `${__dirname}/views/partials`,
        extname: ".handlebars"
    })
);

//puerto
const puerto = process.env.PORT || 4000;
app.listen(puerto, console.log('Servidor en puerto: ', puerto));

///////////////////////////////////////////////

app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/registro', async (req, res) => {
    res.render('registro');
});

app.get('/contacto', async (req, res) => {
    res.render('contacto');
});

app.get('/inicio', async (req, res) => {
    res.render('inicioSesion');
});

app.get('/perfil', async (req, res) => {
    res.render('perfil');
});

app.get('/registroProductos', async (req, res) => {
    res.render('registroProductos');
});

app.get('/inventario', async (req, res) => {
    res.render('tuInventario');
});

app.get('/productosDisponibles', async (req, res) => {
    res.render('productosDisponibles');
});

app.get('/listaVendedores', async (req, res) => {
    res.render('listaVendedores');
});

