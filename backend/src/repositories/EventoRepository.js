class EventoRepository {
  constructor(eventosIniciales = []) {
    this.eventos = new Map(eventosIniciales.map((evento) => [evento.id, evento]));
    this.proximoEventoId = Math.max(0, ...this.eventos.keys()) + 1;
    const idsTiposEntrada = eventosIniciales.flatMap((evento) => (
      evento.tiposEntrada.map((tipoEntrada) => tipoEntrada.id)
    ));
    this.proximoTipoEntradaId = Math.max(0, ...idsTiposEntrada) + 1;
  }

  listar() {
    return Array.from(this.eventos.values());
  }

  buscarPorId(id) {
    return this.eventos.get(id);
  }

  guardar(evento) {
    if (this.eventos.has(evento.id)) {
      throw new Error(`ya existe un evento con id ${evento.id}`);
    }

    this.eventos.set(evento.id, evento);
    this.proximoEventoId = Math.max(this.proximoEventoId, evento.id + 1);
    for (const tipoEntrada of evento.tiposEntrada) {
      this.proximoTipoEntradaId = Math.max(this.proximoTipoEntradaId, tipoEntrada.id + 1);
    }
    return evento;
  }

  generarEventoId() {
    const id = this.proximoEventoId;
    this.proximoEventoId += 1;
    return id;
  }

  generarTipoEntradaId() {
    const id = this.proximoTipoEntradaId;
    this.proximoTipoEntradaId += 1;
    return id;
  }
}

module.exports = EventoRepository;
