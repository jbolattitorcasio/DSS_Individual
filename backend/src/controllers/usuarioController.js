function crearUsuarioController(usuarioService) {
  return {
    listar(req, res, next) {
      try {
        res.json(usuarioService.listar());
      } catch (error) {
        next(error);
      }
    },
    buscarPorId(req, res, next) {
      try {
        res.json(usuarioService.buscarPorId(req.params.id));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearUsuarioController;
