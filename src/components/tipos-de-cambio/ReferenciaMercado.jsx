import { Globe, TrendingUp, TrendingDown, AlertTriangle, Wand2 } from 'lucide-react'

/**
 * Comparación de los precios de una divisa con la referencia del mercado.
 * Solo informa y sugiere: el precio lo sigue poniendo el dueño.
 */

const FUENTES = { banxico: 'Banxico · FIX', frankfurter: 'Banco Central Europeo' }

const precio = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 4 : 2 })

const signo = (n) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`

const fechaCorta = (iso) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

function Comparacion({ etiqueta, pct, malo }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${malo ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600'}`}>
      <p className="text-[11px] font-medium">{etiqueta}</p>
      <p className="text-sm font-bold">
        {signo(pct)} <span className="font-medium">{pct >= 0 ? 'arriba' : 'abajo'}</span>
      </p>
    </div>
  )
}

export default function ReferenciaMercado({ mercado: m, puedeEditar, onUsarSugerencia }) {
  if (!m) return null

  const compraMala = m.compraVsMercadoPct > 0 // compras más caro que el mercado
  const ventaMala = m.ventaVsMercadoPct < 0 // vendes más barato que el mercado
  const seMovioMucho = m.estado === 'revisar'
  const Flecha = m.movimientoPct >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="mt-4 rounded-xl border border-line bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Globe size={14} />
            Precio del mercado
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {FUENTES[m.fuente] ?? m.fuente} · {fechaCorta(m.fechaReferencia)}
          </p>
        </div>
        <p className="text-base font-bold">{precio(m.referencia)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Comparacion etiqueta="Tu compra" pct={m.compraVsMercadoPct} malo={compraMala} />
        <Comparacion etiqueta="Tu venta" pct={m.ventaVsMercadoPct} malo={ventaMala} />
      </div>

      {m.estado === 'perdida' && (
        <p className="mt-3 flex items-start gap-2 text-xs font-medium text-red-700">
          <AlertTriangle size={14} className="shrink-0 mt-px" />
          {compraMala
            ? 'Estás comprando más caro que el mercado.'
            : 'Estás vendiendo más barato que el mercado.'}
        </p>
      )}

      {m.movimientoPct !== null && (
        <p
          className={`mt-3 flex items-start gap-2 text-xs font-medium ${
            seMovioMucho ? 'text-amber-700' : 'text-slate-500'
          }`}
        >
          <Flecha size={14} className="shrink-0 mt-px" />
          El mercado {m.movimientoPct >= 0 ? 'subió' : 'bajó'} {Math.abs(m.movimientoPct).toFixed(2)}% desde que
          actualizaste tus precios ({fechaCorta(m.tuPrecio.actualizado)}).
        </p>
      )}

      {puedeEditar && m.sugerencia && (
        <>
          <button
            onClick={() => onUsarSugerencia(m.sugerencia)}
            title="Solo llena los campos: puedes ajustar los precios antes de guardar."
            className={`mt-3 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border ${
              m.estado === 'perdida'
                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                : seMovioMucho
                  ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                  : 'bg-white border-line text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wand2 size={16} className="shrink-0" />
            <span className="text-left leading-tight">
              Usar sugerencia
              <span className="block font-medium opacity-80">
                Compra {precio(Number(m.sugerencia.compra))} · Venta {precio(Number(m.sugerencia.venta))}
              </span>
            </span>
          </button>
          {/* De dónde sale la sugerencia */}
          <p className="mt-2 text-[11px] text-slate-500">
            {m.sugerencia.motivo === 'centrar_en_mercado'
              ? `Tu margen habitual (${m.sugerencia.margenPct}% a cada lado) alrededor del precio del mercado.`
              : 'Conserva el margen que tenías frente al mercado cuando pusiste tus precios.'}
          </p>
        </>
      )}
    </div>
  )
}
