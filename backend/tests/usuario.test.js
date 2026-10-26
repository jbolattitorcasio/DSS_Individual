const Usuario = require('../src/models/Usuario');

describe('Usuario', () => {
  it('crea un usuario válido', () => {
    const usuario = new Usuario({ id: 1, nombre: 'Ana', email: 'ana@example.com' });

    expect(usuario).toEqual({ id: 1, nombre: 'Ana', email: 'ana@example.com' });
  });

  test.each([0, -1, 1.5, '1'])('rechaza el id inválido %p', (id) => {
    expect(() => new Usuario({ id, nombre: 'Ana', email: 'ana@example.com' }))
      .toThrow('id debe ser un entero positivo');
  });

  test.each(['', '   ', null])('rechaza el nombre vacío %p', (nombre) => {
    expect(() => new Usuario({ id: 1, nombre, email: 'ana@example.com' }))
      .toThrow('nombre no puede estar vacío');
  });

  test.each(['ana', 'ana@', '@example.com', 'ana @example.com', null])(
    'rechaza el email inválido %p',
    (email) => {
      expect(() => new Usuario({ id: 1, nombre: 'Ana', email }))
        .toThrow('email debe tener un formato válido');
    },
  );
});
