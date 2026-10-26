const express = require('express');

function crearEventoRoutes(eventoController) {
  const router = express.Router();

  router.get('/', eventoController.listar);
  router.get('/:id', eventoController.buscarPorId);
  router.post('/', eventoController.crear);

  return router;
}

module.exports = crearEventoRoutes;
