const { ErrorDeValidacion, RecursoNoEncontradoError } = require('./errores');

class UsuarioService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  listar() {
    return this.usuarioRepository.listar();
  }

  buscarPorId(id) {
    const numero = typeof id === 'string' && id.trim() !== '' ? Number(id) : id;
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new ErrorDeValidacion('id debe ser un entero positivo');
    }
    const usuario = this.usuarioRepository.buscarPorId(numero);
    if (!usuario) throw new RecursoNoEncontradoError('usuario no encontrado');
    return usuario;
  }
}

module.exports = UsuarioService;
