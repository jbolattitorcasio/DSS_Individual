import { apiFetch } from './apiClient';

export function obtenerUsuarios() {
  return apiFetch('/usuarios');
}
