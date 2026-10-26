const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const UsuarioRepository = require('./repositories/UsuarioRepository');
const CategoriaRepository = require('./repositories/CategoriaRepository');
const EventoRepository = require('./repositories/EventoRepository');
const { crearUsuariosIniciales, crearCategoriasIniciales } = require('./repositories/datosIniciales');
const EventoService = require('./services/EventoService');
const CategoriaService = require('./services/CategoriaService');
const crearEventoController = require('./controllers/eventoController');
const crearCategoriaController = require('./controllers/categoriaController');
const crearEventoRoutes = require('./routes/eventoRoutes');
const crearCategoriaRoutes = require('./routes/categoriaRoutes');
const { ErrorDeValidacion, RecursoNoEncontradoError } = require('./services/errores');

function crearDependenciasPredeterminadas() {
  return {
    usuarioRepository: new UsuarioRepository(crearUsuariosIniciales()),
    categoriaRepository: new CategoriaRepository(crearCategoriasIniciales()),
    eventoRepository: new EventoRepository(),
  };
}

function createApp(dependencias = crearDependenciasPredeterminadas()) {
  const app = express();
  const eventoService = new EventoService(dependencias);
  const categoriaService = new CategoriaService(dependencias.categoriaRepository);

  app.use(express.json());
  app.use('/health', healthRoutes);
  app.use('/eventos', crearEventoRoutes(crearEventoController(eventoService)));
  app.use('/categorias', crearCategoriaRoutes(crearCategoriaController(categoriaService)));

  app.use((error, req, res, next) => {
    if (error instanceof RecursoNoEncontradoError) {
      return res.status(404).json({ error: error.message });
    }

    if (
      error instanceof ErrorDeValidacion
      || error instanceof TypeError
      || error instanceof RangeError
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'error interno del servidor' });
  });

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
