const supertest = require('supertest');
const app = require('./index.js');

describe("GET", () => {
    //Ruta get '/' con la vista del index
    it("prueba get para obtener vista del index", async () => {
        const response = await supertest(app).get("/").send();
        const status = response.statusCode;
        expect(status).toBe(200);
    });
    it("prueba get para consultar vista que no existe", async () => {
        const response = await supertest(app).get("/index").send();
        const status = response.statusCode;
        expect(status).toBe(404);
    });

    //Ruta get '/registro' con la data de las comunas
    it("prueba get para obtener vista del registro", async () => {
        const response = await supertest(app).get("/registro").send();
        const status = response.statusCode;
        expect(status).toBe(200);
    });
    it("prueba get para consultar vista registro que no existe", async () => {
        const response = await supertest(app).get("/registro-usuarios").send();
        const status = response.statusCode;
        expect(status).toBe(404);
    });

    //Ruta get '/inicioSesion' con la vista del Log in
    it("prueba get para obtener vista del log in", async () => {
        const response = await supertest(app).get("/inicio").send();
        const status = response.statusCode;
        expect(status).toBe(200);
    });
    it("prueba get para consultar vista que no existe", async () => {
        const response = await supertest(app).get("/inicioSesion-usuario").send();
        const status = response.statusCode;
        expect(status).toBe(404);
    });

    //Ruta get '/inventario' con la vista del inventario
    it("prueba get para obtener vista del inventario de productos", async () => {
        const response = await supertest(app).get("/inventario").send();
        const status = response.statusCode;
        expect(status).toBe(200);
    });
    it("prueba get para consultar vista que no existe", async () => {
        const response = await supertest(app).get("/inventario-productos").send();
        const status = response.statusCode;
        expect(status).toBe(404);
    });
});


describe("POST", () => {

    //Ruta post '/' buscar producto
    it("prueba post para buscar productos", async () => {
        const response = await supertest(app).post("/").send();
        const status = response.statusCode;
        expect(status).toBe(200);
    });

    //Ruta post '/registro' con el post del nuevo usuario
    it("prueba post para registrar a un nuevo usuario", async () => {
        const response = await supertest(app).post("/registro").send(usuario);
        const status = response.statusCode;
        expect(status).toBe(201);
    });

    //Ruta post '/inicioSesion' con la data de log in del usuario
    it("prueba post para enviar la información del usuario para el login", async () => {
        const response = await supertest(app).post("/inicioSesion").send(usuario);
        const status = response.statusCode;
        expect(status).toBe(200);
    });

    //Ruta post '/tuInventario' con la data del producto registrado
    it("prueba post para enviar registrar un nuevo producto en la base de datos de usuario", async () => {
        const response = await supertest(app).post("/tuInventario").send(producto);
        const status = response.statusCode;
        expect(status).toBe(201);
    });
});