import { apiFetch } from './apiClient';
import { obtenerEvento } from './eventosApi';

export function crearCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
  return apiFetch('/compras', {
    method: 'POST',
    body: JSON.stringify({ compradorId, eventoId, tipoEntradaId, cantidad }),
  });
}

export function obtenerCompra(id) {
  return apiFetch(`/compras/${id}`);
}

export function confirmarCompra(id) {
  return apiFetch(`/compras/${id}/confirmar`, { method: 'PATCH' });
}

export function cancelarCompra(id) {
  return apiFetch(`/compras/${id}/cancelar`, { method: 'PATCH' });
}

export async function obtenerDetalleCompra(id) {
  const compra = await obtenerCompra(id);
  const evento = await obtenerEvento(compra.eventoId);
  const tipoEntrada = evento.tiposEntrada.find((tipo) => tipo.id === compra.tipoEntradaId);
  return { ...compra, evento, tipoEntrada };
}

export async function obtenerComprasPorComprador(compradorId) {
  const compras = await apiFetch(`/compras?compradorId=${encodeURIComponent(compradorId)}`);
  const eventosPorId = new Map();

  return Promise.all(compras.map(async (compra) => {
    if (!eventosPorId.has(compra.eventoId)) {
      eventosPorId.set(compra.eventoId, obtenerEvento(compra.eventoId));
    }
    const evento = await eventosPorId.get(compra.eventoId);
    return {
      ...compra,
      evento,
      tipoEntrada: evento.tiposEntrada.find((tipo) => tipo.id === compra.tipoEntradaId),
    };
  }));
}
