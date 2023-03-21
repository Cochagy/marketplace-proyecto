const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,

});

const getDate = async () => {
    const result = await pool.query("SELECT NOW()");
    console.log(result);
  
}

async function muestra_usuarios() {
    const resultado = await pool.query(`SELECT * FROM usuarios`);
    console.log(resultado);
    return resultado.rows;
}

async function muestra_inventario() {
    const resultado = await pool.query(`SELECT * FROM inventario`);
    console.log(resultado);
    return resultado.rows;
}

module.exports = { getDate, muestra_usuarios, muestra_inventario };