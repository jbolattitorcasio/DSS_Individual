class CategoriaRepository {
  constructor(categoriasIniciales = []) {
    this.categorias = new Map(categoriasIniciales.map((categoria) => [categoria.id, categoria]));
    this.proximoId = this.#calcularProximoId();
  }

  listar() {
    return Array.from(this.categorias.values());
  }

  buscarPorId(id) {
    return this.categorias.get(id);
  }

  guardar(categoria) {
    if (this.categorias.has(categoria.id)) {
      throw new Error(`ya existe una categoría con id ${categoria.id}`);
    }

    this.categorias.set(categoria.id, categoria);
    this.proximoId = Math.max(this.proximoId, categoria.id + 1);
    return categoria;
  }

  generarId() {
    const id = this.proximoId;
    this.proximoId += 1;
    return id;
  }

  #calcularProximoId() {
    return Math.max(0, ...this.categorias.keys()) + 1;
  }
}

module.exports = CategoriaRepository;
