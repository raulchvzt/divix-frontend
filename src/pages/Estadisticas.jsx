import { useMemo, useState } from 'react'
import { Activity, Wallet, Receipt, Coins } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { listarOperaciones } from '../api/operaciones'
import { useCarga } from '../api/useCarga'
import { dinero } from '../utils/formato'
import StatCard from '../components/ventanilla/StatCard'
import {
  PERIODOS,
  filtrarPorPeriodo,
  indicadores,
  volumenEnElTiempo,
  volumenPorDivisa,
  porCajero,
  porHoraDelDia,
} from '../utils/estadisticas'
import Bandera from '../components/Bandera'

// Compra/venta usan los mismos colores que las etiquetas de la tabla de Operaciones.
const COLOR = {
  compra: '#2a78d6',
  venta: '#059669',
  barra: '#059669',
  grid: '#e5e9e7',
  eje: '#94a3b8',
}
// Orden fijo: la divisa con más volumen siempre toma el primer color, etc.
const COLORES_DIVISA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']
const COLOR_OTRAS = '#94a3b8'

const ops = (n) => `${n} ${n === 1 ? 'op' : 'ops'}`

const compacto = (n) =>
  '$' + Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const ejeX = { tick: { fontSize: 12, fill: COLOR.eje }, tickLine: false, axisLine: false }
const ejeY = { ...ejeX, width: 56 }

function Tarjeta({ titulo, subtitulo, children, className = '' }) {
  return (
    <div className={`bg-white border border-line rounded-2xl shadow-sm p-6 ${className}`}>
      <div className="mb-5">
        <h2 className="text-base font-bold">{titulo}</h2>
        {subtitulo && <p className="text-sm text-slate-500 mt-0.5">{subtitulo}</p>}
      </div>
      {children}
    </div>
  )
}

function Vacio({ texto = 'Sin operaciones en este periodo.' }) {
  return <div className="h-full flex items-center justify-center text-sm text-slate-400">{texto}</div>
}

function Muestra({ color }) {
  return <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
}

/** Tooltip con el mismo estilo de tarjeta del resto de la app. */
function Globo({ active, payload, label, formato = dinero, titulo }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold mb-1.5">{titulo ? titulo(payload[0].payload) : label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <Muestra color={p.color ?? p.payload.fill} />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-semibold text-slate-900">{formato(p.value, p.payload)}</span>
        </div>
      ))}
    </div>
  )
}

function Leyenda({ items }) {
  return (
    <div className="flex items-center gap-5 text-sm text-slate-600">
      {items.map(({ label, color }) => (
        <span key={label} className="flex items-center gap-2">
          <Muestra color={color} />
          {label}
        </span>
      ))}
    </div>
  )
}

function CompraVsVenta({ compras, ventas }) {
  const total = compras.total + ventas.total
  const pctCompra = total ? (compras.total / total) * 100 : 50
  const fila = (label, color, d) => (
    <div className="flex items-center gap-3">
      <Muestra color={color} />
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-400">{ops(d.cantidad)}</span>
      <span className="ml-auto font-semibold">{dinero(d.total)}</span>
    </div>
  )
  return (
    <div className="flex flex-col gap-4 text-sm">
      {/* Barra 100% con un hueco blanco entre los dos segmentos */}
      <div className="flex h-3 gap-0.5 rounded-full overflow-hidden bg-slate-100">
        {total > 0 && (
          <>
            <div style={{ width: `${pctCompra}%`, background: COLOR.compra }} />
            <div style={{ width: `${100 - pctCompra}%`, background: COLOR.venta }} />
          </>
        )}
      </div>
      {fila('Compras', COLOR.compra, compras)}
      {fila('Ventas', COLOR.venta, ventas)}
      {total > 0 && (
        <p className="text-xs text-slate-400">
          {pctCompra.toFixed(0)}% del volumen fueron compras y {(100 - pctCompra).toFixed(0)}% ventas.
        </p>
      )}

      <div className="border-t border-line pt-4 mt-1">
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3">Ticket promedio</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Compra', compras],
            ['Venta', ventas],
          ].map(([label, d]) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-lg font-bold tracking-tight">{dinero(d.cantidad ? d.total / d.cantidad : 0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Estadisticas() {
  const { datos, error, cargando } = useCarga(listarOperaciones)
  const [periodo, setPeriodo] = useState('30d')

  const calc = useMemo(() => {
    const filtradas = filtrarPorPeriodo(datos ?? [], periodo)
    return {
      filtradas,
      kpi: indicadores(filtradas),
      tiempo: volumenEnElTiempo(filtradas, periodo),
      divisas: volumenPorDivisa(filtradas),
      cajeros: porCajero(filtradas),
      horas: porHoraDelDia(filtradas),
    }
  }, [datos, periodo])

  const { filtradas, kpi, tiempo, divisas, cajeros, horas } = calc
  const hayDatos = filtradas.length > 0
  const colorDivisa = (d, i) => (d.divisa === 'Otras' ? COLOR_OTRAS : COLORES_DIVISA[i])
  const horaPico = horas.reduce((max, h) => (h.cantidad > (max?.cantidad ?? 0) ? h : max), null)

  return (
    <div>
      {/* Encabezado + filtro de periodo */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-slate-500">
            Operación / <span className="text-brand-600 font-medium">Estadísticas</span>
          </p>
          <h1 className="text-[32px] font-bold tracking-tight mt-2">Estadísticas</h1>
          <p className="text-sm text-slate-500 mt-1">Los indicadores más importantes de tus operaciones.</p>
        </div>

        <div className="flex bg-white border border-line rounded-xl p-1 shadow-sm">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodo === p.id ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {(cargando || error) && (
        <div className="bg-white border border-line rounded-2xl shadow-sm px-6 py-12 text-center text-slate-400 mb-6">
          {cargando ? 'Cargando estadísticas…' : error}
        </div>
      )}

      {!cargando && !error && (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <StatCard icon={Activity} label="Operaciones" value={kpi.cantidad.toLocaleString('es-MX')} />
            <StatCard icon={Wallet} label="Volumen operado" value={dinero(kpi.volumen)} />
            <StatCard icon={Receipt} label="Ticket promedio" value={dinero(kpi.ticketPromedio)} tono="gris" />
            <StatCard
              icon={Coins}
              label="Divisa más operada"
              value={kpi.divisaTop?.divisa ?? '—'}
              badge={kpi.divisaTop ? `${kpi.divisaTop.pct.toFixed(0)}% del volumen` : null}
              tono="gris"
            />
          </div>

          {/* Volumen en el tiempo + compras vs ventas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            <Tarjeta
              titulo="Volumen de compras y ventas"
              subtitulo={periodo === 'hoy' ? 'Importe en MXN por hora' : 'Importe en MXN por periodo'}
              className="xl:col-span-2"
            >
              <div className="mb-4">
                <Leyenda
                  items={[
                    { label: 'Compras', color: COLOR.compra },
                    { label: 'Ventas', color: COLOR.venta },
                  ]}
                />
              </div>
              <div className="h-72">
                {hayDatos ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tiempo} barGap={2} barCategoryGap="25%">
                      <CartesianGrid vertical={false} stroke={COLOR.grid} />
                      <XAxis dataKey="etiqueta" {...ejeX} minTickGap={12} />
                      <YAxis {...ejeY} tickFormatter={compacto} />
                      <Tooltip content={<Globo />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="compra" name="Compras" fill={COLOR.compra} radius={[4, 4, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="venta" name="Ventas" fill={COLOR.venta} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Vacio />
                )}
              </div>
            </Tarjeta>

            <Tarjeta titulo="Compras vs ventas" subtitulo="Reparto del volumen en MXN">
              {hayDatos ? <CompraVsVenta compras={kpi.compras} ventas={kpi.ventas} /> : <Vacio />}
            </Tarjeta>
          </div>

          {/* Divisas, cajeros y horario */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <Tarjeta titulo="Volumen por divisa" subtitulo="Participación en MXN">
              {hayDatos ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={divisas}
                          dataKey="total"
                          nameKey="divisa"
                          innerRadius="62%"
                          outerRadius="100%"
                          paddingAngle={divisas.length > 1 ? 2 : 0}
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {divisas.map((d, i) => (
                            <Cell key={d.divisa} fill={colorDivisa(d, i)} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <Globo
                              titulo={(d) => d.divisa}
                              formato={(v, d) => `${dinero(v)} · ${ops(d.cantidad)}`}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Tabla con los valores: la gráfica nunca depende solo del color */}
                  <ul className="mt-5 flex flex-col gap-2.5 text-sm">
                    {divisas.map((d, i) => (
                      <li key={d.divisa} className="flex items-center gap-3">
                        <Muestra color={colorDivisa(d, i)} />
                        {d.divisa === 'Otras' ? (
                          <span className="w-5 shrink-0" />
                        ) : (
                          <Bandera codigo={d.divisa} />
                        )}
                        <span className="font-semibold w-12">{d.divisa}</span>
                        <span className="text-slate-400">{d.pct.toFixed(1)}%</span>
                        <span className="ml-auto font-semibold">{dinero(d.total)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="h-48">
                  <Vacio />
                </div>
              )}
            </Tarjeta>

            <Tarjeta titulo="Desempeño por cajero" subtitulo="Volumen operado en MXN">
              <div className="h-72">
                {hayDatos ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cajeros} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid horizontal={false} stroke={COLOR.grid} />
                      <XAxis type="number" {...ejeX} tickFormatter={compacto} />
                      <YAxis type="category" dataKey="cajero" {...ejeX} width={96} />
                      <Tooltip
                        content={<Globo formato={(v, d) => `${dinero(v)} · ${ops(d.cantidad)}`} />}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="total" name="Volumen" fill={COLOR.barra} radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Vacio />
                )}
              </div>
            </Tarjeta>

            <Tarjeta
              titulo="Horario con más movimiento"
              subtitulo={horaPico ? `La hora pico es a las ${horaPico.hora}` : 'Operaciones por hora del día'}
            >
              <div className="h-72">
                {hayDatos ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={horas} barCategoryGap="20%">
                      <CartesianGrid vertical={false} stroke={COLOR.grid} />
                      <XAxis dataKey="hora" {...ejeX} minTickGap={8} />
                      <YAxis {...ejeX} width={32} allowDecimals={false} />
                      <Tooltip
                        content={<Globo formato={(v) => `${v} ${v === 1 ? 'operación' : 'operaciones'}`} />}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="cantidad" name="Operaciones" fill={COLOR.barra} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Vacio />
                )}
              </div>
            </Tarjeta>
          </div>
        </>
      )}
    </div>
  )
}
