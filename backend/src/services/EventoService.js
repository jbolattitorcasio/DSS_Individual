const Evento = require('../models/Evento');
const TipoEntrada = require('../models/TipoEntrada');
const { ErrorDeValidacion, RecursoNoEncontradoError } = require('./errores');

const ORDENES_VALIDOS = new Set(['fecha_asc', 'fecha_desc', 'precio_asc', 'precio_desc']);

class EventoService {
  constructor({ eventoRepository, usuarioRepository, categoriaRepository }) {
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
    this.categoriaRepository = categoriaRepository;
  }

  listar({ q, categoriaId, orden } = {}) {
    const categoriaNormalizada = this.#normalizarCategoriaId(categoriaId);
    this.#validarOrden(orden);

    let eventos = this.eventoRepository.listar();

    if (typeof q === 'string' && q.trim()) {
      const texto = q.trim().toLocaleLowerCase('es');
      eventos = eventos.filter((evento) => (
        evento.nombre.toLocaleLowerCase('es').includes(texto)
        || evento.descripcion.toLocaleLowerCase('es').includes(texto)
      ));
    }

    if (categoriaNormalizada !== undefined) {
      eventos = eventos.filter((evento) => evento.categoriaId === categoriaNormalizada);
    }

    return this.#ordenar(eventos, orden);
  }

  buscarPorId(id) {
    const idNormalizado = this.#normalizarId(id, 'id');
    const evento = this.eventoRepository.buscarPorId(idNormalizado);

    if (!evento) {
      throw new RecursoNoEncontradoError('evento no encontrado');
    }

    return evento;
  }

  crear(datos = {}) {
    const organizadorId = this.#normalizarId(datos.organizadorId, 'organizadorId');
    const categoriaId = this.#normalizarId(datos.categoriaId, 'categoriaId');

    if (!this.usuarioRepository.buscarPorId(organizadorId)) {
      throw new RecursoNoEncontradoError('organizador no encontrado');
    }

    if (!this.categoriaRepository.buscarPorId(categoriaId)) {
      throw new RecursoNoEncontradoError('categoría no encontrada');
    }

    if (!Array.isArray(datos.tiposEntrada) || datos.tiposEntrada.length === 0) {
      throw new ErrorDeValidacion('tiposEntrada debe contener al menos un tipo de entrada');
    }

    const eventoId = this.eventoRepository.generarEventoId();
    const evento = new Evento({
      id: eventoId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      fecha: new Date(datos.fecha),
      ubicacion: datos.ubicacion,
      organizadorId,
      categoriaId,
      imagenUrl: datos.imagenUrl,
    });

    const tiposEntrada = datos.tiposEntrada.map((datosTipo) => new TipoEntrada({
      id: this.eventoRepository.generarTipoEntradaId(),
      eventoId,
      nombre: datosTipo.nombre,
      precio: datosTipo.precio,
      cupo: datosTipo.cupo,
    }));

    tiposEntrada.forEach((tipoEntrada) => evento.agregarTipoEntrada(tipoEntrada));
    return this.eventoRepository.guardar(evento);
  }

  #normalizarCategoriaId(categoriaId) {
    if (categoriaId === undefined) return undefined;
    return this.#normalizarId(categoriaId, 'categoriaId');
  }

  #normalizarId(valor, campo) {
    const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new ErrorDeValidacion(`${campo} debe ser un entero positivo`);
    }
    return numero;
  }

  #validarOrden(orden) {
    if (orden !== undefined && !ORDENES_VALIDOS.has(orden)) {
      throw new ErrorDeValidacion(`orden inválido: ${orden}`);
    }
  }

  #ordenar(eventos, orden) {
    if (!orden) return eventos;

    const copia = [...eventos];
    if (orden.startsWith('fecha')) {
      const direccion = orden.endsWith('asc') ? 1 : -1;
      return copia.sort((a, b) => direccion * (a.fecha.getTime() - b.fecha.getTime()));
    }

    const direccion = orden.endsWith('asc') ? 1 : -1;
    return copia.sort((a, b) => direccion * (this.#precioMinimo(a) - this.#precioMinimo(b)));
  }

  #precioMinimo(evento) {
    return Math.min(...evento.tiposEntrada.map(({ precio }) => precio));
  }
}

module.exports = EventoService;
