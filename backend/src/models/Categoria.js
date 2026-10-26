const { validarId, validarTextoObligatorio } = require('./validaciones');

class Categoria {
  constructor({ id, nombre }) {
    validarId(id);
    validarTextoObligatorio(nombre, 'nombre');

    this.id = id;
    this.nombre = nombre;
  }
}

module.exports = Categoria;
