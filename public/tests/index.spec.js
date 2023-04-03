const supertest = require('supertest');
const app = require('../../index.js');

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


