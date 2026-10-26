const request = require('supertest');
const { crearAppDePrueba } = require('./helpers/crearAppDePrueba');

describe('API de reseñas y reputación', () => {
  let app;

  const datosEvento = (cambios = {}) => ({
    nombre: 'Evento reseñable',
    descripcion: 'Descripción del evento',
    fecha: '2098-06-20T21:00:00.000Z',
    ubicacion: 'Auditorio',
    organizadorId: 1,
    categoriaId: 1,
    tiposEntrada: [{ nombre: 'General', precio: 1000, cupo: 20 }],
    ...cambios,
  });

  async function crearEvento(cambios = {}) {
    return request(app).post('/eventos').send(datosEvento(cambios));
  }

  async function crearCompra({ compradorId = 2, eventoId = 1, tipoEntradaId = 1 } = {}) {
    return request(app).post('/compras').send({
      compradorId,
      eventoId,
      tipoEntradaId,
      cantidad: 1,
    });
  }

  async function utilizarCompra(id) {
    await request(app).patch(`/compras/${id}/confirmar`);
    return request(app).patch(`/compras/${id}/utilizar`);
  }

  beforeEach(() => {
    ({ app } = crearAppDePrueba());
  });

  it('crea una reseña para una compra utilizada', async () => {
    await crearEvento();
    await crearCompra();
    await utilizarCompra(1);

    const response = await request(app).post('/compras/1/resenia').send({
      compradorId: 2,
      puntaje: 5,
      comentario: 'Excelente organización',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 1,
      compraId: 1,
      eventoId: 1,
      compradorId: 2,
      puntaje: 5,
      comentario: 'Excelente organización',
    });
  });

  it('rechaza reseñar una compra que no fue utilizada', async () => {
    await crearEvento();
    await crearCompra();

    const response = await request(app).post('/compras/1/resenia').send({
      compradorId: 2,
      puntaje: 4,
      comentario: 'Todavía no corresponde',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('compra utilizada');
  });

  it('rechaza una segunda reseña para la misma compra', async () => {
    await crearEvento();
    await crearCompra();
    await utilizarCompra(1);
    const resenia = { compradorId: 2, puntaje: 5, comentario: 'Muy bueno' };
    await request(app).post('/compras/1/resenia').send(resenia);

    const response = await request(app).post('/compras/1/resenia').send(resenia);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('ya tiene una reseña');
  });

  test.each([0, 6, 2.5, '5'])('rechaza el puntaje inválido %p', async (puntaje) => {
    await crearEvento();
    await crearCompra();
    await utilizarCompra(1);

    const response = await request(app).post('/compras/1/resenia').send({
      compradorId: 2,
      puntaje,
      comentario: 'Comentario válido',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('puntaje');
  });

  it('impide que otro usuario reseñe la compra', async () => {
    await crearEvento();
    await crearCompra();
    await utilizarCompra(1);

    const response = await request(app).post('/compras/1/resenia').send({
      compradorId: 3,
      puntaje: 5,
      comentario: 'No soy el comprador',
    });

    expect(response.status).toBe(403);
  });

  it('lista reseñas por evento y calcula la reputación del organizador', async () => {
    await crearEvento();
    await crearCompra();
    await crearCompra({ compradorId: 3 });
    await utilizarCompra(1);
    await utilizarCompra(2);
    await request(app).post('/compras/1/resenia').send({
      compradorId: 2, puntaje: 5, comentario: 'Excelente',
    });
    await request(app).post('/compras/2/resenia').send({
      compradorId: 3, puntaje: 3, comentario: 'Correcto',
    });

    const evento = await request(app).get('/eventos/1/resenias');
    const organizador = await request(app).get('/organizadores/1/resenias');

    expect(evento.status).toBe(200);
    expect(evento.body).toHaveLength(2);
    expect(organizador.body.reputacion).toBe(4);
    expect(organizador.body.resenias).toHaveLength(2);
  });

  it('incluye reseñas de eventos anteriores del organizador en el detalle', async () => {
    await crearEvento({ nombre: 'Evento anterior', fecha: '2097-06-20T21:00:00.000Z' });
    await crearEvento({ nombre: 'Evento actual', fecha: '2099-06-20T21:00:00.000Z' });
    await crearCompra();
    await utilizarCompra(1);
    await request(app).post('/compras/1/resenia').send({
      compradorId: 2, puntaje: 5, comentario: 'Gran evento anterior',
    });

    const response = await request(app).get('/eventos/2');

    expect(response.status).toBe(200);
    expect(response.body.reseniasAnterioresOrganizador).toHaveLength(1);
    expect(response.body.reseniasAnterioresOrganizador[0].comentario)
      .toBe('Gran evento anterior');
    expect(response.body.puntajeOrganizador).toBe(5);
  });

  test.each([
    ['puntaje_desc', ['Puntaje alto', 'Puntaje bajo', 'Sin reseñas']],
    ['puntaje_asc', ['Puntaje bajo', 'Puntaje alto', 'Sin reseñas']],
  ])('ordena por %s y ubica organizadores sin reseñas al final', async (orden, esperado) => {
    await crearEvento({ nombre: 'Puntaje alto', organizadorId: 1 });
    await crearEvento({ nombre: 'Puntaje bajo', organizadorId: 2 });
    await crearEvento({ nombre: 'Sin reseñas', organizadorId: 3 });
    await crearCompra({ compradorId: 2, eventoId: 1, tipoEntradaId: 1 });
    await crearCompra({ compradorId: 1, eventoId: 2, tipoEntradaId: 2 });
    await utilizarCompra(1);
    await utilizarCompra(2);
    await request(app).post('/compras/1/resenia').send({
      compradorId: 2, puntaje: 5, comentario: 'Excelente',
    });
    await request(app).post('/compras/2/resenia').send({
      compradorId: 1, puntaje: 2, comentario: 'Regular',
    });

    const response = await request(app).get(`/eventos?orden=${orden}`);

    expect(response.status).toBe(200);
    expect(response.body.map(({ nombre }) => nombre)).toEqual(esperado);
  });

  it('devuelve reputación null para un organizador sin reseñas', async () => {
    const response = await request(app).get('/organizadores/1/resenias');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ organizadorId: 1, reputacion: null, resenias: [] });
  });
});
