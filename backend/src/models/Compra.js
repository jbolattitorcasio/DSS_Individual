const { validarId } = require('./validaciones');
const CambioEstadoCompra = require('./CambioEstadoCompra');
const { EstadoCompra, esEstadoCompra } = require('./EstadoCompra');

const TRANSICIONES = Object.freeze({
  [EstadoCompra.PENDIENTE_PAGO]: new Set([
    EstadoCompra.CONFIRMADA,
    EstadoCompra.CANCELADA,
  ]),
  [EstadoCompra.CONFIRMADA]: new Set([
    EstadoCompra.UTILIZADA,
    EstadoCompra.CANCELADA,
  ]),
  [EstadoCompra.CANCELADA]: new Set([EstadoCompra.REEMBOLSADA]),
  [EstadoCompra.UTILIZADA]: new Set(),
  [EstadoCompra.REEMBOLSADA]: new Set(),
});

class Compra {
  constructor({
    id,
    compradorId,
    eventoId,
    tipoEntradaId,
    cantidad,
    precioUnitario,
    fechaCompra = new Date(),
    estado = EstadoCompra.PENDIENTE_PAGO,
  }) {
    validarId(id);
    validarId(compradorId, 'compradorId');
    validarId(eventoId, 'eventoId');
    validarId(tipoEntradaId, 'tipoEntradaId');

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new TypeError('cantidad debe ser un entero positivo');
    }
    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
      throw new TypeError('precioUnitario debe ser un número finito mayor o igual a cero');
    }
    if (!(fechaCompra instanceof Date) || Number.isNaN(fechaCompra.getTime())) {
      throw new TypeError('fechaCompra debe ser una fecha válida');
    }
    if (!esEstadoCompra(estado)) {
      throw new TypeError('estado no es un estado de compra válido');
    }

    this.id = id;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.tipoEntradaId = tipoEntradaId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.fechaCompra = new Date(fechaCompra.getTime());
    this.estado = estado;
    this.historialEstados = [new CambioEstadoCompra({
      estadoAnterior: null,
      estadoNuevo: estado,
      fecha: this.fechaCompra,
    })];
  }

  cambiarEstado(nuevoEstado, fecha = new Date()) {
    if (!esEstadoCompra(nuevoEstado)) {
      throw new TypeError('estado no es un estado de compra válido');
    }
    if (!TRANSICIONES[this.estado].has(nuevoEstado)) {
      throw new TypeError(`transición inválida de ${this.estado} a ${nuevoEstado}`);
    }
    if (
      nuevoEstado === EstadoCompra.REEMBOLSADA
      && !this.historialEstados.some(({ estadoNuevo }) => estadoNuevo === EstadoCompra.CONFIRMADA)
    ) {
      throw new TypeError('solo una compra previamente confirmada puede reembolsarse');
    }

    const cambio = new CambioEstadoCompra({
      estadoAnterior: this.estado,
      estadoNuevo: nuevoEstado,
      fecha,
    });
    this.estado = nuevoEstado;
    this.historialEstados.push(cambio);
    return cambio;
  }
}

module.exports = Compra;
