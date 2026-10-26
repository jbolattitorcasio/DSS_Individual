const express = require('express');

function crearOrganizadorRoutes(reseniaController) {
  const router = express.Router();
  router.get('/:id/resenias', reseniaController.listarPorOrganizador);
  return router;
}

module.exports = crearOrganizadorRoutes;
