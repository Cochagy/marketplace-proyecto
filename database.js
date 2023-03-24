const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,

});

//registra usuario


////abajo la mia
const nuevo_usuario = async ( sector, nombree, email, rut, id_rol, password, is_active, telefono, foto_usuario) => {    
    const consulta = {
        text: 'INSERT INTO usuarios ( sector, nombre, email, rut, id_rol, password, is_active, telefono, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        values: [ sector, nombree, email, rut, id_rol, password, is_active, telefono, foto_usuario]
    }
    const resultado = await pool.query(consulta);   
    const usuario = resultado.rows[0];
    return usuario;
}

//busca al usuario con email y password para iniciar sesion
async function trae_usuario(email, password) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
        values: [email, password]
    };
    const result = await pool.query(consulta);
    // console.log(consulta);
    // console.log(result);
    return result.rows[0];
};

//actualiza usuario (busca por email en base de datos)
async function actualizar_usuario(sector, nombre, rut, foto, email) {
    const consulta = {
        text: 'UPDATE usuarios SET sector = $1, nombre = $2, rut = $3, foto = $4 WHERE email = $5 RETURNING *',        
        values: [sector, nombre, rut, foto, email]
    }
    const resultado = await pool.query(consulta);   
    const usuario = resultado.rows[0];
    // console.log(usuario);
    return usuario;        
};

//trae datos de usuario (busca por email)
async function usuario_email(email) {
    const consulta = {
        text: 'SELECT * FROM usuario WHERE mail = $1',
        values: [email]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}

//MODIFICA Y ELIMINA INVENTARIO Y USUARIO

//trae id de inventario para ser eliminado
async function trae_id_inventario(usuario_email) {
    const consulta = {
        text: 'SELECT * FROM inventario WHERE usuario_email = $1',
        values: [usuario_email]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}

//

//elimina inventario asociado a usuario
async function eliminar_inventario_y_usuario(usuario_email) {
    const consulta = {
        text: 'DELETE FROM inventario WHERE usuario_email = $1 RETURNING *',
        values: [usuario_email]
    }
    const resultado = await pool.query(consulta);   
    const mascota = resultado.rows[0];
    return mascota;
    
}

//elimina usuario
async function eliminar_usuario(email) {
    const consulta = {
        text: 'DELETE FROM usuarios WHERE email = $1 RETURNING *',
        values: [email]
    }
    const resultado = await pool.query(consulta);   
    const usuario = resultado.rows[0];
    return usuario;
    
}


//DESDE AQUI LAS CONSULTAS PARA VER DATOS DE BASE DE DATOS (SOLAMENTE PARA PRUEBAS)/////////////////
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

module.exports = { 
    // registrarUsuario,
    nuevo_usuario,
    getDate, 
    muestra_usuarios, 
    muestra_inventario, 
    encuentra_producto, 
    trae_usuario,
    actualizar_usuario,
    usuario_email,
    trae_id_inventario,
    eliminar_inventario_y_usuario,
    eliminar_usuario

};

////////////////////////////////////////////////////PAPELERA DE RECICLAJE/////////////////////////

//codigo de pedro para registro usuario

// const registrarUsuario = async (nombre, email, password, foto) => {
//     const result = {
//         text: 'INSERT INTO usuarios (nombre, email, pasword, foto) VALUES ($1, $2, $3, $4) RETURNING*;',
//         values: [nombre, email, password, foto] 
//     };
//     const res = await pool.query(result);
//     return res.rows[0];
// };

///////////////////////////////////////////////

//codigo de marcela para borrar usuario e inventario

//elimina usuario e inventario y derivados 
// async function eliminar_inventario_y_usuario(id_inventario) {
//     const consulta = {
//         text: 'DELETE FROM inventario WHERE inventario_id = $1 RETURNING *',
//         values: [id_inventario]
//     }
//     const resultado = await pool.query(consulta);   
//     const inventario = resultado.rows[0];
//     return ;
    
// }