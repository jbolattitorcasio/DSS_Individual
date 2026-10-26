class CompraRepository {
  constructor(comprasIniciales = []) {
    this.compras = new Map(comprasIniciales.map((compra) => [compra.id, compra]));
    this.proximoId = Math.max(0, ...this.compras.keys()) + 1;
  }

  listar() {
    return Array.from(this.compras.values());
  }

  buscarPorId(id) {
    return this.compras.get(id);
  }

  buscarPorCompradorId(compradorId) {
    return this.listar().filter((compra) => compra.compradorId === compradorId);
  }

  buscarPorEventoId(eventoId) {
    return this.listar().filter((compra) => compra.eventoId === eventoId);
  }

  guardar(compra) {
    if (this.compras.has(compra.id)) {
      throw new Error(`ya existe una compra con id ${compra.id}`);
    }
    this.compras.set(compra.id, compra);
    this.proximoId = Math.max(this.proximoId, compra.id + 1);
    return compra;
  }

  generarId() {
    const id = this.proximoId;
    this.proximoId += 1;
    return id;
  }
}

module.exports = CompraRepository;
