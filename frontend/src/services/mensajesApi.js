import { apiFetch } from './apiClient';

export function obtenerMensajes(compraId, usuarioId) {
  return apiFetch(`/compras/${compraId}/mensajes?usuarioId=${encodeURIComponent(usuarioId)}`);
}

export function enviarMensaje(compraId, autorId, contenido) {
  return apiFetch(`/compras/${compraId}/mensajes`, {
    method: 'POST',
    body: JSON.stringify({ autorId, contenido }),
  });
}
