function crearReseniaController(reseniaService) {
  return {
    crear(req, res, next) {
      try {
        res.status(201).json(reseniaService.crear(req.params.id, req.body));
      } catch (error) {
        next(error);
      }
    },
    listarPorEvento(req, res, next) {
      try {
        res.json(reseniaService.listarPorEvento(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    listarPorOrganizador(req, res, next) {
      try {
        res.json(reseniaService.listarPorOrganizador(req.params.id));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearReseniaController;
