const { esEstadoCompra } = require('./EstadoCompra');

class CambioEstadoCompra {
  constructor({ estadoAnterior, estadoNuevo, fecha = new Date() }) {
    if (estadoAnterior !== null && !esEstadoCompra(estadoAnterior)) {
      throw new TypeError('estadoAnterior no es un estado de compra válido');
    }
    if (!esEstadoCompra(estadoNuevo)) {
      throw new TypeError('estadoNuevo no es un estado de compra válido');
    }
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
      throw new TypeError('fecha debe ser una fecha válida');
    }

    this.estadoAnterior = estadoAnterior;
    this.estadoNuevo = estadoNuevo;
    this.fecha = new Date(fecha.getTime());
    Object.freeze(this);
  }
}

module.exports = CambioEstadoCompra;
