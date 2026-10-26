const express = require('express');

function crearCompraRoutes(compraController, mensajeController, reseniaController) {
  const router = express.Router();
  router.get('/', compraController.listarPorComprador);
  router.post('/', compraController.crear);
  router.get('/:id/mensajes', mensajeController.listar);
  router.post('/:id/mensajes', mensajeController.crear);
  router.post('/:id/resenia', reseniaController.crear);
  router.get('/:id', compraController.buscarPorId);
  router.patch('/:id/confirmar', compraController.confirmar);
  router.patch('/:id/utilizar', compraController.utilizar);
  router.patch('/:id/cancelar', compraController.cancelar);
  return router;
}

module.exports = crearCompraRoutes;
