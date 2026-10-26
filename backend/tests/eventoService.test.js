const EventoService = require('../src/services/EventoService');
const { crearDependenciasDePrueba } = require('./helpers/crearAppDePrueba');

describe('EventoService', () => {
  const datosValidos = () => ({
    nombre: 'Recital',
    descripcion: 'Recital al aire libre',
    fecha: '2099-12-01T20:00:00.000Z',
    ubicacion: 'Anfiteatro',
    organizadorId: 1,
    categoriaId: 1,
    tiposEntrada: [
      { nombre: 'General', precio: 1000, cupo: 100 },
      { nombre: 'VIP', precio: 2500, cupo: 20 },
    ],
  });

  it('crea el evento completo antes de guardarlo', () => {
    const dependencias = crearDependenciasDePrueba();
    const service = new EventoService(dependencias);

    const evento = service.crear(datosValidos());

    expect(dependencias.eventoRepository.listar()).toEqual([evento]);
    expect(evento.tiposEntrada).toHaveLength(2);
    expect(new Set(evento.tiposEntrada.map(({ id }) => id)).size).toBe(2);
    expect(evento.tiposEntrada.every(({ eventoId }) => eventoId === evento.id)).toBe(true);
  });

  it('no guarda parcialmente si un tipo de entrada es inválido', () => {
    const dependencias = crearDependenciasDePrueba();
    const service = new EventoService(dependencias);
    const datos = datosValidos();
    datos.tiposEntrada[1].cupo = 0;

    expect(() => service.crear(datos)).toThrow('cupo debe ser un entero positivo');
    expect(dependencias.eventoRepository.listar()).toEqual([]);
  });

  it('rechaza un organizador inexistente', () => {
    const dependencias = crearDependenciasDePrueba();
    const service = new EventoService(dependencias);

    expect(() => service.crear({ ...datosValidos(), organizadorId: 999 }))
      .toThrow('organizador no encontrado');
  });

  it('rechaza una categoría inexistente', () => {
    const dependencias = crearDependenciasDePrueba();
    const service = new EventoService(dependencias);

    expect(() => service.crear({ ...datosValidos(), categoriaId: 999 }))
      .toThrow('categoría no encontrada');
  });
});
