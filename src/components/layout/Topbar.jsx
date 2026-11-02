import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { obtenerUsuario, cerrarSesion } from '../../api/auth'
import { corteActivo } from '../../api/operaciones'
import { useCarga } from '../../api/useCarga'

const ROLES = { administrador: 'Administrador', cajero: 'Cajero' }

const iniciales = (nombre) =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

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
  const navigate = useNavigate()
  const usuario = obtenerUsuario() ?? { nombre: 'Usuario', rol: '' }
  const { datos: corte } = useCarga(corteActivo)

  const salir = () => {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 h-[73px] bg-white border-b border-line flex items-center justify-between px-8">
      <div>
        <p className="text-xs text-slate-400 font-medium">{fechaHoy()}</p>
        <p className="text-lg font-bold leading-tight">{saludo()}, {usuario.nombre.split(' ')[0]}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Estado de caja */}
        <div
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full ${
            corte ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${corte ? 'bg-brand-500' : 'bg-slate-400'}`} />
          {corte ? 'Caja abierta' : 'Sin corte abierto'}
        </div>

        {/* Notificaciones */}
        <button className="relative text-slate-600 hover:text-slate-900">
          <Bell size={22} strokeWidth={1.8} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ink-800 text-white text-xs font-bold flex items-center justify-center">
            {iniciales(usuario.nombre)}
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold">{usuario.nombre}</p>
            <p className="text-[11px] text-slate-400">{ROLES[usuario.rol] ?? usuario.rol}</p>
          </div>
          <button onClick={salir} title="Cerrar sesión" className="text-slate-400 hover:text-slate-700 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}