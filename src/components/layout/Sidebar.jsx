import { NavLink } from 'react-router-dom'
import { puedeVer } from '../../api/permisos'
import {
  DollarSign,
  LayoutGrid,
  BarChart3,
  Inbox,
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  PieChart,
  X,
  Sparkles,
} from 'lucide-react'

const operacion = [
  { to: '/', label: 'Ventanilla', icon: LayoutGrid },
  { to: '/tipos-de-cambio', label: 'Tipos de cambio', icon: BarChart3 },
  { to: '/caja', label: 'Caja y cortes', icon: Inbox },
  { to: '/operaciones', label: 'Operaciones', icon: FileText },
  { to: '/estadisticas', label: 'Estadísticas', icon: PieChart },
]

const administracion = [
  { to: '/configuracion', label: 'Configuración', icon: SlidersHorizontal },
]

function NavSection({ title, items, onNavegar }) {
  const visibles = items.filter((i) => puedeVer(i.to))
  if (visibles.length === 0) return null
  return (
    <div className="mb-6">
      <p className="px-3 mb-3 text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase">
        {title}
      </p>
      <nav className="flex flex-col gap-1">
        {visibles.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavegar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function Sidebar({ abierto = false, onCerrar = () => {}, iaAbierta = false, onIA = () => {} }) {
  return (
    <>
    {/* Fondo oscuro detrás del menú (solo móvil/tablet) */}
    <div
      onClick={onCerrar}
      className={`fixed inset-0 z-30 bg-ink-900/50 transition-opacity lg:hidden ${abierto ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    />
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[260px] lg:w-[244px] shrink-0 bg-white border-r border-line h-screen overflow-y-auto flex flex-col px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button onClick={onCerrar} title="Cerrar menú" className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 lg:hidden">
        <X size={22} />
      </button>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/30">
          <DollarSign size={22} />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-extrabold">
            Divix<span className="text-brand-600">.</span>
          </p>
          <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-400">
            CONTROL CAMBIARIO
          </p>
        </div>
      </div>

      <NavSection title="Operación" items={operacion} onNavegar={onCerrar} />
      <NavSection title="Administración" items={administracion} onNavegar={onCerrar} />

      {/* Asistente de IA */}
      <div className="mb-6">
        <p className="px-3 mb-3 text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase">Asistente</p>
        <button
          onClick={() => {
            onIA()
            onCerrar()
          }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
            iaAbierta ? 'bg-ink-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles size={20} strokeWidth={1.8} className={iaAbierta ? 'text-brand-500' : ''} />
          Divix AI
        </button>
      </div>

      {/* Tarjeta inferior */}
      <div className="mt-auto rounded-2xl bg-ink-800 text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-brand-500" />
          <p className="text-sm font-semibold">Caja protegida</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Tus movimientos están sincronizados y respaldados.
        </p>
        <div className="h-1 rounded-full bg-white/10">
          <div className="h-1 rounded-full bg-brand-500 w-[70%]" />
        </div>
      </div>
    </aside>
    </>
  )
}