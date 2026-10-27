import { apiFetch } from './apiClient';

export function crearResenia(compraId, compradorId, puntaje, comentario) {
  return apiFetch(`/compras/${compraId}/resenia`, {
    method: 'POST',
    body: JSON.stringify({ compradorId, puntaje, comentario }),
  });
}

export function obtenerReseniasEvento(eventoId) {
  return apiFetch(`/eventos/${eventoId}/resenias`);
}
