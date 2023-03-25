const {
    Pool
} = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,

});

const registrarUsuario = async (nombre, email, password, foto) => {
    const result = {
        text: 'INSERT INTO usuarios (nombre, email, pasword, foto) VALUES ($1, $2, $3, $4) RETURNING*;',
        values: [nombre, email, password, foto]
    };
    const res = await pool.query(result);
    return res.rows[0];
};

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

async function encuentra_producto(busquedaInput) {
    const consulta = {
        text: 'SELECT * FROM productos WHERE nombrep = $1',
        values: [busquedaInput]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}



async function trae_usuario(email, password) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
        values: [email, password]
    };
    const result = await pool.query(consulta);
    // console.log(consulta);
    // console.log(result);
    return result.rows[0];
}
//AUN NO SE PUEDE ACTIVAR////////
// async function trae_contrasena_encriptada(email) {
//     const consulta = {
//         text: 'SELECT * FROM usuario WHERE email = $1',
//         values: [email]
//     };
//     const result = await pool.query(consulta);
//     return result.rows[0];
// }

////////////////////LISTA DE PRODUCTOS////////////////////////////////////////////////////////////////
async function obtenerProductosPorUsuario(idUsuario) {
    const consulta = {
        text: `SELECT pr.nombrep, pr.precio, inv.cantidad AS stock, tc.cliente, m.nombre_marca
        FROM usuarios usu
        JOIN inventario inv ON usu.id = inv.usuario
        JOIN productos pr ON inv.codigo = pr.id_codigo
        JOIN tipo_cliente tc ON pr.tipo_cliente = tc.id
        JOIN marca m ON pr.id_marca = m.id
        WHERE usu.id = $1;`,
        values: [idUsuario]
    };
    const resultado = await pool.query(consulta);
    return resultado.rows;
}











module.exports = {
    registrarUsuario,
    getDate,
    muestra_usuarios,
    muestra_inventario,
    encuentra_producto,
    obtenerProductosPorUsuario,
    trae_usuario

};