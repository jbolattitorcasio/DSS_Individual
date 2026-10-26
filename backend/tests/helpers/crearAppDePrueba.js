const { createApp } = require('../../src/app');
const Usuario = require('../../src/models/Usuario');
const Categoria = require('../../src/models/Categoria');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const CategoriaRepository = require('../../src/repositories/CategoriaRepository');
const EventoRepository = require('../../src/repositories/EventoRepository');
const CompraRepository = require('../../src/repositories/CompraRepository');
const MensajeRepository = require('../../src/repositories/MensajeRepository');
const ReseniaRepository = require('../../src/repositories/ReseniaRepository');

function crearDependenciasDePrueba() {
  return {
    usuarioRepository: new UsuarioRepository([
      new Usuario({ id: 1, nombre: 'Organizadora Uno', email: 'uno@example.com' }),
      new Usuario({ id: 2, nombre: 'Organizador Dos', email: 'dos@example.com' }),
      new Usuario({ id: 3, nombre: 'Usuario Tres', email: 'tres@example.com' }),
    ]),
    categoriaRepository: new CategoriaRepository([
      new Categoria({ id: 1, nombre: 'Música' }),
      new Categoria({ id: 2, nombre: 'Teatro' }),
    ]),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    mensajeRepository: new MensajeRepository(),
    reseniaRepository: new ReseniaRepository(),
  };
}

function crearAppDePrueba() {
  const dependencias = crearDependenciasDePrueba();
  return { app: createApp(dependencias), dependencias };
}

module.exports = { crearAppDePrueba, crearDependenciasDePrueba };
