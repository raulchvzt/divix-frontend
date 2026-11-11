import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import { obtenerReferenciaMercado } from '../../api/divisas'
import { useCarga } from '../../api/useCarga'

/**
 * Aviso al empezar el día: si el mercado se movió mucho desde que el dueño
 * actualizó sus precios (o si alguna divisa quedó en pérdida), lo dice aquí.
 * Se puede cerrar y no vuelve a salir hasta el día siguiente.
 */

const CLAVE = 'divix_aviso_mercado'
const hoy = () => new Date().toLocaleDateString('en-CA')

function cerradoHoy() {
  try {
    return localStorage.getItem(CLAVE) === hoy()
  } catch {
    return false
  }
}

export default function AvisoMercado({ esAdministrador }) {
  const { datos } = useCarga(obtenerReferenciaMercado)
  const [cerrado, setCerrado] = useState(cerradoHoy)

  const pendientes = Object.values(datos ?? {}).filter((d) => d.estado !== 'ok')
  if (cerrado || pendientes.length === 0) return null

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, hoy())
    } catch {
      // sin almacenamiento solo se cierra por ahora
    }
    setCerrado(true)
  }

  const detalle = pendientes
    .map((d) =>
      d.estado === 'perdida'
        ? `${d.codigo}: ${d.ventaVsMercadoPct < 0 ? 'vendes abajo' : 'compras arriba'} del mercado`
        : `${d.codigo} ${d.movimientoPct >= 0 ? 'subió' : 'bajó'} ${Math.abs(d.movimientoPct).toFixed(1)}%`,
    )
    .join(' · ')

  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
        <AlertTriangle size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-amber-900">El mercado se movió desde la última actualización de precios</p>
        <p className="text-sm text-amber-800 mt-0.5">
          {detalle}.{' '}
          {esAdministrador ? 'Te conviene revisar tus tipos de cambio.' : 'Avísale al administrador para que revise los precios.'}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {esAdministrador && (
          <Link
            to="/tipos-de-cambio"
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Revisar precios
            <ArrowRight size={16} />
          </Link>
        )}
        <button
          onClick={cerrar}
          aria-label="Cerrar aviso por hoy"
          title="Cerrar por hoy"
          className="w-9 h-9 rounded-lg text-amber-700 hover:bg-amber-100 flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
