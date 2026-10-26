const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const UsuarioRepository = require('./repositories/UsuarioRepository');
const CategoriaRepository = require('./repositories/CategoriaRepository');
const EventoRepository = require('./repositories/EventoRepository');
const CompraRepository = require('./repositories/CompraRepository');
const MensajeRepository = require('./repositories/MensajeRepository');
const ReseniaRepository = require('./repositories/ReseniaRepository');
const { crearUsuariosIniciales, crearCategoriasIniciales } = require('./repositories/datosIniciales');
const { crearDatosDemo } = require('./repositories/datosDemo');
const EventoService = require('./services/EventoService');
const CategoriaService = require('./services/CategoriaService');
const UsuarioService = require('./services/UsuarioService');
const CompraService = require('./services/CompraService');
const MensajeService = require('./services/MensajeService');
const ReseniaService = require('./services/ReseniaService');
const crearEventoController = require('./controllers/eventoController');
const crearCategoriaController = require('./controllers/categoriaController');
const crearUsuarioController = require('./controllers/usuarioController');
const crearCompraController = require('./controllers/compraController');
const crearMensajeController = require('./controllers/mensajeController');
const crearReseniaController = require('./controllers/reseniaController');
const crearEventoRoutes = require('./routes/eventoRoutes');
const crearCategoriaRoutes = require('./routes/categoriaRoutes');
const crearUsuarioRoutes = require('./routes/usuarioRoutes');
const crearCompraRoutes = require('./routes/compraRoutes');
const crearOrganizadorRoutes = require('./routes/organizadorRoutes');
const {
  ErrorDeValidacion,
  RecursoNoEncontradoError,
  AccesoDenegadoError,
  ConflictoError,
} = require('./services/errores');

function crearDependenciasPredeterminadas({
  demoData = process.env.DEMO_DATA === 'true',
  fechaBase = new Date(),
} = {}) {
  if (demoData) {
    const datos = crearDatosDemo(fechaBase);
    return {
      usuarioRepository: new UsuarioRepository(datos.usuarios),
      categoriaRepository: new CategoriaRepository(datos.categorias),
      eventoRepository: new EventoRepository(datos.eventos),
      compraRepository: new CompraRepository(datos.compras),
      mensajeRepository: new MensajeRepository(datos.mensajes),
      reseniaRepository: new ReseniaRepository(datos.resenias),
    };
  }

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
  const usuarioService = new UsuarioService(dependencias.usuarioRepository);
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
  app.use('/usuarios', crearUsuarioRoutes(crearUsuarioController(usuarioService)));
  app.use('/compras', crearCompraRoutes(compraController, mensajeController, reseniaController));
  app.use('/organizadores', crearOrganizadorRoutes(reseniaController));

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'JSON malformado' });
    }
    if (error instanceof AccesoDenegadoError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof ConflictoError) {
      return res.status(409).json({ error: error.message });
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

  app.use((req, res) => {
    res.status(404).json({ error: 'ruta no encontrada' });
  });

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
module.exports.crearDependenciasPredeterminadas = crearDependenciasPredeterminadas;
