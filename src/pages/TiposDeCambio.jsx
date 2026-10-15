import { useState } from 'react'
import { obtenerDivisas, guardarTipoCambio } from '../api/divisas'
import { obtenerUsuario } from '../api/auth'
import { useCarga } from '../api/useCarga'
import TarjetaDivisa from '../components/tipos-de-cambio/TarjetaDivisa'

export default function TiposDeCambio() {
  const [version, setVersion] = useState(0)
  const { datos: divisas, error, cargando } = useCarga(() => obtenerDivisas({ incluirSinTasa: true }), [version])
  const puedeEditar = obtenerUsuario()?.rol === 'administrador'

  const actualizar = async (divisa, { compra, venta }) => {
    await guardarTipoCambio(divisa.id, compra, venta)
    setVersion((v) => v + 1)
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Operación / <span className="text-brand-600 font-medium">Tipos de cambio</span>
        </p>
        <h1 className="text-[32px] font-bold tracking-tight mt-2">Tipos de cambio</h1>
        <p className="text-sm text-slate-500 mt-1">
          Administra los precios de compra y venta de cada divisa.
        </p>
      </div>

      {/* Tarjetas */}
      {cargando && <p className="text-sm text-slate-400">Cargando tipos de cambio…</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {divisas && divisas.length === 0 && (
        <p className="text-sm text-slate-400">Aún no hay divisas con tipo de cambio registrado.</p>
      )}
      <div className="grid grid-cols-3 gap-5">
        {divisas?.map((d) => (
          <TarjetaDivisa key={d.codigo} divisa={d} onGuardar={actualizar} puedeEditar={puedeEditar} />
        ))}
      </div>
    </div>
  )
}