import { useState } from 'react'
import { Pencil, Check, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { dinero } from '../../utils/formato'
import InputNumero from '../InputNumero'
import Bandera from '../Bandera'
import ReferenciaMercado from './ReferenciaMercado'

const inputPrecio =
  'w-full bg-white border border-line rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

export default function TarjetaDivisa({ divisa, onGuardar, puedeEditar = false, mercado }) {
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [compra, setCompra] = useState(divisa.compra == null ? '' : String(divisa.compra))
  const [venta, setVenta] = useState(divisa.venta == null ? '' : String(divisa.venta))

  const sinTasa = divisa.compra == null
  const margen = sinTasa ? 0 : divisa.venta - divisa.compra
  const porcentaje = sinTasa ? 0 : (margen / divisa.compra) * 100

  const cancelar = () => {
    setCompra(sinTasa ? '' : String(divisa.compra))
    setVenta(sinTasa ? '' : String(divisa.venta))
    setError('')
    setEditando(false)
  }

  // Carga la sugerencia en los campos; el dueño la revisa y decide si guarda.
  const usarSugerencia = ({ compra: c, venta: v }) => {
    setCompra(String(Number(c)))
    setVenta(String(Number(v)))
    setError('')
    setEditando(true)
  }

  const guardar = async () => {
    const c = parseFloat(compra)
    const v = parseFloat(venta)
    if (!c || !v || c <= 0 || v <= 0) return setError('Escribe precios válidos')
    if (v < c) return setError('El precio de venta no puede ser menor al de compra')
    setError('')
    setGuardando(true)
    try {
      await onGuardar(divisa, { compra, venta })
      setEditando(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bandera codigo={divisa.codigo} tamano="lg" />
          <div>
            <p className="font-bold">{divisa.nombre}</p>
            <p className="flex items-center gap-2 text-xs font-semibold mt-0.5">
              <span className="text-slate-400">{divisa.codigo}</span>
              <span className="inline-flex items-center gap-1.5 text-brand-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Activa
              </span>
            </p>
          </div>
        </div>

        {puedeEditar && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 border border-line rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Pencil size={16} />
            {sinTasa ? 'Asignar precio' : 'Editar'}
          </button>
        )}
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
            <ArrowDownLeft size={16} />
            Compra
          </p>
          {editando ? (
            <InputNumero decimales={4} value={compra} onChange={(e) => setCompra(e.target.value)} className={inputPrecio} />
          ) : (
            <p className="text-[28px] font-bold tracking-tight">{sinTasa ? '—' : dinero(divisa.compra)}</p>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 mb-2">
            <ArrowUpRight size={16} />
            Venta
          </p>
          {editando ? (
            <InputNumero decimales={4} value={venta} onChange={(e) => setVenta(e.target.value)} className={inputPrecio} />
          ) : (
            <p className="text-[28px] font-bold tracking-tight">{sinTasa ? '—' : dinero(divisa.venta)}</p>
          )}
        </div>
      </div>

      {/* Margen */}
      <div className="flex items-center justify-between bg-brand-50 rounded-xl px-4 py-3">
        <span className="text-xs font-semibold text-brand-700">Margen por unidad</span>
        <span className="text-sm font-bold text-brand-700">
          {sinTasa ? 'Sin tipo de cambio' : `${dinero(margen)} MXN · ${porcentaje.toFixed(2)}%`}
        </span>
      </div>

      {/* Referencia del mercado */}
      {!sinTasa && (
        <ReferenciaMercado mercado={mercado} puedeEditar={puedeEditar && !editando} onUsarSugerencia={usarSugerencia} />
      )}

      {/* Botones de edición */}
      {error && <p className="text-sm font-medium text-red-600 mt-3">{error}</p>}

      {editando && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={cancelar}
            className="flex items-center justify-center gap-2 border border-line rounded-xl py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-brand-600/30 transition-colors"
          >
            <Check size={18} />
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}