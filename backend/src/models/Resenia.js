const { validarId, validarTextoObligatorio } = require('./validaciones');

class Resenia {
  constructor({ id, compraId, eventoId, compradorId, puntaje, comentario, fecha = new Date() }) {
    validarId(id);
    validarId(compraId, 'compraId');
    validarId(eventoId, 'eventoId');
    validarId(compradorId, 'compradorId');
    if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
      throw new TypeError('puntaje debe ser un entero entre 1 y 5');
    }
    validarTextoObligatorio(comentario, 'comentario');
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
      throw new TypeError('fecha debe ser una fecha válida');
    }

    this.id = id;
    this.compraId = compraId;
    this.eventoId = eventoId;
    this.compradorId = compradorId;
    this.puntaje = puntaje;
    this.comentario = comentario;
    this.fecha = new Date(fecha.getTime());
  }
}

module.exports = Resenia;
