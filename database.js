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

//busca al usuario por email para iniciar sesion
async function trae_usuario_email(email) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE email = $1',
        values: [email]
    };
    const result = await pool.query(consulta);
    // console.log(consulta);
    // console.log(result);
    return result.rows[0];
};

//trae password encriptada
async function trae_password_encriptada(email) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE email = $1',
        values: [email]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}

//trae al usuario desde la base de datos
async function trae_usuario(email, password_encriptada) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
        values: [email, password_encriptada]
    };
    const result = await pool.query(consulta);
    // console.log(consulta);
    // console.log(result);
    return result.rows[0];
}

///////////////////////PRODUCTOS///////////////////////////////

const nuevo_producto = async (id_codigo, id_marca, nombrep, precio, tipo_cliente, foto_producto) => {    
    const consulta = {
        text: 'INSERT INTO inventario (id_codigo, id_marca, nombrep, precio, tipo_cliente, foto_producto ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        values: [ id_codigo, id_marca, nombrep, precio, tipo_cliente, foto_producto]
    }
    const resultado = await pool.query(consulta);   
    const producto = resultado.rows[0];
    return producto;
}
//DESDE AQUI LAS CONSULTAS PARA VER DATOS DE BASE DE DATOS (SOLAMENTE PARA PRUEBAS)/////////////////
const getDate = async () => {
    const result = await pool.query("SELECT NOW()");
    // console.log(result);

}

async function muestra_usuarios() {
    const resultado = await pool.query(`SELECT * FROM usuarios`);
    // console.log(resultado);
    return resultado.rows;
}

async function muestra_inventario() {
    const resultado = await pool.query(`SELECT * FROM inventario`);
    // console.log(resultado);
    return resultado.rows;
}

async function encuentra_producto(busquedaInput) {
    const consulta = {
        text: 'SELECT * FROM inventario WHERE nombrep = $1',
        values: [busquedaInput]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}
/////////////////////////////////////////////HASTA ACA CONSULTAS DE PRUEBA//////////////////////////



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
    trae_usuario_email,
    trae_password_encriptada,
    trae_usuario,
    nuevo_producto,   
    getDate,
    muestra_usuarios,
    muestra_inventario,
    encuentra_producto,    
    obtenerProductosPorUsuario,    
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