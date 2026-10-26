const { EstadoCompra } = require('../models/EstadoCompra');

const ESTADOS_QUE_OCUPAN_CUPO = new Set([
  EstadoCompra.PENDIENTE_PAGO,
  EstadoCompra.CONFIRMADA,
  EstadoCompra.UTILIZADA,
]);

class DisponibilidadService {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  calcularParaTipo(tipoEntrada) {
    const cantidadOcupada = this.compraRepository.listar()
      .filter((compra) => (
        compra.tipoEntradaId === tipoEntrada.id
        && ESTADOS_QUE_OCUPAN_CUPO.has(compra.estado)
      ))
      .reduce((total, compra) => total + compra.cantidad, 0);
    return tipoEntrada.cupo - cantidadOcupada;
  }

  obtenerParaEvento(evento) {
    return evento.tiposEntrada.map((tipoEntrada) => ({
      tipoEntradaId: tipoEntrada.id,
      nombre: tipoEntrada.nombre,
      cupoTotal: tipoEntrada.cupo,
      cupoDisponible: this.calcularParaTipo(tipoEntrada),
    }));
  }
}

module.exports = DisponibilidadService;
