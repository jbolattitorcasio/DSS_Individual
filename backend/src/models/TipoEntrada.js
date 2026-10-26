const { validarId, validarTextoObligatorio } = require('./validaciones');

class TipoEntrada {
  constructor({ id, eventoId, nombre, precio, cupo }) {
    validarId(id);
    validarId(eventoId, 'eventoId');
    validarTextoObligatorio(nombre, 'nombre');

    if (!Number.isFinite(precio) || precio < 0) {
      throw new TypeError('precio debe ser un número finito mayor o igual a cero');
    }

    if (!Number.isInteger(cupo) || cupo <= 0) {
      throw new TypeError('cupo debe ser un entero positivo');
    }

    this.id = id;
    this.eventoId = eventoId;
    this.nombre = nombre;
    this.precio = precio;
    this.cupo = cupo;
  }
}

module.exports = TipoEntrada;
