const { validarId, validarTextoObligatorio } = require('./validaciones');

class Mensaje {
  constructor({ id, compraId, autorId, contenido, fechaEnvio = new Date() }) {
    validarId(id);
    validarId(compraId, 'compraId');
    validarId(autorId, 'autorId');
    validarTextoObligatorio(contenido, 'contenido');
    if (!(fechaEnvio instanceof Date) || Number.isNaN(fechaEnvio.getTime())) {
      throw new TypeError('fechaEnvio debe ser una fecha válida');
    }

    this.id = id;
    this.compraId = compraId;
    this.autorId = autorId;
    this.contenido = contenido;
    this.fechaEnvio = new Date(fechaEnvio.getTime());
  }
}

module.exports = Mensaje;
