const express = require('express');

function crearUsuarioRoutes(usuarioController) {
  const router = express.Router();
  router.get('/', usuarioController.listar);
  router.get('/:id', usuarioController.buscarPorId);
  return router;
}

module.exports = crearUsuarioRoutes;
