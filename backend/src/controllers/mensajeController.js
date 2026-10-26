function crearMensajeController(mensajeService) {
  return {
    listar(req, res, next) {
      try {
        res.json(mensajeService.listar(req.params.id, req.query.usuarioId));
      } catch (error) {
        next(error);
      }
    },
    crear(req, res, next) {
      try {
        res.status(201).json(mensajeService.crear(req.params.id, req.body));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearMensajeController;
