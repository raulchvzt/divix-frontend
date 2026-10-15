// URL del backend. Viene del archivo .env del frontend (variable VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const CLAVE_TOKEN = 'divix_token';

export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
export const obtenerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN);

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Uso:
 *   const clientes = await api('/clientes');
 *   await api('/clientes', { method: 'POST', body: { nombre: 'Luis', ... } });
 *
 * Opciones: { method, body, auth }. auth en false solo para el login.
 */
export async function api(ruta, { method = 'GET', body, auth = true } = {}) {
  const token = obtenerToken();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Sesión vencida o token inválido: se limpia y se manda al login.
    if (respuesta.status === 401 && auth) {
      borrarToken();
      localStorage.removeItem('divix_usuario');
      window.location.assign('/login');
    }
    // Nest devuelve "message" como texto o como lista (errores de validación)
    const mensaje = Array.isArray(datos?.message)
      ? datos.message.join(', ')
      : (datos?.message ?? 'No se pudo conectar con el servidor');
    throw new ApiError(respuesta.status, mensaje);
  }

  return datos;
}
