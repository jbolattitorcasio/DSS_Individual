function crearEventoController(eventoService) {
  return {
    listar(req, res, next) {
      try {
        res.json(eventoService.listar(req.query));
      } catch (error) {
        next(error);
      }
    },

    buscarPorId(req, res, next) {
      try {
        res.json(eventoService.buscarPorId(req.params.id));
      } catch (error) {
        next(error);
      }
    },

    crear(req, res, next) {
      try {
        res.status(201).json(eventoService.crear(req.body));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearEventoController;
