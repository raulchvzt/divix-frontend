import { useEffect, useRef } from 'react'
import { Minus, Plus, Check, AlertTriangle, Wand2 } from 'lucide-react'
import {
  DENOMINACIONES,
  billetesVacios,
  totalBilletes,
  faltantes,
  sugerirBilletes,
} from '../utils/billetes'

/**
 * Indica qué billetes de dólar entran o salen en una operación o movimiento.
 *  - modo "entregar": salen de la caja (venta, salida). No deja usar más de los que hay.
 *  - modo "recibir": entran a la caja (compra, entrada).
 * Se prellena con una sugerencia cada vez que cambia el monto; el cajero solo
 * la corrige si entregó o recibió otros billetes.
 *
 * Props: monto, modo, disponibles ({ "100": 5, ... } o null si no se sabe),
 *        value (mapa de billetes), onChange(mapa).
 */
export default function SelectorBilletes({ monto, modo, disponibles, value, onChange }) {
  const entregar = modo === 'entregar'
  const limite = entregar ? disponibles : null
  const objetivo = Number(monto) || 0
  const suma = totalBilletes(value)
  const diferencia = objetivo - suma
  const excedidos = faltantes(value, limite)
  const esEntero = Number.isInteger(objetivo)

  // Al cambiar el monto, el tipo o los billetes disponibles se vuelve a sugerir.
  const clave = `${objetivo}|${modo}|${JSON.stringify(limite)}`
  const anterior = useRef(null)
  useEffect(() => {
    if (anterior.current === clave) return
    anterior.current = clave
    onChange(sugerirBilletes(objetivo, limite) ?? billetesVacios())
  }, [clave, objetivo, limite, onChange])

  const cambiar = (d, n) => onChange({ ...value, [d]: Math.max(0, n) })
  const sinCombinacion = entregar && limite && esEntero && objetivo > 0 && !sugerirBilletes(objetivo, limite)

  let estado
  if (!esEntero) {
    estado = { ok: false, texto: 'Los dólares se operan en billetes: usa una cantidad entera.' }
  } else if (sinCombinacion) {
    estado = { ok: false, texto: `Con los billetes que hay en caja no se puede formar $${objetivo}.` }
  } else if (excedidos.length) {
    estado = { ok: false, texto: `No hay suficientes billetes de $${excedidos.join(', $')} en caja.` }
  } else if (diferencia > 0) {
    estado = { ok: false, texto: `Faltan $${diferencia.toLocaleString('en-US')}` }
  } else if (diferencia < 0) {
    estado = { ok: false, texto: `Sobran $${(-diferencia).toLocaleString('en-US')}` }
  } else {
    estado = { ok: true, texto: 'Cuadra con el monto' }
  }

  return (
    <div className="rounded-xl border border-line bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-semibold">
          Billetes que {entregar ? 'entregas' : 'recibes'}
        </p>
        <button
          type="button"
          onClick={() => onChange(sugerirBilletes(objetivo, limite) ?? billetesVacios())}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          <Wand2 size={14} />
          Sugerir
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DENOMINACIONES.map((d) => {
          const n = Number(value?.[d]) || 0
          const hay = limite?.[d] ?? null
          const excedido = hay !== null && n > hay
          return (
            <div
              key={d}
              className={`rounded-lg border bg-white px-2.5 py-2 ${excedido ? 'border-red-300' : 'border-line'}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold">${d}</span>
                {hay !== null && <span className={`text-[11px] ${excedido ? 'text-red-600' : 'text-slate-400'}`}>hay {hay}</span>}
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Un billete de $${d} menos`}
                  onClick={() => cambiar(d, n - 1)}
                  disabled={n === 0}
                  className="w-7 h-7 shrink-0 rounded-md border border-line text-slate-500 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <input
                  aria-label={`Billetes de $${d}`}
                  inputMode="numeric"
                  value={n}
                  onChange={(e) => cambiar(d, Number(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-full min-w-0 text-center text-sm font-semibold bg-transparent outline-none"
                />
                <button
                  type="button"
                  aria-label={`Un billete de $${d} más`}
                  onClick={() => cambiar(d, n + 1)}
                  className="w-7 h-7 shrink-0 rounded-md border border-line text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p
        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${estado.ok ? 'text-brand-700' : 'text-red-600'}`}
      >
        {estado.ok ? <Check size={16} /> : <AlertTriangle size={16} />}
        {estado.texto}
        <span className="ml-auto text-slate-500 font-normal">Total: ${suma.toLocaleString('en-US')}</span>
      </p>
    </div>
  )
}
