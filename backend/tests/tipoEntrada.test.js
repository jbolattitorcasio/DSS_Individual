const TipoEntrada = require('../src/models/TipoEntrada');

describe('TipoEntrada', () => {
  const datosValidos = {
    id: 1,
    eventoId: 2,
    nombre: 'General',
    precio: 1500,
    cupo: 100,
  };

  it('crea un tipo de entrada válido', () => {
    expect(new TipoEntrada(datosValidos)).toEqual(datosValidos);
  });

  it('acepta una entrada gratuita', () => {
    expect(new TipoEntrada({ ...datosValidos, precio: 0 }).precio).toBe(0);
  });

  test.each([
    ['id', 0],
    ['id', 1.5],
    ['eventoId', -1],
    ['eventoId', '2'],
  ])('rechaza %s inválido: %p', (campo, valor) => {
    expect(() => new TipoEntrada({ ...datosValidos, [campo]: valor }))
      .toThrow(`${campo} debe ser un entero positivo`);
  });

  test.each(['', '   ', null])('rechaza el nombre vacío %p', (nombre) => {
    expect(() => new TipoEntrada({ ...datosValidos, nombre }))
      .toThrow('nombre no puede estar vacío');
  });

  test.each([-1, Infinity, NaN, '100'])('rechaza el precio inválido %p', (precio) => {
    expect(() => new TipoEntrada({ ...datosValidos, precio }))
      .toThrow('precio debe ser un número finito mayor o igual a cero');
  });

  test.each([0, -1, 1.5, '10'])('rechaza el cupo inválido %p', (cupo) => {
    expect(() => new TipoEntrada({ ...datosValidos, cupo }))
      .toThrow('cupo debe ser un entero positivo');
  });
});
