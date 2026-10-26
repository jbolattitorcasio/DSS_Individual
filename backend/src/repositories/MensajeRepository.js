class MensajeRepository {
  constructor(mensajesIniciales = []) {
    this.mensajes = new Map(mensajesIniciales.map((mensaje) => [mensaje.id, mensaje]));
    this.proximoId = Math.max(0, ...this.mensajes.keys()) + 1;
  }

  generarId() {
    const id = this.proximoId;
    this.proximoId += 1;
    return id;
  }

  guardar(mensaje) {
    if (this.mensajes.has(mensaje.id)) {
      throw new Error(`ya existe un mensaje con id ${mensaje.id}`);
    }
    this.mensajes.set(mensaje.id, mensaje);
    this.proximoId = Math.max(this.proximoId, mensaje.id + 1);
    return mensaje;
  }

  buscarPorCompraId(compraId) {
    return Array.from(this.mensajes.values())
      .filter((mensaje) => mensaje.compraId === compraId)
      .sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime() || a.id - b.id);
  }
}

module.exports = MensajeRepository;
