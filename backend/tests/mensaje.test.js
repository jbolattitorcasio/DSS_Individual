const Mensaje = require('../src/models/Mensaje');
const MensajeRepository = require('../src/repositories/MensajeRepository');

describe('Mensaje', () => {
  it('crea un mensaje válido y copia la fecha', () => {
    const fechaEnvio = new Date('2026-10-26T12:00:00.000Z');
    const mensaje = new Mensaje({
      id: 1,
      compraId: 2,
      autorId: 3,
      contenido: '¿A qué hora abren?',
      fechaEnvio,
    });
    fechaEnvio.setFullYear(2030);

    expect(mensaje.fechaEnvio.toISOString()).toBe('2026-10-26T12:00:00.000Z');
  });

  test.each(['', '   ', null])('rechaza contenido vacío %p', (contenido) => {
    expect(() => new Mensaje({ id: 1, compraId: 2, autorId: 3, contenido }))
      .toThrow('contenido no puede estar vacío');
  });
});

describe('MensajeRepository', () => {
  it('ordena cronológicamente y usa el ID para desempatar', () => {
    const repository = new MensajeRepository();
    const tarde = new Mensaje({
      id: 3,
      compraId: 1,
      autorId: 2,
      contenido: 'Tarde',
      fechaEnvio: new Date('2026-10-26T14:00:00.000Z'),
    });
    const primero = new Mensaje({
      id: 1,
      compraId: 1,
      autorId: 1,
      contenido: 'Primero',
      fechaEnvio: new Date('2026-10-26T12:00:00.000Z'),
    });
    const segundo = new Mensaje({
      id: 2,
      compraId: 1,
      autorId: 2,
      contenido: 'Segundo',
      fechaEnvio: new Date('2026-10-26T12:00:00.000Z'),
    });
    repository.guardar(tarde);
    repository.guardar(segundo);
    repository.guardar(primero);

    expect(repository.buscarPorCompraId(1).map(({ id }) => id)).toEqual([1, 2, 3]);
  });
});
