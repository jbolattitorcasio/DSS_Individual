const express = require('express');

function crearCategoriaRoutes(categoriaController) {
  const router = express.Router();
  router.get('/', categoriaController.listar);
  return router;
}

module.exports = crearCategoriaRoutes;
