const Resenia = require('../models/Resenia');
const { EstadoCompra } = require('../models/EstadoCompra');
const {
  ErrorDeValidacion,
  RecursoNoEncontradoError,
  AccesoDenegadoError,
  ConflictoError,
} = require('./errores');

class ReseniaService {
  constructor({ reseniaRepository, compraRepository, eventoRepository, usuarioRepository }) {
    this.reseniaRepository = reseniaRepository;
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  crear(compraId, datos = {}) {
    const compra = this.#buscarCompra(this.#normalizarId(compraId, 'id'));
    const compradorId = this.#normalizarId(datos.compradorId, 'compradorId');
    if (compra.compradorId !== compradorId) {
      throw new AccesoDenegadoError('solo el comprador propietario puede crear la reseña');
    }
    if (compra.estado !== EstadoCompra.UTILIZADA) {
      throw new ErrorDeValidacion('solo se puede reseñar una compra utilizada');
    }
    if (this.reseniaRepository.buscarPorCompraId(compra.id)) {
      throw new ConflictoError('la compra ya tiene una reseña');
    }

    const resenia = new Resenia({
      id: this.reseniaRepository.generarId(),
      compraId: compra.id,
      eventoId: compra.eventoId,
      compradorId,
      puntaje: datos.puntaje,
      comentario: datos.comentario,
      fecha: new Date(),
    });
    return this.reseniaRepository.guardar(resenia);
  }

  listarPorEvento(eventoId) {
    const id = this.#normalizarId(eventoId, 'id');
    if (!this.eventoRepository.buscarPorId(id)) {
      throw new RecursoNoEncontradoError('evento no encontrado');
    }
    return this.reseniaRepository.buscarPorEventoId(id);
  }

  listarPorOrganizador(organizadorId) {
    const id = this.#normalizarId(organizadorId, 'id');
    if (!this.usuarioRepository.buscarPorId(id)) {
      throw new RecursoNoEncontradoError('organizador no encontrado');
    }
    const resenias = ReseniaService.buscarPorOrganizador(
      this.eventoRepository,
      this.reseniaRepository,
      id,
    );
    return {
      organizadorId: id,
      reputacion: ReseniaService.calcularPromedio(resenias),
      resenias,
    };
  }

  static calcularPromedio(resenias) {
    if (resenias.length === 0) return null;
    return resenias.reduce((total, { puntaje }) => total + puntaje, 0) / resenias.length;
  }

  static buscarPorOrganizador(eventoRepository, reseniaRepository, organizadorId) {
    const eventosIds = new Set(eventoRepository.listar()
      .filter((evento) => evento.organizadorId === organizadorId)
      .map((evento) => evento.id));
    return reseniaRepository.listar()
      .filter((resenia) => eventosIds.has(resenia.eventoId));
  }

  #buscarCompra(id) {
    const compra = this.compraRepository.buscarPorId(id);
    if (!compra) throw new RecursoNoEncontradoError('compra no encontrada');
    return compra;
  }

  #normalizarId(valor, campo) {
    const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new ErrorDeValidacion(`${campo} debe ser un entero positivo`);
    }
    return numero;
  }
}

module.exports = ReseniaService;
