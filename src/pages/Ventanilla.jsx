import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ListChecks, Wallet, Clock } from 'lucide-react'
import StatCard from '../components/ventanilla/StatCard'
import OperacionRapida from '../components/ventanilla/OperacionRapida'
import DivixAI from '../components/ventanilla/DivixAI'
import { dinero } from '../utils/formato'
import TablaTransacciones from '../components/ventanilla/TablaTransacciones'
import { resumenDia, corteActivo } from '../api/operaciones'
import { useCarga } from '../api/useCarga'

export default function Ventanilla() {
  const navigate = useNavigate()
  const [mostrarIA, setMostrarIA] = useState(true)
  const [version, setVersion] = useState(0)
  const { datos: resumen } = useCarga(resumenDia, [version])
  const { datos: corte } = useCarga(corteActivo, [version])
  const recargar = () => setVersion((v) => v + 1)

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

        <button onClick={() => navigate('/caja')} className="flex items-center gap-2 bg-white border border-line rounded-xl px-5 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
          <Clock size={20} strokeWidth={1.8} />
          Realizar corte
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard icon={ArrowDownLeft} label="Total de compras" value={resumen ? dinero(resumen.compras) : '—'} />
        <StatCard icon={ArrowUpRight} label="Total de ventas" value={resumen ? dinero(resumen.ventas) : '—'} />
        <StatCard icon={ListChecks} label="Operaciones de hoy" value={resumen ? resumen.cantidad : '—'} />
        <StatCard
          icon={Wallet}
          label="Efectivo inicial de caja"
          value={corte ? dinero(Number(corte.efectivoInicial)) : '—'}
          badge={corte ? 'Abierta' : undefined}
          tono="gris"
        />
      </div>

      {/* Operación rápida (a la derecha irá el panel de Divix AI) */}
           {/* Operación rápida + panel de IA */}
      <div className={`grid gap-5 items-start ${mostrarIA ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
        <OperacionRapida onRegistrada={recargar} />
        {mostrarIA && <DivixAI onClose={() => setMostrarIA(false)} />}
      </div>

      {/* Últimas transacciones */}
      <div className="mt-6">
        <TablaTransacciones version={version} />
      </div>

    </div>
  )
}