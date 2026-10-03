import { ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet, Clock } from 'lucide-react'
import StatCard from '../components/ventanilla/StatCard'
import OperacionRapida from '../components/ventanilla/OperacionRapida'
import { dinero } from '../utils/formato'

export default function Ventanilla() {
  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-slate-500">
            Operación / <span className="text-brand-600 font-medium">Ventanilla</span>
          </p>
          <h1 className="text-[32px] font-bold tracking-tight mt-2">Resumen de hoy</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aquí tienes el pulso de tu casa de cambio.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white border border-line rounded-xl px-5 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
          <Clock size={20} strokeWidth={1.8} />
          Realizar corte
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard icon={ArrowDownLeft} label="Total de compras" value={dinero(48260)} badge="12.4%" />
        <StatCard icon={ArrowUpRight} label="Total de ventas" value={dinero(72840)} badge="8.7%" />
        <StatCard icon={TrendingUp} label="Margen operativo" value={dinero(6420)} badge="5.2%" />
        <StatCard icon={Wallet} label="Efectivo en caja" value={dinero(124580)} badge="Activo" tono="gris" />
      </div>

      {/* Operación rápida (a la derecha irá el panel de Divix AI) */}
      <div className="grid grid-cols-[1fr_360px] gap-5 items-start">
        <OperacionRapida />
      </div>
    </div>
  )
}