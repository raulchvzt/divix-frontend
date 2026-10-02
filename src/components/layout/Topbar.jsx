import { Bell, ChevronDown } from 'lucide-react'

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function fechaHoy() {
  const f = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return f.charAt(0).toUpperCase() + f.slice(1)
}

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 h-[73px] bg-white border-b border-line flex items-center justify-between px-8">
      <div>
        <p className="text-xs text-slate-400 font-medium">{fechaHoy()}</p>
        <p className="text-lg font-bold leading-tight">{saludo()}, Bigotes</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Estado de caja */}
        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          Caja abierta · Turno matutino
        </div>

        {/* Notificaciones */}
        <button className="relative text-slate-600 hover:text-slate-900">
          <Bell size={22} strokeWidth={1.8} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* Usuario */}
        <button className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ink-800 text-white text-xs font-bold flex items-center justify-center">
            MR
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold">Oswal Oswaldo</p>
            <p className="text-[11px] text-slate-400">Cajera principal</p>
          </div>
          <ChevronDown size={18} className="text-slate-400" />
        </button>
      </div>
    </header>
  )
}