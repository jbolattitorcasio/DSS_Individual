class CategoriaService {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  listar() {
    return this.categoriaRepository.listar();
  }
}

module.exports = CategoriaService;
