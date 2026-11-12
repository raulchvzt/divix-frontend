import { useState } from 'react'
import { Check } from 'lucide-react'
import { obtenerNegocio, guardarNegocio } from '../../api/configuracion'
import { obtenerUsuario } from '../../api/auth'
import { useCarga } from '../../api/useCarga'

const campo =
  'w-full bg-white border border-line rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function TabNegocio() {
  const { datos, error, cargando } = useCarga(obtenerNegocio)
  if (cargando) return <p className="text-sm text-slate-400">Cargando datos del negocio…</p>
  if (error) return <p className="text-sm font-medium text-red-600">{error}</p>
  return <Formulario inicial={datos} />
}

function Formulario({ inicial }) {
  const puedeEditar = obtenerUsuario()?.rol === 'administrador'
  const [datos, setDatos] = useState({
    nombre: inicial.nombre,
    rfc: inicial.rfc,
    telefono: inicial.telefono,
    correo: inicial.correo,
    direccion: inicial.direccion,
    apertura: inicial.horaApertura,
    cierre: inicial.horaCierre,
  })
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (clave) => (e) => {
    setDatos({ ...datos, [clave]: e.target.value })
    setGuardado(false)
  }

  const guardar = async () => {
    setError('')
    setGuardando(true)
    try {
      await guardarNegocio({
        nombre: datos.nombre.trim(),
        rfc: datos.rfc.trim(),
        telefono: datos.telefono.trim(),
        correo: datos.correo.trim(),
        direccion: datos.direccion.trim(),
        horaApertura: datos.apertura,
        horaCierre: datos.cierre,
      })
      setGuardado(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-bold">Datos del negocio</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Esta información aparece en tus comprobantes y reportes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <Campo label="Nombre del negocio">
          <input value={datos.nombre} onChange={cambiar('nombre')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <Campo label="RFC">
          <input value={datos.rfc} onChange={cambiar('rfc')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <Campo label="Teléfono">
          <input value={datos.telefono} onChange={cambiar('telefono')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <Campo label="Correo electrónico">
          <input type="email" value={datos.correo} onChange={cambiar('correo')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <div className="sm:col-span-2">
          <Campo label="Dirección">
            <input value={datos.direccion} onChange={cambiar('direccion')} className={campo} disabled={!puedeEditar} />
          </Campo>
        </div>

        <Campo label="Hora de apertura">
          <input type="time" value={datos.apertura} onChange={cambiar('apertura')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <Campo label="Hora de cierre">
          <input type="time" value={datos.cierre} onChange={cambiar('cierre')} className={campo} disabled={!puedeEditar} />
        </Campo>

        <Campo label="Moneda nacional">
          <div className="flex items-center justify-between bg-slate-50 border border-line rounded-xl px-4 py-3.5 text-sm">
            <span className="font-semibold">MXN · Peso mexicano</span>
            <span className="text-xs text-slate-400">No editable</span>
          </div>
        </Campo>
      </div>

      {/* Guardar */}
      <div className="flex items-center justify-end gap-4 mt-6 pt-5 border-t border-line">
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
        {guardado && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            <Check size={18} />
            Cambios guardados
          </span>
        )}
        {puedeEditar ? <button
          onClick={guardar}
          disabled={guardando}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-colors"
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button> : <span className="text-xs text-slate-400">Solo el administrador puede editar estos datos.</span>}
      </div>
    </div>
  )
}