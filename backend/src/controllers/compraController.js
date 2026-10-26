function crearCompraController(compraService) {
  return {
    crear(req, res, next) {
      try {
        res.status(201).json(compraService.crear(req.body));
      } catch (error) {
        next(error);
      }
    },
    buscarPorId(req, res, next) {
      try {
        res.json(compraService.buscarPorId(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    listarPorComprador(req, res, next) {
      try {
        res.json(compraService.listarPorComprador(req.query.compradorId));
      } catch (error) {
        next(error);
      }
    },
    listarPorEvento(req, res, next) {
      try {
        res.json(compraService.listarPorEvento(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    confirmar(req, res, next) {
      try {
        res.json(compraService.confirmar(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    utilizar(req, res, next) {
      try {
        res.json(compraService.utilizar(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    cancelar(req, res, next) {
      try {
        res.json(compraService.cancelar(req.params.id));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearCompraController;
