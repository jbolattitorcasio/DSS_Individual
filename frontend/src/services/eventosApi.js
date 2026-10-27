import { apiFetch } from './apiClient';

function crearQuery(parametros) {
  const query = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`)
    .join('&');
  return query ? `?${query}` : '';
}

export function obtenerCategorias() {
  return apiFetch('/categorias');
}

export function obtenerEvento(id) {
  return apiFetch(`/eventos/${id}`);
}

export async function obtenerEventos(filtros = {}) {
  const eventos = await apiFetch(`/eventos${crearQuery(filtros)}`);
  return Promise.all(eventos.map(async (evento) => {
    try {
      return await obtenerEvento(evento.id);
    } catch {
      return evento;
    }
  }));
}
