import { useState } from 'react'
import { Calculator, Plus } from 'lucide-react'
import { obtenerDivisas } from '../../api/divisas'
import { registrarOperacion, obtenerClienteGeneral } from '../../api/operaciones'
import { useCarga } from '../../api/useCarga'
import { dinero } from '../../utils/formato'

const campo =
  'w-full bg-white border border-line rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

export default function OperacionRapida({ onRegistrada }) {
  const [tipo, setTipo] = useState('venta') // 'compra' | 'venta'
  const [codigo, setCodigo] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { datos: divisas, error: errorDivisas } = useCarga(obtenerDivisas)

  const divisa = divisas?.find((d) => d.codigo === codigo) ?? divisas?.[0]
  const tasa = divisa ? (tipo === 'venta' ? divisa.venta : divisa.compra) : 0
  const total = Math.round((parseFloat(monto) || 0) * tasa * 100) / 100

  const registrar = async () => {
    setError('')
    setAviso('')
    if (!divisa) return setError('No hay divisas disponibles.')
    if (!(parseFloat(monto) > 0)) return setError('Escribe un monto mayor a cero.')
    setEnviando(true)
    try {
      const cliente = await obtenerClienteGeneral()
      await registrarOperacion({ idCliente: cliente.id, idMoneda: divisa.id, tipo, monto })
      setAviso(`Operación registrada: ${tipo} de ${monto} ${divisa.codigo}`)
      setMonto('')
      onRegistrada?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold">Operación rápida</h2>
          <p className="text-sm text-slate-500 mt-0.5">Registra una nueva transacción</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
          <Calculator size={20} strokeWidth={1.8} />
        </div>
      </div>

      {/* Pestañas Comprar / Vender */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {[
          { id: 'compra', label: 'Comprar divisa' },
          { id: 'venta', label: 'Vender divisa' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
              tipo === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campos */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Divisa</label>
          <select value={divisa?.codigo ?? ''} onChange={(e) => setCodigo(e.target.value)} className={campo}>
            {(divisas ?? []).map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} · {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Monto en divisa</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              {divisa?.codigo}
            </span>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={`${campo} text-right text-base font-semibold`}
            />
          </div>
        </div>


          <div className="col-span-2">
          <label className="block text-sm font-semibold mb-2">Tipo de cambio</label>
          <div className="flex items-center justify-between bg-slate-50 border border-line rounded-xl px-4 py-3.5 text-sm">
            <span className="text-slate-500">1 {divisa?.codigo} =</span>
            <span className="font-semibold">{dinero(tasa)} MXN</span>
          </div>
        </div>
      </div>

      {(error || errorDivisas) && <p className="text-sm font-medium text-red-600 mt-4">{error || errorDivisas}</p>}
      {aviso && <p className="text-sm font-medium text-brand-700 mt-4">{aviso}</p>}

      {/* Total y botón */}
      <div className="mt-6 flex items-center justify-between bg-brand-50 rounded-xl px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-brand-700 mb-1">Importe en moneda nacional</p>
          <p className="text-[28px] font-bold tracking-tight text-brand-700 leading-none">
            {dinero(total)} <span className="text-sm font-semibold text-slate-500">MXN</span>
          </p>
        </div>
        <button
          onClick={registrar}
          disabled={enviando}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-colors"
        >
          <Plus size={20} />
          {enviando ? 'Registrando…' : 'Registrar operación'}
        </button>
      </div>
    </div>
  )
}