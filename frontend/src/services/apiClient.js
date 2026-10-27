const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const TIEMPO_LIMITE_MS = 10000;

export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new ApiError(
      'Falta configurar EXPO_PUBLIC_API_URL. Revisá el archivo .env del frontend.',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIEMPO_LIMITE_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new ApiError(body?.error || `La API respondió con estado ${response.status}.`, {
        status: response.status,
      });
    }
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError('La API tardó demasiado en responder.', { cause: error });
    }
    throw new ApiError(
      'No se pudo conectar con la API. Verificá la URL, la red y que el backend esté iniciado.',
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}
