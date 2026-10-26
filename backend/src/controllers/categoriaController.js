function crearCategoriaController(categoriaService) {
  return {
    listar(req, res, next) {
      try {
        res.json(categoriaService.listar());
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearCategoriaController;
