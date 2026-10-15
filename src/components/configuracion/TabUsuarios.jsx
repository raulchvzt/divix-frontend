import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import {
  listarUsuarios,
  listarRoles,
  crearUsuario,
  activarUsuario,
  desactivarUsuario,
} from '../../api/configuracion'
import { obtenerUsuario } from '../../api/auth'
import { useCarga } from '../../api/useCarga'

const campo =
  'w-full bg-white border border-line rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

const NOMBRE_ROL = { administrador: 'Administrador', cajero: 'Cajero', supervisor: 'Supervisor' }
const etiquetaRol = (rol) => NOMBRE_ROL[rol?.nombreRol] ?? rol?.nombreRol ?? ''
const nombreCompleto = (u) => [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ')

const vacio = { nombre: '', correo: '', idRol: '' }

const iniciales2 = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

export default function TabUsuarios() {
  const [version, setVersion] = useState(0)
  const { datos: usuarios, error: errorLista } = useCarga(listarUsuarios, [version])
  const { datos: roles } = useCarga(listarRoles)
  const yo = obtenerUsuario()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevo, setNuevo] = useState(vacio)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [credencial, setCredencial] = useState(null) // { usuario, contrasena } mostrada una sola vez

  const lista = usuarios ?? []
  const idRol = nuevo.idRol || roles?.find((r) => r.nombreRol === 'cajero')?.id || ''

  const cerrarForm = () => {
    setMostrarForm(false)
    setNuevo(vacio)
    setError('')
  }

  const agregar = async () => {
    if (!nuevo.nombre.trim() || !nuevo.correo.trim()) return setError('Escribe el nombre y el correo.')
    if (!nuevo.correo.includes('@')) return setError('El correo no es válido.')
    setError('')
    setGuardando(true)
    try {
      const creado = await crearUsuario({
        nombre: nuevo.nombre.trim(),
        correo: nuevo.correo.trim(),
        idRol: Number(idRol),
      })
      setCredencial({ usuario: creado.usuario, contrasena: creado.contrasenaTemporal })
      cerrarForm()
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const alternar = async (u) => {
    setError('')
    try {
      await (u.activo ? desactivarUsuario(u.id) : activarUsuario(u.id))
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h2 className="text-base font-bold">Usuarios del sistema</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lista.filter((u) => u.activo).length} activos de {lista.length}
          </p>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-brand-600/30 transition-colors"
          >
            <Plus size={18} />
            Agregar usuario
          </button>
        )}
      </div>

      {credencial && (
        <div className="mx-6 mb-5 bg-brand-50 border border-brand-500/30 rounded-xl p-5 text-sm">
          <p className="font-bold text-brand-700 mb-1">Usuario creado</p>
          <p>
            Usuario: <code className="font-semibold">{credencial.usuario}</code>
            {credencial.contrasena && (
              <>
                {' '}· Contraseña temporal: <code className="font-semibold">{credencial.contrasena}</code>
              </>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cópiala ahora y entrégasela a la persona: no se volverá a mostrar.
          </p>
          <button onClick={() => setCredencial(null)} className="mt-3 text-xs font-semibold text-brand-700">
            Entendido
          </button>
        </div>
      )}
      {errorLista && <p className="mx-6 mb-4 text-sm font-medium text-red-600">{errorLista}</p>}

      {/* Formulario */}
      {mostrarForm && (
        <div className="mx-6 mb-5 bg-slate-50 border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Nuevo usuario</p>
            <button onClick={cerrarForm} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre completo</label>
              <input
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                placeholder="Ej. Juan Pérez"
                className={campo}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Correo</label>
              <input
                type="email"
                value={nuevo.correo}
                onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                placeholder="usuario@divix.mx"
                className={campo}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rol</label>
              <select value={idRol} onChange={(e) => setNuevo({ ...nuevo, idRol: e.target.value })} className={campo}>
                {(roles ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {NOMBRE_ROL[r.nombreRol] ?? r.nombreRol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600 mt-3">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={cerrarForm}
              className="border border-line bg-white rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={agregar}
              disabled={guardando}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
            >
              <Check size={18} />
              {guardando ? 'Guardando…' : 'Guardar usuario'}
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-y border-line">
            {['Usuario', 'Rol', 'Estado', ''].map((c) => (
              <th key={c} className="text-left px-6 py-4 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id} className="border-b border-line last:border-0 hover:bg-slate-50/60 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-800 text-white text-xs font-bold flex items-center justify-center">
                    {iniciales2(nombreCompleto(u))}
                  </div>
                  <div>
                    <p className="font-semibold">{nombreCompleto(u)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.correo ?? u.usuario}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                    u.rol?.nombreRol === 'administrador' ? 'bg-ink-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {etiquetaRol(u.rol)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    u.activo ? 'text-brand-700' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-brand-500' : 'bg-slate-300'}`} />
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {u.id !== yo?.id && <button
                  onClick={() => alternar(u)}
                  className="border border-line rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}