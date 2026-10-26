const Compra = require('../src/models/Compra');
const CambioEstadoCompra = require('../src/models/CambioEstadoCompra');
const { EstadoCompra } = require('../src/models/EstadoCompra');

describe('Compra', () => {
  const crearCompra = (cambios = {}) => new Compra({
    id: 1,
    compradorId: 2,
    eventoId: 3,
    tipoEntradaId: 4,
    cantidad: 2,
    precioUnitario: 1500,
    fechaCompra: new Date('2026-10-26T12:00:00.000Z'),
    ...cambios,
  });

  it('crea una compra pendiente con el cambio inicial en el historial', () => {
    const compra = crearCompra();

    expect(compra.estado).toBe(EstadoCompra.PENDIENTE_PAGO);
    expect(compra.historialEstados).toHaveLength(1);
    expect(compra.historialEstados[0]).toMatchObject({
      estadoAnterior: null,
      estadoNuevo: EstadoCompra.PENDIENTE_PAGO,
    });
  });

  test.each([0, -1, 1.5, '2'])('rechaza la cantidad inválida %p', (cantidad) => {
    expect(() => crearCompra({ cantidad })).toThrow('cantidad debe ser un entero positivo');
  });

  it('registra transiciones válidas en orden', () => {
    const compra = crearCompra();
    compra.cambiarEstado(EstadoCompra.CONFIRMADA, new Date('2026-10-26T13:00:00.000Z'));
    compra.cambiarEstado(EstadoCompra.CANCELADA, new Date('2026-10-26T14:00:00.000Z'));
    compra.cambiarEstado(EstadoCompra.REEMBOLSADA, new Date('2026-10-26T15:00:00.000Z'));

    expect(compra.estado).toBe(EstadoCompra.REEMBOLSADA);
    expect(compra.historialEstados.map(({ estadoNuevo }) => estadoNuevo)).toEqual([
      EstadoCompra.PENDIENTE_PAGO,
      EstadoCompra.CONFIRMADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ]);
  });

  it('rechaza transiciones no permitidas sin alterar el historial', () => {
    const compra = crearCompra();

    expect(() => compra.cambiarEstado(EstadoCompra.UTILIZADA))
      .toThrow('transición inválida');
    expect(compra.estado).toBe(EstadoCompra.PENDIENTE_PAGO);
    expect(compra.historialEstados).toHaveLength(1);
  });

  it('no permite reembolsar una cancelación que nunca fue confirmada', () => {
    const compra = crearCompra();
    compra.cambiarEstado(EstadoCompra.CANCELADA);

    expect(() => compra.cambiarEstado(EstadoCompra.REEMBOLSADA))
      .toThrow('previamente confirmada');
  });
});

describe('CambioEstadoCompra', () => {
  it('valida los estados y conserva una copia inmutable de la fecha', () => {
    const fecha = new Date('2026-10-26T12:00:00.000Z');
    const cambio = new CambioEstadoCompra({
      estadoAnterior: EstadoCompra.PENDIENTE_PAGO,
      estadoNuevo: EstadoCompra.CONFIRMADA,
      fecha,
    });
    fecha.setFullYear(2030);

    expect(cambio.fecha.toISOString()).toBe('2026-10-26T12:00:00.000Z');
    expect(Object.isFrozen(cambio)).toBe(true);
  });
});
