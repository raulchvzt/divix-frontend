import { api, guardarToken, guardarRefresco, borrarToken } from './client'

const CLAVE_USUARIO = 'divix_usuario'

/** Usuario guardado al iniciar sesión: { id, nombre, rol } o null. */
export function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO))
  } catch {
    return null
  }
}

/**
 * Inicia sesión, guarda el token y el usuario, y lo devuelve:
 * { id, nombre, rol } donde rol es "administrador" o "cajero".
 */
export async function iniciarSesion(usuario, contrasena) {
  const respuesta = await api('/auth/login', {
    method: 'POST',
    body: { usuario, contrasena },
    auth: false,
  })
  guardarToken(respuesta.accessToken)
  if (respuesta.refreshToken) guardarRefresco(respuesta.refreshToken)
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
  return respuesta.usuario
}

export function cerrarSesion() {
  borrarToken()
  localStorage.removeItem(CLAVE_USUARIO)
}
