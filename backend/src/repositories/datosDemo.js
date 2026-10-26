const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Evento = require('../models/Evento');
const TipoEntrada = require('../models/TipoEntrada');
const Compra = require('../models/Compra');
const Mensaje = require('../models/Mensaje');
const Resenia = require('../models/Resenia');
const { EstadoCompra } = require('../models/EstadoCompra');

const DIA = 24 * 60 * 60 * 1000;

function desplazar(fechaBase, dias, horas = 0) {
  return new Date(fechaBase.getTime() + dias * DIA + horas * 60 * 60 * 1000);
}

function crearEvento(datos, tiposEntrada, historico = false) {
  const evento = historico ? Evento.rehidratar(datos) : new Evento(datos);
  tiposEntrada.forEach((tipoEntrada) => evento.agregarTipoEntrada(tipoEntrada));
  return evento;
}

function crearCompraConHistorial(datos, transiciones) {
  const compra = new Compra(datos);
  transiciones.forEach(({ estado, fecha }) => compra.cambiarEstado(estado, fecha));
  return compra;
}

function crearDatosDemo(fechaBase = new Date()) {
  const ahora = new Date(fechaBase.getTime());
  const usuarios = [
    new Usuario({ id: 1, nombre: 'Ana Organizadora', email: 'ana@aiticketit.com' }),
    new Usuario({ id: 2, nombre: 'Bruno Productor', email: 'bruno@aiticketit.com' }),
    new Usuario({ id: 3, nombre: 'Carla Compradora', email: 'carla@aiticketit.com' }),
    new Usuario({ id: 4, nombre: 'Diego Comprador', email: 'diego@aiticketit.com' }),
  ];
  const categorias = [
    new Categoria({ id: 1, nombre: 'Música' }),
    new Categoria({ id: 2, nombre: 'Teatro' }),
    new Categoria({ id: 3, nombre: 'Deportes' }),
    new Categoria({ id: 4, nombre: 'Conferencias' }),
  ];

  const eventoHistorico = crearEvento({
    id: 1,
    nombre: 'Jazz del Río 2026',
    descripcion: 'Edición histórica del festival de jazz.',
    fecha: desplazar(ahora, -30),
    ubicacion: 'Anfiteatro Municipal',
    organizadorId: 1,
    categoriaId: 1,
    imagenUrl: 'https://images.example.com/jazz-historico.jpg',
  }, [
    new TipoEntrada({ id: 1, eventoId: 1, nombre: 'General', precio: 8000, cupo: 100 }),
    new TipoEntrada({ id: 2, eventoId: 1, nombre: 'VIP', precio: 15000, cupo: 20 }),
  ], true);
  const eventoProximo = crearEvento({
    id: 2,
    nombre: 'Festival de Primavera',
    descripcion: 'Música al aire libre con artistas nacionales.',
    fecha: desplazar(ahora, 7),
    ubicacion: 'Parque Central',
    organizadorId: 1,
    categoriaId: 1,
    imagenUrl: 'https://images.example.com/primavera.jpg',
  }, [
    new TipoEntrada({ id: 3, eventoId: 2, nombre: 'General', precio: 12000, cupo: 50 }),
    new TipoEntrada({ id: 4, eventoId: 2, nombre: 'VIP', precio: 25000, cupo: 10 }),
  ]);
  const eventoSinReputacion = crearEvento({
    id: 3,
    nombre: 'Noche de Teatro Independiente',
    descripcion: 'Selección de obras breves contemporáneas.',
    fecha: desplazar(ahora, 21),
    ubicacion: 'Teatro del Centro',
    organizadorId: 2,
    categoriaId: 2,
    imagenUrl: 'https://images.example.com/teatro.jpg',
  }, [
    new TipoEntrada({ id: 5, eventoId: 3, nombre: 'Platea', precio: 10000, cupo: 40 }),
  ]);
  const eventos = [eventoHistorico, eventoProximo, eventoSinReputacion];

  const compras = [
    crearCompraConHistorial({
      id: 1, compradorId: 3, eventoId: 1, tipoEntradaId: 1,
      cantidad: 2, precioUnitario: 8000, fechaCompra: desplazar(ahora, -45),
    }, [
      { estado: EstadoCompra.CONFIRMADA, fecha: desplazar(ahora, -44) },
      { estado: EstadoCompra.UTILIZADA, fecha: desplazar(ahora, -30, 3) },
    ]),
    crearCompraConHistorial({
      id: 2, compradorId: 4, eventoId: 1, tipoEntradaId: 2,
      cantidad: 1, precioUnitario: 15000, fechaCompra: desplazar(ahora, -40),
    }, [
      { estado: EstadoCompra.CONFIRMADA, fecha: desplazar(ahora, -39) },
      { estado: EstadoCompra.UTILIZADA, fecha: desplazar(ahora, -30, 3) },
    ]),
    crearCompraConHistorial({
      id: 3, compradorId: 3, eventoId: 2, tipoEntradaId: 3,
      cantidad: 2, precioUnitario: 12000, fechaCompra: desplazar(ahora, -2),
    }, []),
    crearCompraConHistorial({
      id: 4, compradorId: 4, eventoId: 2, tipoEntradaId: 4,
      cantidad: 1, precioUnitario: 25000, fechaCompra: desplazar(ahora, -3),
    }, [{ estado: EstadoCompra.CONFIRMADA, fecha: desplazar(ahora, -2) }]),
    crearCompraConHistorial({
      id: 5, compradorId: 3, eventoId: 2, tipoEntradaId: 3,
      cantidad: 1, precioUnitario: 12000, fechaCompra: desplazar(ahora, -5),
    }, [{ estado: EstadoCompra.CANCELADA, fecha: desplazar(ahora, -4) }]),
    crearCompraConHistorial({
      id: 6, compradorId: 4, eventoId: 2, tipoEntradaId: 3,
      cantidad: 1, precioUnitario: 12000, fechaCompra: desplazar(ahora, -6),
    }, [
      { estado: EstadoCompra.CONFIRMADA, fecha: desplazar(ahora, -5) },
      { estado: EstadoCompra.CANCELADA, fecha: desplazar(ahora, -4) },
      { estado: EstadoCompra.REEMBOLSADA, fecha: desplazar(ahora, -4, 1) },
    ]),
  ];

  const mensajes = [
    new Mensaje({
      id: 1, compraId: 3, autorId: 3,
      contenido: '¿Se puede ingresar con comida?', fechaEnvio: desplazar(ahora, -1, -2),
    }),
    new Mensaje({
      id: 2, compraId: 3, autorId: 1,
      contenido: 'Sí, siempre que no sea en envases de vidrio.', fechaEnvio: desplazar(ahora, -1, -1),
    }),
  ];
  const resenias = [
    new Resenia({
      id: 1, compraId: 1, eventoId: 1, compradorId: 3,
      puntaje: 5, comentario: 'Excelente organización y sonido.', fecha: desplazar(ahora, -29),
    }),
    new Resenia({
      id: 2, compraId: 2, eventoId: 1, compradorId: 4,
      puntaje: 3, comentario: 'Buen evento, aunque hubo demora en el ingreso.', fecha: desplazar(ahora, -29),
    }),
  ];

  return { usuarios, categorias, eventos, compras, mensajes, resenias };
}

module.exports = { crearDatosDemo };
