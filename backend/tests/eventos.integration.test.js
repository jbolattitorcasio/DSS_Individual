const request = require('supertest');
const { crearAppDePrueba } = require('./helpers/crearAppDePrueba');

describe('API de eventos y categorías', () => {
  let app;

  const eventoValido = (cambios = {}) => ({
    nombre: 'Festival de Jazz',
    descripcion: 'Música en vivo junto al río',
    fecha: '2099-10-20T21:00:00.000Z',
    ubicacion: 'Anfiteatro Municipal',
    organizadorId: 1,
    categoriaId: 1,
    imagenUrl: 'https://example.com/jazz.jpg',
    tiposEntrada: [
      { nombre: 'General', precio: 1200, cupo: 100 },
      { nombre: 'VIP', precio: 3000, cupo: 20 },
    ],
    ...cambios,
  });

  async function crearEvento(cambios = {}) {
    return request(app).post('/eventos').send(eventoValido(cambios));
  }

  beforeEach(() => {
    ({ app } = crearAppDePrueba());
  });

  it('crea un evento con múltiples tipos de entrada e IDs generados', async () => {
    const response = await crearEvento();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 1,
      nombre: 'Festival de Jazz',
      organizadorId: 1,
      categoriaId: 1,
    });
    expect(response.body.tiposEntrada).toEqual([
      { id: 1, eventoId: 1, nombre: 'General', precio: 1200, cupo: 100 },
      { id: 2, eventoId: 1, nombre: 'VIP', precio: 3000, cupo: 20 },
    ]);
  });

  test.each([
    ['organizador', { organizadorId: 999 }, 'organizador no encontrado'],
    ['categoría', { categoriaId: 999 }, 'categoría no encontrada'],
  ])('rechaza un evento con %s inexistente', async (recurso, cambios, mensaje) => {
    const response = await crearEvento(cambios);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: mensaje });
  });

  test.each([
    ['organizadorId', 'incorrecto'],
    ['categoriaId', 1.5],
  ])('responde 400 cuando %s tiene formato inválido', async (campo, valor) => {
    const response = await crearEvento({ [campo]: valor });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: `${campo} debe ser un entero positivo` });
  });

  test.each([
    ['precio negativo', [{ nombre: 'General', precio: -1, cupo: 10 }], 'precio'],
    ['precio no numérico', [{ nombre: 'General', precio: '100', cupo: 10 }], 'precio'],
    ['cupo cero', [{ nombre: 'General', precio: 100, cupo: 0 }], 'cupo'],
    ['cupo decimal', [{ nombre: 'General', precio: 100, cupo: 1.5 }], 'cupo'],
  ])('responde 400 ante %s', async (caso, tiposEntrada, parteMensaje) => {
    const response = await crearEvento({ tiposEntrada });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain(parteMensaje);
  });

  test.each([
    ['fecha inválida', 'no-es-una-fecha', 'fecha debe ser una fecha válida'],
    ['fecha pasada', '2020-01-01T00:00:00.000Z', 'fecha debe ser futura'],
  ])('responde 400 ante %s', async (caso, fecha, mensaje) => {
    const response = await crearEvento({ fecha });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: mensaje });
  });

  it('exige al menos un tipo de entrada', async () => {
    const response = await crearEvento({ tiposEntrada: [] });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('al menos un tipo');
  });

  it('no conserva un evento parcialmente creado después de un error', async () => {
    await crearEvento({ tiposEntrada: [{ nombre: 'Inválida', precio: -1, cupo: 10 }] });

    const response = await request(app).get('/eventos');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('consulta el detalle de un evento con sus entradas', async () => {
    await crearEvento();

    const response = await request(app).get('/eventos/1');

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Festival de Jazz');
    expect(response.body.tiposEntrada).toHaveLength(2);
  });

  it('responde 404 al consultar un evento inexistente', async () => {
    const response = await request(app).get('/eventos/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'evento no encontrado' });
  });

  it('busca por nombre o descripción sin distinguir mayúsculas', async () => {
    await crearEvento();
    await crearEvento({
      nombre: 'Obra clásica',
      descripcion: 'Drama histórico',
      categoriaId: 2,
    });

    const porNombre = await request(app).get('/eventos?q=JAZZ');
    const porDescripcion = await request(app).get('/eventos?q=histórico');

    expect(porNombre.body.map(({ nombre }) => nombre)).toEqual(['Festival de Jazz']);
    expect(porDescripcion.body.map(({ nombre }) => nombre)).toEqual(['Obra clásica']);
  });

  it('filtra eventos por categoría', async () => {
    await crearEvento();
    await crearEvento({ nombre: 'Hamlet', categoriaId: 2 });

    const response = await request(app).get('/eventos?categoriaId=2');

    expect(response.body.map(({ nombre }) => nombre)).toEqual(['Hamlet']);
  });

  test.each([
    ['fecha_asc', ['Temprano', 'Tarde']],
    ['fecha_desc', ['Tarde', 'Temprano']],
  ])('ordena eventos por %s', async (orden, nombresEsperados) => {
    await crearEvento({ nombre: 'Tarde', fecha: '2099-12-20T21:00:00.000Z' });
    await crearEvento({ nombre: 'Temprano', fecha: '2099-01-20T21:00:00.000Z' });

    const response = await request(app).get(`/eventos?orden=${orden}`);

    expect(response.body.map(({ nombre }) => nombre)).toEqual(nombresEsperados);
  });

  test.each([
    ['precio_asc', ['Económico', 'Costoso']],
    ['precio_desc', ['Costoso', 'Económico']],
  ])('ordena eventos por %s usando el menor precio', async (orden, nombresEsperados) => {
    await crearEvento({
      nombre: 'Costoso',
      tiposEntrada: [{ nombre: 'General', precio: 500, cupo: 20 }],
    });
    await crearEvento({
      nombre: 'Económico',
      tiposEntrada: [
        { nombre: 'VIP', precio: 900, cupo: 10 },
        { nombre: 'General', precio: 100, cupo: 50 },
      ],
    });

    const response = await request(app).get(`/eventos?orden=${orden}`);

    expect(response.body.map(({ nombre }) => nombre)).toEqual(nombresEsperados);
  });

  it('combina búsqueda, categoría y ordenamiento', async () => {
    await crearEvento({
      nombre: 'Jazz premium',
      categoriaId: 1,
      tiposEntrada: [{ nombre: 'General', precio: 800, cupo: 20 }],
    });
    await crearEvento({
      nombre: 'Jazz popular',
      categoriaId: 1,
      tiposEntrada: [{ nombre: 'General', precio: 200, cupo: 40 }],
    });
    await crearEvento({
      nombre: 'Jazz teatral',
      categoriaId: 2,
      tiposEntrada: [{ nombre: 'General', precio: 100, cupo: 30 }],
    });

    const response = await request(app)
      .get('/eventos?q=jazz&categoriaId=1&orden=precio_asc');

    expect(response.body.map(({ nombre }) => nombre))
      .toEqual(['Jazz popular', 'Jazz premium']);
  });

  test.each([
    ['/eventos?categoriaId=abc', 'categoriaId debe ser un entero positivo'],
    ['/eventos?orden=desconocido', 'orden inválido: desconocido'],
    ['/eventos/abc', 'id debe ser un entero positivo'],
  ])('responde 400 ante parámetros inválidos en %s', async (ruta, mensaje) => {
    const response = await request(app).get(ruta);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: mensaje });
  });

  it('lista las categorías disponibles', async () => {
    const response = await request(app).get('/categorias');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, nombre: 'Música' },
      { id: 2, nombre: 'Teatro' },
    ]);
  });
});
