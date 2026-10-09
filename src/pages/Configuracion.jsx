import { useState } from 'react'
import { Building2, Users, Coins } from 'lucide-react'
import TabNegocio from '../components/configuracion/TabNegocio'

const pestanas = [
  { id: 'negocio', label: 'Negocio', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'divisas', label: 'Divisas', icon: Coins },
]

export default function Configuracion() {
  const [activa, setActiva] = useState('negocio')

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Administración / <span className="text-brand-600 font-medium">Configuración</span>
        </p>
        <h1 className="text-[32px] font-bold tracking-tight mt-2">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ajusta los datos del negocio, los usuarios y las divisas.
        </p>
      </div>

      {/* Pestañas */}
      <div className="inline-flex gap-1 bg-white border border-line rounded-xl p-1 mb-6 shadow-sm">
        {pestanas.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiva(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activa === id ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="max-w-4xl">
        {activa === 'negocio' && <TabNegocio />}

        {activa !== 'negocio' && (
          <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate-400 shadow-sm">
            Próximamente.
          </div>
        )}
      </div>
    </div>
  )
}
