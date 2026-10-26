const Compra = require('../models/Compra');
const { EstadoCompra } = require('../models/EstadoCompra');
const { ErrorDeValidacion, RecursoNoEncontradoError } = require('./errores');

const ESTADOS_QUE_OCUPAN_CUPO = new Set([
  EstadoCompra.PENDIENTE_PAGO,
  EstadoCompra.CONFIRMADA,
  EstadoCompra.UTILIZADA,
]);
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

class CompraService {
  constructor({ compraRepository, usuarioRepository, eventoRepository }) {
    this.compraRepository = compraRepository;
    this.usuarioRepository = usuarioRepository;
    this.eventoRepository = eventoRepository;
  }

  crear(datos = {}) {
    const compradorId = this.#normalizarId(datos.compradorId, 'compradorId');
    const eventoId = this.#normalizarId(datos.eventoId, 'eventoId');
    const tipoEntradaId = this.#normalizarId(datos.tipoEntradaId, 'tipoEntradaId');

    if (!this.usuarioRepository.buscarPorId(compradorId)) {
      throw new RecursoNoEncontradoError('comprador no encontrado');
    }
    const evento = this.#buscarEvento(eventoId);
    if (evento.fecha.getTime() <= Date.now()) {
      throw new ErrorDeValidacion('no se pueden comprar entradas para un evento realizado');
    }
    const tipoEntrada = evento.tiposEntrada.find(({ id }) => id === tipoEntradaId);
    if (!tipoEntrada) {
      throw new RecursoNoEncontradoError('tipo de entrada no encontrado para el evento');
    }
    if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
      throw new ErrorDeValidacion('cantidad debe ser un entero positivo');
    }
    if (datos.cantidad > this.#calcularDisponible(tipoEntrada)) {
      throw new ErrorDeValidacion('cupo insuficiente');
    }

    const compra = new Compra({
      id: this.compraRepository.generarId(),
      compradorId,
      eventoId,
      tipoEntradaId,
      cantidad: datos.cantidad,
      precioUnitario: tipoEntrada.precio,
      fechaCompra: new Date(),
    });
    return this.compraRepository.guardar(compra);
  }

  buscarPorId(id) {
    return this.#buscarCompra(this.#normalizarId(id, 'id'));
  }

  listarPorComprador(compradorId) {
    const id = this.#normalizarId(compradorId, 'compradorId');
    if (!this.usuarioRepository.buscarPorId(id)) {
      throw new RecursoNoEncontradoError('comprador no encontrado');
    }

    return this.compraRepository.buscarPorCompradorId(id).map((compra) => {
      const resultado = { ...compra };
      if (compra.estado === EstadoCompra.CONFIRMADA) {
        const evento = this.#buscarEvento(compra.eventoId);
        resultado.diasRestantes = Math.max(
          0,
          Math.ceil((evento.fecha.getTime() - Date.now()) / MILISEGUNDOS_POR_DIA),
        );
      }
      return resultado;
    });
  }

  listarPorEvento(eventoId) {
    const evento = this.#buscarEvento(this.#normalizarId(eventoId, 'id'));
    return {
      compras: this.compraRepository.buscarPorEventoId(evento.id),
      disponibilidad: evento.tiposEntrada.map((tipoEntrada) => ({
        tipoEntradaId: tipoEntrada.id,
        nombre: tipoEntrada.nombre,
        cupoTotal: tipoEntrada.cupo,
        cupoDisponible: this.#calcularDisponible(tipoEntrada),
      })),
    };
  }

  confirmar(id) {
    const compra = this.#buscarCompra(this.#normalizarId(id, 'id'));
    compra.cambiarEstado(EstadoCompra.CONFIRMADA);
    return compra;
  }

  utilizar(id) {
    const compra = this.#buscarCompra(this.#normalizarId(id, 'id'));
    compra.cambiarEstado(EstadoCompra.UTILIZADA);
    return compra;
  }

  cancelar(id) {
    const compra = this.#buscarCompra(this.#normalizarId(id, 'id'));
    const evento = this.#buscarEvento(compra.eventoId);

    if (evento.fecha.getTime() <= Date.now()) {
      throw new ErrorDeValidacion('no se puede cancelar una compra después del evento');
    }
    if (compra.estado === EstadoCompra.UTILIZADA) {
      throw new ErrorDeValidacion('no se puede cancelar una compra utilizada');
    }

    const requiereReembolso = compra.estado === EstadoCompra.CONFIRMADA;
    compra.cambiarEstado(EstadoCompra.CANCELADA);
    if (requiereReembolso) {
      compra.cambiarEstado(EstadoCompra.REEMBOLSADA);
    }
    return compra;
  }

  #calcularDisponible(tipoEntrada) {
    const cantidadOcupada = this.compraRepository.listar()
      .filter((compra) => (
        compra.tipoEntradaId === tipoEntrada.id
        && ESTADOS_QUE_OCUPAN_CUPO.has(compra.estado)
      ))
      .reduce((total, compra) => total + compra.cantidad, 0);
    return tipoEntrada.cupo - cantidadOcupada;
  }

  #buscarCompra(id) {
    const compra = this.compraRepository.buscarPorId(id);
    if (!compra) throw new RecursoNoEncontradoError('compra no encontrada');
    return compra;
  }

  #buscarEvento(id) {
    const evento = this.eventoRepository.buscarPorId(id);
    if (!evento) throw new RecursoNoEncontradoError('evento no encontrado');
    return evento;
  }

  #normalizarId(valor, campo) {
    const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new ErrorDeValidacion(`${campo} debe ser un entero positivo`);
    }
    return numero;
  }
}

module.exports = CompraService;
