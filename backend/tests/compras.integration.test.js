const request = require('supertest');
const { crearAppDePrueba } = require('./helpers/crearAppDePrueba');

describe('API de compras', () => {
  let app;
  let dependencias;

  const datosEvento = (cambios = {}) => ({
    nombre: 'Concierto',
    descripcion: 'Concierto de prueba',
    fecha: '2099-11-20T21:00:00.000Z',
    ubicacion: 'Estadio',
    organizadorId: 1,
    categoriaId: 1,
    tiposEntrada: [{ nombre: 'General', precio: 1200, cupo: 10 }],
    ...cambios,
  });

  async function crearEvento(cambios = {}) {
    const response = await request(app).post('/eventos').send(datosEvento(cambios));
    expect(response.status).toBe(201);
    return response.body;
  }

  async function crearCompra(cambios = {}) {
    return request(app).post('/compras').send({
      compradorId: 2,
      eventoId: 1,
      tipoEntradaId: 1,
      cantidad: 3,
      ...cambios,
    });
  }

  async function obtenerDisponible(eventoId = 1) {
    const response = await request(app).get(`/eventos/${eventoId}/compras`);
    return response.body.disponibilidad[0].cupoDisponible;
  }

  beforeEach(() => {
    ({ app, dependencias } = crearAppDePrueba());
  });

  it('crea una compra válida pendiente, registra precio e historial y reserva cupo', async () => {
    await crearEvento();

    const response = await crearCompra();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 1,
      compradorId: 2,
      eventoId: 1,
      tipoEntradaId: 1,
      cantidad: 3,
      precioUnitario: 1200,
      estado: 'PENDIENTE_PAGO',
    });
    expect(response.body.historialEstados).toHaveLength(1);
    expect(await obtenerDisponible()).toBe(7);
  });

  it('rechaza una compra que supera el cupo disponible', async () => {
    await crearEvento();
    await crearCompra({ cantidad: 8 });

    const response = await crearCompra({ cantidad: 3 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'cupo insuficiente' });
    expect(await obtenerDisponible()).toBe(2);
  });

  test.each([0, -1, 1.5, '2'])(
    'rechaza la cantidad inválida %p',
    async (cantidad) => {
      await crearEvento();
      const response = await crearCompra({ cantidad });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'cantidad debe ser un entero positivo' });
    },
  );

  test.each([
    ['comprador', { compradorId: 999 }, 'comprador no encontrado'],
    ['evento', { eventoId: 999 }, 'evento no encontrado'],
    ['tipo de entrada', { tipoEntradaId: 999 }, 'tipo de entrada no encontrado para el evento'],
  ])('rechaza una compra con %s inexistente', async (recurso, cambios, mensaje) => {
    await crearEvento();

    const response = await crearCompra(cambios);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: mensaje });
  });

  it('rechaza una entrada que pertenece a otro evento', async () => {
    await crearEvento();
    await crearEvento({ nombre: 'Segundo evento' });

    const response = await crearCompra({ eventoId: 1, tipoEntradaId: 2 });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('tipo de entrada');
  });

  it('rechaza compras para eventos ya realizados', async () => {
    await crearEvento();
    dependencias.eventoRepository.buscarPorId(1).fecha = new Date('2020-01-01T00:00:00.000Z');

    const response = await crearCompra();

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('evento realizado');
  });

  it('confirma una compra, mantiene el cupo reservado y registra el cambio', async () => {
    await crearEvento();
    await crearCompra();

    const response = await request(app).patch('/compras/1/confirmar');

    expect(response.status).toBe(200);
    expect(response.body.estado).toBe('CONFIRMADA');
    expect(response.body.historialEstados.map(({ estadoNuevo }) => estadoNuevo))
      .toEqual(['PENDIENTE_PAGO', 'CONFIRMADA']);
    expect(await obtenerDisponible()).toBe(7);
  });

  it('utiliza una compra confirmada y mantiene el cupo ocupado', async () => {
    await crearEvento();
    await crearCompra();
    await request(app).patch('/compras/1/confirmar');

    const response = await request(app).patch('/compras/1/utilizar');

    expect(response.status).toBe(200);
    expect(response.body.estado).toBe('UTILIZADA');
    expect(await obtenerDisponible()).toBe(7);
  });

  it('cancela una compra pendiente sin reembolso y libera el cupo', async () => {
    await crearEvento();
    await crearCompra();

    const response = await request(app).patch('/compras/1/cancelar');

    expect(response.status).toBe(200);
    expect(response.body.estado).toBe('CANCELADA');
    expect(response.body.historialEstados.map(({ estadoNuevo }) => estadoNuevo))
      .toEqual(['PENDIENTE_PAGO', 'CANCELADA']);
    expect(await obtenerDisponible()).toBe(10);
  });

  it('cancela una compra confirmada, simula el reembolso y libera el cupo', async () => {
    await crearEvento();
    await crearCompra();
    await request(app).patch('/compras/1/confirmar');

    const response = await request(app).patch('/compras/1/cancelar');

    expect(response.status).toBe(200);
    expect(response.body.estado).toBe('REEMBOLSADA');
    expect(response.body.historialEstados.map(({ estadoNuevo }) => estadoNuevo)).toEqual([
      'PENDIENTE_PAGO',
      'CONFIRMADA',
      'CANCELADA',
      'REEMBOLSADA',
    ]);
    expect(await obtenerDisponible()).toBe(10);
  });

  it('rechaza cancelar una compra utilizada', async () => {
    await crearEvento();
    await crearCompra();
    await request(app).patch('/compras/1/confirmar');
    await request(app).patch('/compras/1/utilizar');

    const response = await request(app).patch('/compras/1/cancelar');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('compra utilizada');
    expect(await obtenerDisponible()).toBe(7);
  });

  it('rechaza cancelar una compra después del evento', async () => {
    await crearEvento();
    await crearCompra();
    dependencias.eventoRepository.buscarPorId(1).fecha = new Date('2020-01-01T00:00:00.000Z');

    const response = await request(app).patch('/compras/1/cancelar');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('después del evento');
  });

  it('rechaza transiciones inválidas sin agregar cambios al historial', async () => {
    await crearEvento();
    await crearCompra();

    const response = await request(app).patch('/compras/1/utilizar');
    const detalle = await request(app).get('/compras/1');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('transición inválida');
    expect(detalle.body.estado).toBe('PENDIENTE_PAGO');
    expect(detalle.body.historialEstados).toHaveLength(1);
  });

  it('conserva el precio unitario aunque cambie el precio del tipo de entrada', async () => {
    await crearEvento();
    await crearCompra();
    dependencias.eventoRepository.buscarPorId(1).tiposEntrada[0].precio = 9999;

    const response = await request(app).get('/compras/1');

    expect(response.body.precioUnitario).toBe(1200);
  });

  it('lista compras del comprador e incluye días restantes solo si están confirmadas', async () => {
    await crearEvento();
    await crearCompra({ cantidad: 1 });
    await crearCompra({ cantidad: 1 });
    await request(app).patch('/compras/1/confirmar');

    const response = await request(app).get('/compras?compradorId=2');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].diasRestantes).toBeGreaterThan(0);
    expect(response.body[1]).not.toHaveProperty('diasRestantes');
  });

  it('lista las compras de un evento y la disponibilidad de cada tipo', async () => {
    await crearEvento({
      tiposEntrada: [
        { nombre: 'General', precio: 1200, cupo: 10 },
        { nombre: 'VIP', precio: 2500, cupo: 4 },
      ],
    });
    await crearCompra({ cantidad: 3 });
    await crearCompra({ tipoEntradaId: 2, cantidad: 1 });

    const response = await request(app).get('/eventos/1/compras');

    expect(response.status).toBe(200);
    expect(response.body.compras).toHaveLength(2);
    expect(response.body.disponibilidad).toEqual([
      { tipoEntradaId: 1, nombre: 'General', cupoTotal: 10, cupoDisponible: 7 },
      { tipoEntradaId: 2, nombre: 'VIP', cupoTotal: 4, cupoDisponible: 3 },
    ]);
  });

  it('mantiene datos aislados entre aplicaciones de prueba', async () => {
    await crearEvento();
    await crearCompra();
    const otraApp = crearAppDePrueba().app;

    const response = await request(otraApp).get('/compras?compradorId=2');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
