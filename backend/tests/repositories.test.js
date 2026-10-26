const Usuario = require('../src/models/Usuario');
const Categoria = require('../src/models/Categoria');
const UsuarioRepository = require('../src/repositories/UsuarioRepository');
const CategoriaRepository = require('../src/repositories/CategoriaRepository');
const EventoRepository = require('../src/repositories/EventoRepository');

describe('Repositorios en memoria', () => {
  it('UsuarioRepository lista, busca y genera IDs', () => {
    const usuario = new Usuario({ id: 4, nombre: 'Ana', email: 'ana@example.com' });
    const repository = new UsuarioRepository([usuario]);

    expect(repository.listar()).toEqual([usuario]);
    expect(repository.buscarPorId(4)).toBe(usuario);
    expect(repository.generarId()).toBe(5);
  });

  it('CategoriaRepository lista, busca y genera IDs', () => {
    const categoria = new Categoria({ id: 3, nombre: 'Teatro' });
    const repository = new CategoriaRepository([categoria]);

    expect(repository.listar()).toEqual([categoria]);
    expect(repository.buscarPorId(3)).toBe(categoria);
    expect(repository.generarId()).toBe(4);
  });

  it('EventoRepository genera IDs independientes para eventos y tipos de entrada', () => {
    const repository = new EventoRepository();

    expect(repository.generarEventoId()).toBe(1);
    expect(repository.generarEventoId()).toBe(2);
    expect(repository.generarTipoEntradaId()).toBe(1);
    expect(repository.generarTipoEntradaId()).toBe(2);
  });
});
