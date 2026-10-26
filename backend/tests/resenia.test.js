const Resenia = require('../src/models/Resenia');
const ReseniaService = require('../src/services/ReseniaService');

describe('Resenia', () => {
  const datosValidos = {
    id: 1,
    compraId: 2,
    eventoId: 3,
    compradorId: 4,
    puntaje: 5,
    comentario: 'Excelente experiencia',
  };

  it('crea una reseña válida', () => {
    expect(new Resenia(datosValidos)).toMatchObject(datosValidos);
  });

  test.each([0, 6, 1.5, '5'])('rechaza el puntaje inválido %p', (puntaje) => {
    expect(() => new Resenia({ ...datosValidos, puntaje }))
      .toThrow('puntaje debe ser un entero entre 1 y 5');
  });

  test.each(['', '   ', undefined])('rechaza el comentario vacío %p', (comentario) => {
    expect(() => new Resenia({ ...datosValidos, comentario }))
      .toThrow('comentario no puede estar vacío');
  });
});

describe('Reputación', () => {
  it('calcula el promedio y devuelve null cuando no hay reseñas', () => {
    expect(ReseniaService.calcularPromedio([{ puntaje: 5 }, { puntaje: 3 }])).toBe(4);
    expect(ReseniaService.calcularPromedio([])).toBeNull();
  });
});
