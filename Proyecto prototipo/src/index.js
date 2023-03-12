const express = require('express');
const exhbs = require("express-handlebars");

const app = express();


//handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', exhbs.engine());





app.get("/", (req, res) => {
    res.render("main")
});

app.get("/contact", (req, res) => {
    res.render("contact", { layout: 'sesion'})
});


app.get('/inventario', (req, res) => {
    res.render('inventario', { layout: 'sesion'});
});

app.get("/pedido", (req, res) => {
    res.render("pedido", { layout: 'sesion'})
});

app.get("/perfil", (req, res) => {
    res.render("perfil", { layout: 'sesion'})
});

app.get("/registrop", (req, res) => {
    res.render("registrop", { layout: 'sesion'})
});




















app.listen(3500, () => {
    console.log('Server is running on port 3500');
});