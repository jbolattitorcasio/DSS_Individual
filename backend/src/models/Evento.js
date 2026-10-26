const TipoEntrada = require('./TipoEntrada');
const { validarId, validarTextoObligatorio } = require('./validaciones');
const REHIDRATAR = Symbol('rehidratar evento existente');

class Evento {
  constructor({
    id,
    nombre,
    descripcion,
    fecha,
    ubicacion,
    organizadorId,
    categoriaId,
    imagenUrl,
  }, modoCreacion) {
    validarId(id);
    validarTextoObligatorio(nombre, 'nombre');
    validarTextoObligatorio(descripcion, 'descripcion');
    validarTextoObligatorio(ubicacion, 'ubicacion');
    validarId(organizadorId, 'organizadorId');
    validarId(categoriaId, 'categoriaId');

    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
      throw new TypeError('fecha debe ser una fecha válida');
    }

    if (modoCreacion !== REHIDRATAR && fecha.getTime() <= Date.now()) {
      throw new RangeError('fecha debe ser futura');
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fecha = new Date(fecha.getTime());
    this.ubicacion = ubicacion;
    this.organizadorId = organizadorId;
    this.categoriaId = categoriaId;
    this.imagenUrl = imagenUrl;
    this.tiposEntrada = [];
  }

  static rehidratar(datos) {
    return new Evento(datos, REHIDRATAR);
  }

  agregarTipoEntrada(tipoEntrada) {
    if (!(tipoEntrada instanceof TipoEntrada)) {
      throw new TypeError('tipoEntrada debe ser una instancia de TipoEntrada');
    }

    if (tipoEntrada.eventoId !== this.id) {
      throw new Error('el tipo de entrada debe pertenecer al mismo evento');
    }

    if (this.tiposEntrada.some(({ id }) => id === tipoEntrada.id)) {
      throw new Error('ya existe un tipo de entrada con el mismo id');
    }

    this.tiposEntrada.push(tipoEntrada);
  }
}

module.exports = Evento;
