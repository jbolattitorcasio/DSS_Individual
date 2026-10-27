const dosDigitos = (valor) => String(valor).padStart(2, '0');

export function formatearFecha(fecha) {
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

export function formatearHora(fecha) {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

// Construir con componentes locales; interpretar DD/MM/AAAA como texto sería ambiguo.
export function combinarFechaHora(fecha, hora) {
  if (!fecha || !hora) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hora.getHours(), hora.getMinutes(), 0, 0);
}

export function esFechaFutura(fecha, ahora = new Date()) {
  return fecha instanceof Date && Number.isFinite(fecha.getTime()) && fecha.getTime() > ahora.getTime();
}
