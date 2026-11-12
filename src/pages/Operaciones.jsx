import { useState } from 'react'
import { Search, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { listarOperaciones } from '../api/operaciones'
import { useCarga } from '../api/useCarga'
import { dinero } from '../utils/formato'
import Bandera from '../components/Bandera'

const POR_PAGINA = 6

const filtro =
  'bg-white border border-line rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

const columnas = ['ID / Fecha', 'Operación', 'Divisa', 'Monto', 'Tipo de cambio', 'Total MXN', 'Cajero']

const formatoFecha = (f) =>
  new Date(f + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

function Etiqueta({ tipo }) {
  const esVenta = tipo === 'venta'
  const Icono = esVenta ? ArrowUpRight : ArrowDownLeft
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold ${
        esVenta ? 'bg-brand-50 text-brand-700' : 'bg-blue-50 text-blue-600'
      }`}
    >
      <Icono size={16} />
      {esVenta ? 'Venta' : 'Compra'}
    </span>
  )
}

function Resumen({ label, value }) {
  return (
    <div className="min-w-0 bg-white border border-line rounded-2xl px-4 sm:px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold tracking-tight [overflow-wrap:anywhere]">{value}</p>
    </div>
  )
}

export default function Operaciones() {
  const { datos, error, cargando } = useCarga(listarOperaciones)
  const operaciones = datos ?? []
  const codigos = [...new Set(operaciones.map((o) => o.divisa))].sort()
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('todas')
  const [divisa, setDivisa] = useState('todas')
  const [fecha, setFecha] = useState('')
  const [pagina, setPagina] = useState(1)

  // Cada vez que cambia un filtro, volvemos a la página 1
  const cambiar = (setter) => (valor) => {
    setter(valor)
    setPagina(1)
  }

  const hayFiltros = busqueda || tipo !== 'todas' || divisa !== 'todas' || fecha

  const limpiar = () => {
    setBusqueda('')
    setTipo('todas')
    setDivisa('todas')
    setFecha('')
    setPagina(1)
  }

  const filtradas = operaciones.filter((o) => {
    const texto = `${o.id} ${o.cajero}`.toLowerCase()
    return (
      texto.includes(busqueda.toLowerCase()) &&
      (tipo === 'todas' || o.tipo === tipo) &&
      (divisa === 'todas' || o.divisa === divisa) &&
      (!fecha || o.fecha === fecha)
    )
  })

  const totalCompras = filtradas.filter((o) => o.tipo === 'compra').reduce((s, o) => s + o.total, 0)
  const totalVentas = filtradas.filter((o) => o.tipo === 'venta').reduce((s, o) => s + o.total, 0)

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const inicio = (pagina - 1) * POR_PAGINA
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA)

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6 lg:mb-8">
        <p className="text-sm text-slate-500">
          Operación / <span className="text-brand-600 font-medium">Operaciones</span>
        </p>
        <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight mt-2">Operaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Consulta el historial completo de transacciones.</p>
      </div>

      {/* Resumen de lo filtrado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6">
        <Resumen label="Operaciones" value={filtradas.length} />
        <Resumen label="Total compras" value={dinero(totalCompras)} />
        <Resumen label="Total ventas" value={dinero(totalVentas)} />
      </div>

      <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-5">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => cambiar(setBusqueda)(e.target.value)}
              placeholder="Buscar ID, o cajero..."
              className={`${filtro} w-72 pl-10`}
            />
          </div>

          <select value={tipo} onChange={(e) => cambiar(setTipo)(e.target.value)} className={filtro}>
            <option value="todas">Todas las operaciones</option>
            <option value="compra">Compras</option>
            <option value="venta">Ventas</option>
          </select>

          <select value={divisa} onChange={(e) => cambiar(setDivisa)(e.target.value)} className={filtro}>
            <option value="todas">Todas las divisas</option>
            {codigos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input type="date" value={fecha} onChange={(e) => cambiar(setFecha)(e.target.value)} className={filtro} />

          {hayFiltros && (
            <button
              onClick={limpiar}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="bg-slate-50 border-y border-line">
              {columnas.map((c) => (
                <th key={c} className="text-left px-6 py-4 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold">#{o.id}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatoFecha(o.fecha)} · {o.hora}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Etiqueta tipo={o.tipo} />
                </td>
                <td className="px-6 py-4 font-bold">
                  <span className="inline-flex items-center gap-2">
                    <Bandera codigo={o.divisa} />
                    {o.divisa}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{o.monto.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600">{dinero(o.tasa)}</td>
                <td className="px-6 py-4 font-bold">{dinero(o.total)}</td>
                <td className="px-6 py-4 text-slate-600">{o.cajero}</td>
              </tr>
            ))}

            {visibles.length === 0 && (
              <tr>
                <td colSpan={columnas.length} className="px-6 py-12 text-center text-slate-400">
                  {cargando ? 'Cargando…' : error || 'No hay operaciones con esos filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line">
          <p className="text-sm text-slate-500">
            {filtradas.length === 0
              ? 'Sin resultados'
              : `Mostrando ${inicio + 1}–${Math.min(inicio + POR_PAGINA, filtradas.length)} de ${filtradas.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina === 1}
              className="w-9 h-9 flex items-center justify-center border border-line rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold px-2">
              {pagina} / {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina === totalPaginas}
              className="w-9 h-9 flex items-center justify-center border border-line rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
