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

//registra usuario
const nuevo_usuario = async ( sector, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario) => {    
    const consulta = {
        text: 'INSERT INTO usuarios ( sector, nombre, email, rut, id_rol, password, is_active, telefono, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        values: [ sector, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario]
    }
    const resultado = await pool.query(consulta);   
    const usuario = resultado.rows[0];
    return usuario;
}



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
        text: `SELECT i.id, i.usuario, i.codigo, i.cantidad, i.id_estado, i.marca, i.nombrep, i.precio, t.cliente, i.foto
        FROM inventario i
        JOIN tipo_cliente t ON i.tipo_cliente = t.id
        WHERE i.usuario = $1;`,
        values: [idUsuario]
    };
    const resultado = await pool.query(consulta);
    return resultado.rows;
}

////////////////////LISTA DE VENDEDORES////////////////////////////////////////////////////////////////
async function obtenerVendedores(idproducto) {
    const consulta = {
        text: `SELECT usr.nombre, inv.nombrep, inv.cantidad, inv.precio, sec.nombre_sector
        FROM inventario inv
        JOIN usuarios usr ON inv.usuario = usr.id
        JOIN sector sec ON usr.sector = sec.id
        WHERE inv.codigo = $1;`,
        values: [idproducto]
    };
    const resultado = await pool.query(consulta);
    return resultado.rows;
}









module.exports = {
    // registrarUsuario,
    nuevo_usuario,
    getDate,
    muestra_usuarios,
    muestra_inventario,
    encuentra_producto,
    obtenerProductosPorUsuario,
    trae_usuario,
    obtenerVendedores

};


/////////////////////////////////////////////PAPELERA DE RECICLAJE/////////////////////////////////
//REGISTRO DE USUARIOS PEDRO ////////////
// const registrarUsuario = async (nombre, email, password, foto) => {
//     const result = {
//         text: 'INSERT INTO usuarios (nombre, email, pasword, foto) VALUES ($1, $2, $3, $4) RETURNING*;',
//         values: [nombre, email, password, foto]
//     };
//     const res = await pool.query(result);
//     return res.rows[0];
// };