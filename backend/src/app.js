const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const UsuarioRepository = require('./repositories/UsuarioRepository');
const CategoriaRepository = require('./repositories/CategoriaRepository');
const EventoRepository = require('./repositories/EventoRepository');
const CompraRepository = require('./repositories/CompraRepository');
const MensajeRepository = require('./repositories/MensajeRepository');
const ReseniaRepository = require('./repositories/ReseniaRepository');
const { crearUsuariosIniciales, crearCategoriasIniciales } = require('./repositories/datosIniciales');
const EventoService = require('./services/EventoService');
const CategoriaService = require('./services/CategoriaService');
const CompraService = require('./services/CompraService');
const MensajeService = require('./services/MensajeService');
const ReseniaService = require('./services/ReseniaService');
const crearEventoController = require('./controllers/eventoController');
const crearCategoriaController = require('./controllers/categoriaController');
const crearCompraController = require('./controllers/compraController');
const crearMensajeController = require('./controllers/mensajeController');
const crearReseniaController = require('./controllers/reseniaController');
const crearEventoRoutes = require('./routes/eventoRoutes');
const crearCategoriaRoutes = require('./routes/categoriaRoutes');
const crearCompraRoutes = require('./routes/compraRoutes');
const crearOrganizadorRoutes = require('./routes/organizadorRoutes');
const {
  ErrorDeValidacion,
  RecursoNoEncontradoError,
  AccesoDenegadoError,
} = require('./services/errores');

function crearDependenciasPredeterminadas() {
  return {
    usuarioRepository: new UsuarioRepository(crearUsuariosIniciales()),
    categoriaRepository: new CategoriaRepository(crearCategoriasIniciales()),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    mensajeRepository: new MensajeRepository(),
    reseniaRepository: new ReseniaRepository(),
  };
}

function createApp(dependencias = crearDependenciasPredeterminadas()) {
  const app = express();
  const eventoService = new EventoService(dependencias);
  const categoriaService = new CategoriaService(dependencias.categoriaRepository);
  const compraService = new CompraService(dependencias);
  const mensajeService = new MensajeService(dependencias);
  const reseniaService = new ReseniaService(dependencias);
  const compraController = crearCompraController(compraService);
  const mensajeController = crearMensajeController(mensajeService);
  const reseniaController = crearReseniaController(reseniaService);

  app.use(express.json());
  app.use('/health', healthRoutes);
  app.use('/eventos', crearEventoRoutes(
    crearEventoController(eventoService),
    compraController,
    reseniaController,
  ));
  app.use('/categorias', crearCategoriaRoutes(crearCategoriaController(categoriaService)));
  app.use('/compras', crearCompraRoutes(compraController, mensajeController, reseniaController));
  app.use('/organizadores', crearOrganizadorRoutes(reseniaController));

  app.use((error, req, res, next) => {
    if (error instanceof AccesoDenegadoError) {
      return res.status(403).json({ error: error.message });
    }
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
