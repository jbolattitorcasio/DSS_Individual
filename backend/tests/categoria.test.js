const Categoria = require('../src/models/Categoria');

describe('Categoria', () => {
  it('crea una categoría válida', () => {
    const categoria = new Categoria({ id: 1, nombre: 'Música' });

    expect(categoria).toEqual({ id: 1, nombre: 'Música' });
  });

  test.each([0, -1, 1.5, '1'])('rechaza el id inválido %p', (id) => {
    expect(() => new Categoria({ id, nombre: 'Música' }))
      .toThrow('id debe ser un entero positivo');
  });

  test.each(['', '   ', undefined])('rechaza el nombre vacío %p', (nombre) => {
    expect(() => new Categoria({ id: 1, nombre }))
      .toThrow('nombre no puede estar vacío');
  });
});
