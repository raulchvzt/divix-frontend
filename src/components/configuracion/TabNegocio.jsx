import { useState } from 'react'
import { Check } from 'lucide-react'

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
  const [datos, setDatos] = useState({
    nombre: 'Casa de Cambio Divix',
    rfc: 'XAXX010101000',
    telefono: '312 123 4567',
    correo: 'contacto@divix.mx',
    direccion: 'Av. Constitución 123, Centro, Colima, Col.',
    apertura: '09:00',
    cierre: '18:00',
  })
  const [guardado, setGuardado] = useState(false)

  const cambiar = (clave) => (e) => {
    setDatos({ ...datos, [clave]: e.target.value })
    setGuardado(false)
  }

  const guardar = () => {
    // Más adelante esto enviará los datos al backend
    setGuardado(true)
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-bold">Datos del negocio</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Esta información aparece en tus comprobantes y reportes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <Campo label="Nombre del negocio">
          <input value={datos.nombre} onChange={cambiar('nombre')} className={campo} />
        </Campo>

        <Campo label="RFC">
          <input value={datos.rfc} onChange={cambiar('rfc')} className={campo} />
        </Campo>

        <Campo label="Teléfono">
          <input value={datos.telefono} onChange={cambiar('telefono')} className={campo} />
        </Campo>

        <Campo label="Correo electrónico">
          <input type="email" value={datos.correo} onChange={cambiar('correo')} className={campo} />
        </Campo>

        <div className="col-span-2">
          <Campo label="Dirección">
            <input value={datos.direccion} onChange={cambiar('direccion')} className={campo} />
          </Campo>
        </div>

        <Campo label="Hora de apertura">
          <input type="time" value={datos.apertura} onChange={cambiar('apertura')} className={campo} />
        </Campo>

        <Campo label="Hora de cierre">
          <input type="time" value={datos.cierre} onChange={cambiar('cierre')} className={campo} />
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
        {guardado && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            <Check size={18} />
            Cambios guardados
          </span>
        )}
        <button
          onClick={guardar}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-colors"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}