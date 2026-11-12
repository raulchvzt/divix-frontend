// URL del backend. Viene del archivo .env del frontend (variable VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const CLAVE_TOKEN = 'divix_token';
const CLAVE_REFRESCO = 'divix_refresh';

export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
export const obtenerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const guardarRefresco = (token) => localStorage.setItem(CLAVE_REFRESCO, token);
export const borrarToken = () => {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_REFRESCO);
};

// Renueva el token de acceso con el de renovación (dura días). Si varias peticiones
// fallan a la vez por token vencido, comparten una sola renovación.
let renovando = null
function renovarSesion() {
  const refresco = localStorage.getItem(CLAVE_REFRESCO)
  if (!refresco) return Promise.resolve(false)
  renovando ??= fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresco }),
  })
    .then(async (r) => {
      if (!r.ok) return false
      const datos = await r.json()
      guardarToken(datos.accessToken)
      if (datos.refreshToken) guardarRefresco(datos.refreshToken)
      return true
    })
    .catch(() => false)
    .finally(() => {
      renovando = null
    })
  return renovando
}

function cerrarPorVencimiento() {
  borrarToken()
  localStorage.removeItem('divix_usuario')
  window.location.assign('/login')
}

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
  const pedir = () =>
    fetch(`${API_URL}${ruta}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && obtenerToken() ? { Authorization: `Bearer ${obtenerToken()}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let respuesta = await pedir();

  // Token de acceso vencido: se renueva en silencio y se reintenta una vez.
  if (respuesta.status === 401 && auth && (await renovarSesion())) {
    respuesta = await pedir();
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Sin forma de renovar la sesión (renovación vencida o inválida): al login.
    if (respuesta.status === 401 && auth) cerrarPorVencimiento()
    // Nest devuelve "message" como texto o como lista (errores de validación)
    const mensaje = Array.isArray(datos?.message)
      ? datos.message.join(', ')
      : (datos?.message ?? 'No se pudo conectar con el servidor');
    throw new ApiError(respuesta.status, mensaje);
  }

  return datos;
}
