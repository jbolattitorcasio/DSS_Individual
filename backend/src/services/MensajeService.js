const Mensaje = require('../models/Mensaje');
const {
  ErrorDeValidacion,
  RecursoNoEncontradoError,
  AccesoDenegadoError,
} = require('./errores');

class MensajeService {
  constructor({ mensajeRepository, compraRepository, eventoRepository }) {
    this.mensajeRepository = mensajeRepository;
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
  }

  listar(compraId, usuarioId) {
    const compra = this.#buscarCompra(this.#normalizarId(compraId, 'id'));
    this.#validarParticipante(compra, this.#normalizarId(usuarioId, 'usuarioId'));
    return this.mensajeRepository.buscarPorCompraId(compra.id);
  }

  crear(compraId, datos = {}) {
    const compra = this.#buscarCompra(this.#normalizarId(compraId, 'id'));
    const autorId = this.#normalizarId(datos.autorId, 'autorId');
    this.#validarParticipante(compra, autorId);

    const mensaje = new Mensaje({
      id: this.mensajeRepository.generarId(),
      compraId: compra.id,
      autorId,
      contenido: datos.contenido,
      fechaEnvio: new Date(),
    });
    return this.mensajeRepository.guardar(mensaje);
  }

  #validarParticipante(compra, usuarioId) {
    const evento = this.eventoRepository.buscarPorId(compra.eventoId);
    if (!evento) throw new RecursoNoEncontradoError('evento no encontrado');
    if (usuarioId !== compra.compradorId && usuarioId !== evento.organizadorId) {
      throw new AccesoDenegadoError('solo el comprador y el organizador pueden acceder a los mensajes');
    }
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

module.exports = MensajeService;
