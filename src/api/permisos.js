import { obtenerUsuario } from './auth'

// Una sola fuente de verdad para "qué rol ve qué pantalla".
// Si cambia un permiso, se cambia aquí (el backend valida lo mismo en sus @Roles).
export const PANTALLAS = {
  '/': { roles: ['administrador', 'cajero'] },
  '/tipos-de-cambio': { roles: ['administrador', 'cajero'] },
  '/caja': { roles: ['administrador', 'cajero'] },
  '/operaciones': { roles: ['administrador', 'cajero'] },
  '/estadisticas': { roles: ['administrador', 'cajero'] },
  '/configuracion': { roles: ['administrador'] },
}

export const rolActual = () => obtenerUsuario()?.rol ?? null

export const puedeVer = (ruta, rol = rolActual()) => PANTALLAS[ruta]?.roles.includes(rol) ?? false

/** Primera pantalla a la que el rol puede entrar (su "inicio"). */
export const rutaInicio = (rol = rolActual()) =>
  Object.keys(PANTALLAS).find((ruta) => puedeVer(ruta, rol)) ?? '/login'
