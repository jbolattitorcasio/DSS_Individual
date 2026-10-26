const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');

function crearUsuariosIniciales() {
  return [
    new Usuario({ id: 1, nombre: 'Ana Organizadora', email: 'ana@aiticketit.com' }),
    new Usuario({ id: 2, nombre: 'Bruno Productor', email: 'bruno@aiticketit.com' }),
  ];
}

function crearCategoriasIniciales() {
  return [
    new Categoria({ id: 1, nombre: 'Música' }),
    new Categoria({ id: 2, nombre: 'Teatro' }),
    new Categoria({ id: 3, nombre: 'Deportes' }),
    new Categoria({ id: 4, nombre: 'Conferencias' }),
  ];
}

module.exports = { crearUsuariosIniciales, crearCategoriasIniciales };
