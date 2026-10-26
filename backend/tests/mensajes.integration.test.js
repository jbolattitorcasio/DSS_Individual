const request = require('supertest');
const { crearAppDePrueba } = require('./helpers/crearAppDePrueba');

describe('API de mensajes', () => {
  let app;

  beforeEach(async () => {
    ({ app } = crearAppDePrueba());
    await request(app).post('/eventos').send({
      nombre: 'Festival',
      descripcion: 'Festival para mensajería',
      fecha: '2099-11-20T21:00:00.000Z',
      ubicacion: 'Estadio',
      organizadorId: 1,
      categoriaId: 1,
      tiposEntrada: [{ nombre: 'General', precio: 1000, cupo: 20 }],
    });
    await request(app).post('/compras').send({
      compradorId: 2,
      eventoId: 1,
      tipoEntradaId: 1,
      cantidad: 1,
    });
  });

  it('permite conversar al comprador y al organizador y lista cronológicamente', async () => {
    const primero = await request(app).post('/compras/1/mensajes').send({
      autorId: 2,
      contenido: '¿A qué hora abren?',
    });
    const segundo = await request(app).post('/compras/1/mensajes').send({
      autorId: 1,
      contenido: 'A las 19 horas.',
    });
    const listado = await request(app).get('/compras/1/mensajes?usuarioId=2');

    expect(primero.status).toBe(201);
    expect(segundo.status).toBe(201);
    expect(listado.status).toBe(200);
    expect(listado.body.map(({ contenido }) => contenido))
      .toEqual(['¿A qué hora abren?', 'A las 19 horas.']);
  });

  test.each([
    ['enviar', () => request(app).post('/compras/1/mensajes').send({ autorId: 3, contenido: 'Hola' })],
    ['consultar', () => request(app).get('/compras/1/mensajes?usuarioId=3')],
  ])('impide %s mensajes a terceros', async (accion, ejecutar) => {
    const response = await ejecutar();

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('comprador y el organizador');
  });

  test.each(['', '   '])('rechaza contenido inválido %p', async (contenido) => {
    const response = await request(app).post('/compras/1/mensajes').send({
      autorId: 2,
      contenido,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('contenido');
  });

  it('permite enviar mensajes independientemente del estado de la compra', async () => {
    await request(app).patch('/compras/1/cancelar');

    const response = await request(app).post('/compras/1/mensajes').send({
      autorId: 2,
      contenido: 'Consulta posterior a la cancelación',
    });

    expect(response.status).toBe(201);
    expect(response.body.contenido).toContain('cancelación');
  });
});
