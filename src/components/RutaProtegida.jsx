import { Navigate } from 'react-router-dom'
import { obtenerToken } from '../api/client'
import { puedeVer, rutaInicio } from '../api/permisos'

/**
 * Sin `ruta`: solo exige sesión.
 * Con `ruta`: además exige que el rol actual tenga permiso; si no, lo manda a su inicio.
 */
export default function RutaProtegida({ children, ruta }) {
  if (!obtenerToken()) return <Navigate to="/login" replace />
  if (ruta && !puedeVer(ruta)) return <Navigate to={rutaInicio()} replace />
  return children
}
