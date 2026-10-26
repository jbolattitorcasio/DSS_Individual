class ReseniaRepository {
  constructor(reseniasIniciales = []) {
    this.resenias = new Map(reseniasIniciales.map((resenia) => [resenia.id, resenia]));
    this.proximoId = Math.max(0, ...this.resenias.keys()) + 1;
  }

  generarId() {
    const id = this.proximoId;
    this.proximoId += 1;
    return id;
  }

  guardar(resenia) {
    if (this.buscarPorCompraId(resenia.compraId)) {
      throw new Error(`ya existe una reseña para la compra ${resenia.compraId}`);
    }
    this.resenias.set(resenia.id, resenia);
    this.proximoId = Math.max(this.proximoId, resenia.id + 1);
    return resenia;
  }

  buscarPorCompraId(compraId) {
    return Array.from(this.resenias.values()).find((resenia) => resenia.compraId === compraId);
  }

  buscarPorEventoId(eventoId) {
    return Array.from(this.resenias.values()).filter((resenia) => resenia.eventoId === eventoId);
  }

  listar() {
    return Array.from(this.resenias.values());
  }
}

module.exports = ReseniaRepository;
