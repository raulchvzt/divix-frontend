import { useState } from 'react'
import { Search, MoreHorizontal, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { listarOperaciones } from '../../api/operaciones'
import { useCarga } from '../../api/useCarga'
import { dinero } from '../../utils/formato'
import Bandera from '../Bandera'

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

const columnas = ['ID / Hora', 'Operación', 'Divisa', 'Monto', 'Tipo de cambio', 'Total MXN', 'Cajero']

export default function TablaTransacciones({ version = 0 }) {
  const [busqueda, setBusqueda] = useState('')
  const { datos, error } = useCarga(listarOperaciones, [version])

  const filtradas = (datos ?? []).slice(0, 8).filter((t) =>
    `${t.id} ${t.divisa} ${t.tipo} ${t.cajero}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h2 className="text-base font-bold">Últimas transacciones</h2>
          <p className="text-sm text-slate-500 mt-0.5">Movimientos registrados en tiempo real</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-44 bg-white border border-line rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center border border-line rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-y border-line">
            {columnas.map((c) => (
              <th
                key={c}
                className="text-left px-6 py-4 text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtradas.map((t) => (
            <tr key={t.id} className="border-b border-line last:border-0 hover:bg-slate-50/60 transition-colors">
              <td className="px-6 py-5">
                <p className="font-semibold">#{t.id}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock size={14} />
                  {t.hora}
                </p>
              </td>
              <td className="px-6 py-5">
                <Etiqueta tipo={t.tipo} />
              </td>
              <td className="px-6 py-5 font-bold">
                  <span className="inline-flex items-center gap-2">
                    <Bandera codigo={t.divisa} />
                    {t.divisa}
                  </span>
                </td>
              <td className="px-6 py-5 text-slate-600">{t.monto.toFixed(2)}</td>
              <td className="px-6 py-5 text-slate-600">{dinero(t.tasa)}</td>
              <td className="px-6 py-5 font-bold">{dinero(t.total)}</td>
              <td className="px-6 py-5 text-slate-600">{t.cajero}</td>
            </tr>
          ))}

          {filtradas.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-6 py-10 text-center text-slate-400">
                {error || 'No se encontraron transacciones.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}