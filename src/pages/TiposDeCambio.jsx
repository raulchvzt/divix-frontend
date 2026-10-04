import { useState } from 'react'
import { divisas as divisasIniciales } from '../data/divisas'
import TarjetaDivisa from '../components/tipos-de-cambio/TarjetaDivisa'

export default function TiposDeCambio() {
  const [divisas, setDivisas] = useState(divisasIniciales)

  const actualizar = (codigo, precios) => {
    setDivisas((lista) => lista.map((d) => (d.codigo === codigo ? { ...d, ...precios } : d)))
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
      <div className="grid grid-cols-3 gap-5">
        {divisas.map((d) => (
          <TarjetaDivisa key={d.codigo} divisa={d} onGuardar={actualizar} />
        ))}
      </div>
    </div>
  )
}