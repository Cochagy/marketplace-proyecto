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

//trae listado de comunas
const obtenerCamposSector = async () => {
    const consulta = {
        text: 'SELECT id, nombre_sector FROM sector',
    };
    const resultado = await pool.query(consulta);
    return resultado.rows;
};

//registra usuario
const nuevo_usuario = async ( sectorId, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario) => {    
    const consulta = {
        text: 'INSERT INTO usuarios ( sector, nombre, email, rut, id_rol, password, is_active, telefono, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        values: [ sectorId, nombree, email, rut, id_rol, password_encriptada, is_active, telefono, foto_usuario]
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

//trae al usuario desde la base de datos por id
async function trae_usuario_id(id) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE id = $1',
        values: [id]
    };
    const usuario = await pool.query(consulta);
    // console.log(consulta);
//  console.log(usuario);
    return usuario.rows[0];
}

//actualiza usuario (busca por email en base de datos TIRA UNDEFINE)
async function actualizar_usuario(datos) {
    const { email, telefono } = datos;
  
    // Aquí va tu código para conectar a la base de datos y actualizar el usuario
    // Ejemplo:
    const query = "UPDATE usuarios SET telefono = $1 WHERE email = $2";
    const values = [telefono, email];
  
    try {
      const result = await pool.query(query, values);
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }
//desactiva usuario (busca por id en base de datos)
async function desactivar(desactivado, id) {
    const consulta = {
        text: 'UPDATE usuarios SET is_active = $1 WHERE id = $2 RETURNING *',        
        values: [desactivado, id]
    }
    const resultado = await pool.query(consulta);   
    // const desactivar = resultado.rows[0];
    // console.log(desactivar);
    return resultado;        
};

///////////////////////PRODUCTOS MARCE///////////////////////////////

//agrega nuevo producto a la base de datos
const nuevo_producto = async (usuario, codigo, cantidad,id_estado, marca, nombrep, precio, tipo_cliente, foto_producto) => {    
    const consulta = {
        text: 'INSERT INTO inventario (usuario, codigo, cantidad, id_estado, marca, nombrep, precio, tipo_cliente, foto ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        values: [ usuario, codigo, cantidad, id_estado, marca, nombrep, precio, tipo_cliente, foto_producto]
    }
    const resultado = await pool.query(consulta);   
    const producto = resultado.rows[0];
    return producto;
}

//elimina el usuario solo para el front (realmente lo desactiva)
async function elimina_producto(id) {
    const consulta = {
        text: 'DELETE FROM inventario WHERE id = $1 RETURNING *',
        values: [id]
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
    const usuarios = await pool.query(`SELECT * FROM usuarios`);
    // console.log(usuarios);
    return usuarios.rows;
}

async function muestra_inventario() {
    const resultado = await pool.query(`SELECT * FROM inventario`);
    // console.log(resultado);
    return resultado.rows;
}

//busca productos en la base de datos (buscador)
async function encuentra_producto(busquedaInput) {
    const consulta = {
        text: 'SELECT * FROM inventario WHERE nombrep = $1',
        values: [busquedaInput]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
}

/////////////////////////////////////////////AUTORIZAR USUARIOS MARCE//////////////////////////
//trae usuarios por id producto
async function trae_usuario_idproducto(idproducto) {
    const consulta = {
        text: 'SELECT * FROM usuarios WHERE id = $1',
        values: [idproducto]
    };
    const usuario = await pool.query(consulta);
    // console.log(consulta);
//  console.log(usuario);
    return usuario.rows[0];
}

async function cambiar_estado(is_active, email) {
    const consulta = {
        text: 'UPDATE usuarios SET is_active = $1 WHERE email = $2 RETURNING *',
        values: [is_active, email]
    };
    const resultado = await pool.query(consulta);
    const usuario = resultado.rows[0];
    return usuario;
}


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
    // console.log(resultado);
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
    // console.log(resultado);
    return resultado.rows;
}

////////////////////////////////////////TRANSACCIONES/////////////////////////////////////////////////////////////////////


async function obtenerTransacciones(usuario) {
    const consulta = {
      text: `SELECT orden_compra.id,
      orden_compra.u_solicitante,
      usuarios_solicitante.nombre AS n_solicitante,
      orden_compra.u_solicitado,
      CASE
          WHEN orden_compra.u_solicitado IS NULL THEN 'pendiente'
          ELSE usuarios_solicitado.nombre
      END AS n_solicitado,
      orden_compra.cod_producto,
      inventario.nombrep,
      inventario.precio,
      inventario.cantidad,
      orden_compra.fecha_solicitud,
      orden_compra.duracion,
      orden_compra.estado_compra,
      CASE
          WHEN orden_compra.u_solicitado = 1 THEN usuarios_solicitado.nombre
          ELSE
              CASE
                  WHEN orden_compra.u_solicitado IS NULL THEN 'pendiente'
                  ELSE usuarios_solicitado.nombre
              END
      END AS usuario,
      CASE
          WHEN orden_compra.u_solicitado IS NULL THEN 'venta'
          ELSE 'realizada'
      END AS tipo_de_compra
FROM orden_compra
LEFT JOIN usuarios AS usuarios_solicitante ON orden_compra.u_solicitante = usuarios_solicitante.id
LEFT JOIN usuarios AS usuarios_solicitado ON orden_compra.u_solicitado = usuarios_solicitado.id
JOIN inventario ON orden_compra.cod_producto = inventario.codigo
WHERE orden_compra.u_solicitante = $1 OR orden_compra.u_solicitado = $1`,
      values: [usuario]
    };
  
    const resultado = await pool.query(consulta);
  
    return resultado.rows;
  };
// crea consulta sql para eliminar campo u_solicitado de la tabla orden_compra?

/////////////////////////////////NOTIFICACIONES////////////////////////////////////////////////////////////

async function obtenerNotificaciones(usuario) {
    const consulta = {
        text: `SELECT orden_compra.id,
        orden_compra.u_solicitante,
        usuarios_solicitante.nombre AS n_solicitante,
        orden_compra.u_solicitado,
        CASE
            WHEN orden_compra.u_solicitado IS NULL THEN 'pendiente'
            ELSE usuarios_solicitado.nombre
        END AS n_solicitado,
        orden_compra.cod_producto,
        inventario.nombrep,
        inventario.precio,
        inventario.cantidad,
        orden_compra.fecha_solicitud,
        orden_compra.duracion,
        orden_compra.estado_compra,
        estado_compra.e_compra,
        CASE
            WHEN orden_compra.u_solicitado = 1 THEN usuarios_solicitado.nombre
            ELSE
                CASE
                    WHEN orden_compra.u_solicitado IS NULL THEN 'pendiente'
                    ELSE usuarios_solicitado.nombre
                END
        END AS usuario,
        CASE
            WHEN orden_compra.u_solicitado IS NULL THEN 'venta'
            ELSE 'realizada'
        END AS tipo_de_compra
FROM orden_compra
LEFT JOIN usuarios AS usuarios_solicitante ON orden_compra.u_solicitante = usuarios_solicitante.id
LEFT JOIN usuarios AS usuarios_solicitado ON orden_compra.u_solicitado = usuarios_solicitado.id
JOIN inventario ON orden_compra.cod_producto = inventario.codigo
JOIN estado_compra ON orden_compra.estado_compra = estado_compra.id
WHERE (orden_compra.u_solicitante = $1 OR orden_compra.u_solicitado = $1)
  AND orden_compra.estado_compra != 3
  AND (
    orden_compra.u_solicitado IS NOT NULL
    OR (
      orden_compra.u_solicitado IS NULL
      AND NOT (
          CASE
            WHEN orden_compra.u_solicitado IS NULL THEN 'pendiente'
            ELSE usuarios_solicitado.nombre
          END = 'pendiente'
        )
    )
  );

`,
      
      values: [usuario]
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
    trae_usuario_id,
    actualizar_usuario,
    elimina_producto,
    desactivar,
    nuevo_producto, 
    getDate,
    muestra_usuarios,
    muestra_inventario,
    encuentra_producto,    
    obtenerProductosPorUsuario,    
    obtenerVendedores,
    obtenerCamposSector,
    trae_usuario_idproducto,
    obtenerTransacciones,
    obtenerNotificaciones

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