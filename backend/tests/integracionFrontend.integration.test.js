const request = require('supertest');
const {
  createApp,
  crearDependenciasPredeterminadas,
} = require('../src/app');
const { crearAppDePrueba } = require('./helpers/crearAppDePrueba');

describe('Contratos finales para integración con frontend', () => {
  it('lista los usuarios disponibles y permite consultar uno por ID', async () => {
    const { app } = crearAppDePrueba();

    const listado = await request(app).get('/usuarios');
    const detalle = await request(app).get('/usuarios/2');

    expect(listado.status).toBe(200);
    expect(listado.body).toHaveLength(3);
    expect(detalle.status).toBe(200);
    expect(detalle.body).toEqual({
      id: 2,
      nombre: 'Organizador Dos',
      email: 'dos@example.com',
    });
  });

  test.each([
    ['/usuarios/abc', 400, 'id debe ser un entero positivo'],
    ['/usuarios/999', 404, 'usuario no encontrado'],
  ])('responde consistentemente en %s', async (ruta, estado, mensaje) => {
    const { app } = crearAppDePrueba();
    const response = await request(app).get(ruta);

    expect(response.status).toBe(estado);
    expect(response.body).toEqual({ error: mensaje });
  });

  it('incluye cupo total y disponible sin exponer compras en el detalle del evento', async () => {
    const { app } = crearAppDePrueba();
    await request(app).post('/eventos').send({
      nombre: 'Evento con disponibilidad',
      descripcion: 'Prueba de disponibilidad pública',
      fecha: '2099-11-20T21:00:00.000Z',
      ubicacion: 'Estadio',
      organizadorId: 1,
      categoriaId: 1,
      tiposEntrada: [{ nombre: 'General', precio: 1000, cupo: 10 }],
    });
    await request(app).post('/compras').send({
      compradorId: 2,
      eventoId: 1,
      tipoEntradaId: 1,
      cantidad: 3,
    });

    const response = await request(app).get('/eventos/1');

    expect(response.status).toBe(200);
    expect(response.body.tiposEntrada[0]).toMatchObject({
      id: 1,
      cupo: 10,
      cupoTotal: 10,
      cupoDisponible: 7,
    });
    expect(response.body).not.toHaveProperty('compras');
  });

  it('responde JSON 404 para una ruta inexistente', async () => {
    const { app } = crearAppDePrueba();
    const response = await request(app).get('/ruta-que-no-existe');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ error: 'ruta no encontrada' });
  });

  it('responde JSON 400 para un cuerpo JSON malformado', async () => {
    const { app } = crearAppDePrueba();
    const response = await request(app)
      .post('/eventos')
      .set('Content-Type', 'application/json')
      .send('{"nombre":');

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ error: 'JSON malformado' });
  });
});

describe('Inicialización de datos', () => {
  it('arranca sin eventos cuando DEMO_DATA está desactivado', async () => {
    const app = createApp(crearDependenciasPredeterminadas({ demoData: false }));

    const response = await request(app).get('/eventos');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('carga un escenario demo reproducible y coherente', async () => {
    const fechaBase = new Date('2026-10-26T12:00:00.000Z');
    const dependencias = crearDependenciasPredeterminadas({ demoData: true, fechaBase });
    const app = createApp(dependencias);

    const usuarios = await request(app).get('/usuarios');
    const eventos = await request(app).get('/eventos');
    const compras = dependencias.compraRepository.listar();
    const mensajes = await request(app).get('/compras/3/mensajes?usuarioId=3');
    const reputacion = await request(app).get('/organizadores/1/resenias');
    const sinReputacion = await request(app).get('/organizadores/2/resenias');

    expect(usuarios.body).toHaveLength(4);
    expect(eventos.body).toHaveLength(3);
    expect(dependencias.eventoRepository.buscarPorId(1).fecha.getTime())
      .toBeLessThan(fechaBase.getTime());
    expect(new Set(compras.map(({ estado }) => estado))).toEqual(new Set([
      'PENDIENTE_PAGO',
      'CONFIRMADA',
      'UTILIZADA',
      'CANCELADA',
      'REEMBOLSADA',
    ]));
    expect(mensajes.body).toHaveLength(2);
    expect(reputacion.body.reputacion).toBe(4);
    expect(sinReputacion.body.reputacion).toBeNull();
  });
});
