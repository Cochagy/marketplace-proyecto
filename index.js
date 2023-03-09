require('dotenv').config();
const express = require('express');

const app = express();

//puerto
const puerto = process.env.PORT || 4000;
app.listen(puerto, console.log('Servidor en puerto: ', puerto));

///////////////////////////////////////////////

app.get('/', async (req, res) => {
    res.send('Luz, cámara, acción!!!');
});