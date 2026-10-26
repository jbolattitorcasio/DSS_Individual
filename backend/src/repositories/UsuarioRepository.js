class UsuarioRepository {
  constructor(usuariosIniciales = []) {
    this.usuarios = new Map(usuariosIniciales.map((usuario) => [usuario.id, usuario]));
    this.proximoId = this.#calcularProximoId();
  }

  listar() {
    return Array.from(this.usuarios.values());
  }

  buscarPorId(id) {
    return this.usuarios.get(id);
  }

  guardar(usuario) {
    if (this.usuarios.has(usuario.id)) {
      throw new Error(`ya existe un usuario con id ${usuario.id}`);
    }

    this.usuarios.set(usuario.id, usuario);
    this.proximoId = Math.max(this.proximoId, usuario.id + 1);
    return usuario;
  }

  generarId() {
    const id = this.proximoId;
    this.proximoId += 1;
    return id;
  }

  #calcularProximoId() {
    return Math.max(0, ...this.usuarios.keys()) + 1;
  }
}

module.exports = UsuarioRepository;
