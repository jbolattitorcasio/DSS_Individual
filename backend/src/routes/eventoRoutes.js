const express = require('express');

function crearEventoRoutes(eventoController, compraController, reseniaController) {
  const router = express.Router();

  router.get('/', eventoController.listar);
  router.get('/:id/compras', compraController.listarPorEvento);
  router.get('/:id/resenias', reseniaController.listarPorEvento);
  router.get('/:id', eventoController.buscarPorId);
  router.post('/', eventoController.crear);

  return router;
}

module.exports = crearEventoRoutes;
