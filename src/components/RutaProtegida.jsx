import { Navigate } from 'react-router-dom'
import { obtenerToken } from '../api/client'

export default function RutaProtegida({ children }) {
  return obtenerToken() ? children : <Navigate to="/login" replace />
}
