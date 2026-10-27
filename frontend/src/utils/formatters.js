export function formatearFecha(fecha) {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(valor);
}

export function formatearPrecio(precio) {
  if (!Number.isFinite(precio)) return 'Precio no disponible';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);
}

export function obtenerPrecioMinimoDisponible(tiposEntrada = []) {
  const precios = tiposEntrada
    .filter((tipo) => tipo.cupoDisponible === undefined || tipo.cupoDisponible > 0)
    .map((tipo) => tipo.precio)
    .filter(Number.isFinite);
  return precios.length > 0 ? Math.min(...precios) : null;
}
