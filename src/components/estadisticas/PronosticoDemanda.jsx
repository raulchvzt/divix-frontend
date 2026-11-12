import { useState } from 'react'
import { TrendingUp, Lightbulb, Target, Info } from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { obtenerPronosticoDemanda } from '../../api/operaciones'
import { useCarga } from '../../api/useCarga'
import Bandera from '../Bandera'

/**
 * Pronóstico de demanda: cuánta divisa se espera vender o comprar en los
 * próximos meses, según las temporadas del propio negocio. No predice el tipo
 * de cambio. El cálculo lo hace el backend (/pronostico-demanda).
 */

const COLOR = { venta: '#059669', compra: '#2a78d6', grid: '#e5e9e7', eje: '#94a3b8' }
const TIPOS = {
  venta: { label: 'Ventas', verbo: 'vender', explicacion: 'Divisa que tus clientes te compran (para viajar, pagar, etc.).' },
  compra: { label: 'Compras', verbo: 'recibir', explicacion: 'Divisa que tus clientes te traen a cambiar (remesas, turistas…).' },
}
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const mesCorto = (clave) => `${MESES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(2, 4)}`
const mesLargo = (clave) => MESES_LARGOS[Number(clave.slice(5, 7)) - 1]
const cantidad = (n) => Math.round(n).toLocaleString('en-US')
const compacto = (n) => Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const pct = (n) => `${n > 0 ? '+' : ''}${Math.round(n)}%`

function Globo({ active, payload, label, codigo }) {
  if (!active || !payload?.length) return null
  const fila = payload[0].payload
  const lineas = [
    fila.real != null && ['Real', fila.real, 'solida'],
    fila.llevamos != null && ['Lo que va del mes', fila.llevamos, 'punto'],
    fila.pronostico != null && fila.real == null && ['Pronóstico', fila.pronostico, 'punteada'],
  ].filter(Boolean)
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      {lineas.map(([nombre, valor]) => (
        <div key={nombre} className="flex items-center gap-3 text-slate-600">
          <span>{nombre}</span>
          <span className="ml-auto pl-4 font-semibold text-slate-900">
            {cantidad(valor)} {codigo}
          </span>
        </div>
      ))}
    </div>
  )
}

function TarjetaMes({ p, tipo, codigo }) {
  const datos = p[tipo]
  const alto = datos.vsNormalPct >= 15
  const bajo = datos.vsNormalPct <= -15
  const llevamos = p.llevamos?.[tipo]
  return (
    <div className={`rounded-xl border p-4 ${alto ? 'border-amber-200 bg-amber-50' : 'border-line bg-slate-50'}`}>
      <p className="text-xs font-semibold text-slate-500 capitalize">
        {mesLargo(p.mes)} {p.enCurso && <span className="normal-case font-medium">(en curso)</span>}
      </p>
      <p className="text-xl font-bold tracking-tight mt-1">
        ~{cantidad(datos.valor)} <span className="text-sm font-semibold text-slate-400">{codigo}</span>
      </p>
      <span
        className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          alto ? 'bg-amber-100 text-amber-800' : bajo ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 border border-line'
        }`}
      >
        {Math.abs(datos.vsNormalPct) < 5 ? 'Mes normal' : `${pct(datos.vsNormalPct)} vs un mes normal`}
      </span>
      {llevamos != null && (
        <p className="text-xs text-slate-500 mt-2">
          Llevas {cantidad(llevamos)} {codigo} ({Math.round((llevamos / Math.max(datos.valor, 1)) * 100)}% de lo esperado)
        </p>
      )}
    </div>
  )
}

export default function PronosticoDemanda() {
  const { datos, cargando, error } = useCarga(obtenerPronosticoDemanda)
  const [codigoElegido, setCodigo] = useState(null)
  const [tipo, setTipo] = useState('venta')

  const divisas = datos?.divisas ?? []
  const divisa = divisas.find((d) => d.codigo === codigoElegido) ?? divisas[0]

  let contenido
  if (cargando) {
    contenido = <p className="text-sm text-slate-400 py-10 text-center">Calculando pronóstico…</p>
  } else if (error) {
    contenido = <p className="text-sm text-slate-400 py-10 text-center">No se pudo calcular el pronóstico.</p>
  } else if (!divisa) {
    contenido = <p className="text-sm text-slate-400 py-10 text-center">Aún no hay operaciones para pronosticar.</p>
  } else if (!divisa.suficiente) {
    contenido = (
      <p className="text-sm text-slate-500 py-10 text-center">
        {divisa.nota} Llevas {divisa.mesesHistorial} {divisa.mesesHistorial === 1 ? 'mes' : 'meses'}.
      </p>
    )
  } else {
    const color = COLOR[tipo]
    const codigo = divisa.codigo
    // Serie para la gráfica: historial real + pronóstico punteado unido al último mes real.
    const filas = divisa.historial.map((h) => ({ etiqueta: mesCorto(h.mes), real: h[tipo] }))
    filas[filas.length - 1].pronostico = filas[filas.length - 1].real
    for (const p of divisa.pronostico) {
      filas.push({
        etiqueta: mesCorto(p.mes),
        pronostico: p[tipo].valor,
        llevamos: p.llevamos?.[tipo] ?? null,
      })
    }

    const pico = [...divisa.pronostico].sort((a, b) => b[tipo].vsNormalPct - a[tipo].vsNormalPct)[0]
    const extra = pico[tipo].valor - pico[tipo].normal
    const prueba = divisa.prueba?.[tipo]
    const confiable = prueba && prueba.errorPct <= 20

    contenido = (
      <>
        {/* Recomendación */}
        {pico[tipo].vsNormalPct >= 15 ? (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
            <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-bold capitalize">{mesLargo(pico.mes)}</span> viene fuerte: se espera{' '}
              {TIPOS[tipo].verbo} ~{cantidad(pico[tipo].valor)} {codigo}, {pct(pico[tipo].vsNormalPct)} que un mes
              normal.{' '}
              {tipo === 'venta'
                ? `Ten ~${cantidad(extra)} ${codigo} extra disponibles.`
                : 'Ten más pesos en caja para poder comprarlos.'}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-line px-4 py-3 mb-5">
            <Info size={20} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              No se esperan picos fuertes de {TIPOS[tipo].label.toLowerCase()} de {codigo} en los próximos meses.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Gráfica */}
          <div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 mb-3">
              <span className="flex items-center gap-2">
                <span className="inline-block w-5 h-0.5 rounded" style={{ background: color }} />
                Real
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: color }} />
                Pronóstico
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: color }} />
                Lo que va del mes
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={COLOR.grid} />
                  <XAxis
                    dataKey="etiqueta"
                    tick={{ fontSize: 12, fill: COLOR.eje }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: COLOR.eje }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={compacto}
                  />
                  <Tooltip content={<Globo codigo={codigo} />} cursor={{ stroke: '#cbd5e1' }} />
                  <Line
                    dataKey="real"
                    name="Real"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                    isAnimationActive
                  />
                  <Line
                    dataKey="pronostico"
                    name="Pronóstico"
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="6 5"
                    dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    dataKey="llevamos"
                    name="Lo que va del mes"
                    stroke="none"
                    dot={{ r: 5, fill: '#fff', stroke: color, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    legendType="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Próximos meses + precisión */}
          <div className="flex flex-col gap-3">
            {divisa.pronostico.map((p) => (
              <TarjetaMes key={p.mes} p={p} tipo={tipo} codigo={codigo} />
            ))}
            {prueba && (
              <div className="flex items-start gap-2 text-xs text-slate-500 mt-1">
                <Target size={14} className="shrink-0 mt-px" />
                <p>
                  <span className={`font-semibold ${confiable ? 'text-slate-700' : 'text-amber-700'}`}>
                    Error promedio: {Math.round(prueba.errorPct)}%
                  </span>
                  {' '}al pronosticar los últimos {prueba.mesesProbados} meses.
                  {!confiable && ' Esta divisa se opera poco, así que el pronóstico es solo orientativo.'}
                </p>
              </div>
            )}
            {!divisa.conTemporada && (
              <p className="text-xs text-slate-500">
                Con menos de 13 meses de historial aún no se detectan temporadas; el pronóstico mejora con el tiempo.
              </p>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm p-6 mt-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <TrendingUp size={18} className="text-brand-600" />
            Pronóstico de demanda
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 max-w-xl">
            Cuánta divisa se espera mover en los próximos meses según las temporadas de tu negocio. No predice el
            tipo de cambio: te ayuda a tener suficiente efectivo de cada divisa.
          </p>
        </div>

        {divisa?.suficiente && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Divisa */}
            <div className="flex bg-slate-50 border border-line rounded-xl p-1">
              {divisas.map((d) => (
                <button
                  key={d.codigo}
                  onClick={() => setCodigo(d.codigo)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    d.codigo === divisa.codigo ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Bandera codigo={d.codigo} />
                  {d.codigo}
                </button>
              ))}
            </div>
            {/* Ventas / compras */}
            <div className="flex bg-slate-50 border border-line rounded-xl p-1">
              {Object.entries(TIPOS).map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => setTipo(id)}
                  title={t.explicacion}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    tipo === id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {contenido}
    </div>
  )
}
