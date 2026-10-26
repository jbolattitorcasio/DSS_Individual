const EstadoCompra = Object.freeze({
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',
  CONFIRMADA: 'CONFIRMADA',
  UTILIZADA: 'UTILIZADA',
  CANCELADA: 'CANCELADA',
  REEMBOLSADA: 'REEMBOLSADA',
});

const ESTADOS_COMPRA = new Set(Object.values(EstadoCompra));

function esEstadoCompra(estado) {
  return ESTADOS_COMPRA.has(estado);
}

module.exports = { EstadoCompra, esEstadoCompra };
