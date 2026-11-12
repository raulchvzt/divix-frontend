import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { listarMonedas, crearMoneda, activarMoneda, desactivarMoneda } from '../../api/configuracion'
import { useCarga } from '../../api/useCarga'
import Bandera from '../Bandera'
import { buscarDivisas, divisaPorCodigo } from '../../utils/divisasMundo'

const campo =
  'w-full bg-white border border-line rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition'

const vacio = { codigo: '', nombre: '' }

function Interruptor({ activo, onClick }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={activo}
      className={`relative w-11 h-6 rounded-full transition-colors ${activo ? 'bg-brand-600' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          activo ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export default function TabDivisas() {
  const [version, setVersion] = useState(0)
  const { datos, error: errorLista } = useCarga(listarMonedas, [version])
  const divisas = (datos ?? []).map((m) => ({ id: m.id, codigo: m.codigo, nombre: m.nombre, activa: m.activo }))
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nueva, setNueva] = useState(vacio)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  // Sugerencias del catálogo mundial mientras se escribe el código o el nombre.
  const [busqueda, setBusqueda] = useState({ texto: '', porNombre: false })
  const [resaltada, setResaltada] = useState(0)
  const sugerencias = buscarDivisas(busqueda.texto, { porNombre: busqueda.porNombre })
  const yaExiste = (codigo) => codigo === 'MXN' || divisas.some((d) => d.codigo === codigo)

  const escribir = (campo, valor) => {
    setNueva({ ...nueva, [campo]: valor })
    setBusqueda({ texto: valor, porNombre: campo === 'nombre' })
    setResaltada(0)
  }

  const elegir = (d) => {
    if (yaExiste(d.codigo)) return
    setNueva({ codigo: d.codigo, nombre: d.nombre })
    setBusqueda({ texto: '', porNombre: false })
    setError('')
  }

  // Flechas para moverse, Enter para elegir y Esc para cerrar las sugerencias.
  const teclas = (e) => {
    if (!sugerencias.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setResaltada((i) => (i + 1) % sugerencias.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setResaltada((i) => (i - 1 + sugerencias.length) % sugerencias.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      elegir(sugerencias[resaltada])
    } else if (e.key === 'Escape') {
      setBusqueda({ texto: '', porNombre: false })
    }
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setNueva(vacio)
    setBusqueda({ texto: '', porNombre: false })
    setError('')
  }

  const agregar = async () => {
    const codigo = nueva.codigo.trim().toUpperCase()
    const nombre = nueva.nombre.trim()

    if (!codigo || !nombre) return setError('Escribe el código y el nombre.')
    if (!/^[A-Z]{3}$/.test(codigo)) return setError('El código debe tener 3 letras (ejemplo: GBP).')
    if (codigo === 'MXN') return setError('MXN es la moneda nacional, ya está incluida.')
    if (divisas.some((d) => d.codigo === codigo)) return setError('Esa divisa ya existe.')

    setError('')
    setGuardando(true)
    try {
      await crearMoneda(codigo, nombre, divisaPorCodigo(codigo)?.simbolo)
      cerrarForm()
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const alternar = async (d) => {
    setError('')
    try {
      await (d.activa ? desactivarMoneda(d.id) : activarMoneda(d.id))
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
          <h2 className="text-base font-bold">Divisas disponibles</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {divisas.filter((d) => d.activa).length} activas de {divisas.length}. Solo las activas aparecen en la
            Ventanilla. Una divisa nueva necesita su precio en Tipos de cambio.
          </p>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-brand-600/30 transition-colors"
          >
            <Plus size={18} />
            Agregar divisa
          </button>
        )}
      </div>

      {(errorLista || (error && !mostrarForm)) && (
        <p className="mx-6 mb-4 text-sm font-medium text-red-600">{errorLista || error}</p>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <div className="mx-6 mb-5 bg-slate-50 border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Nueva divisa</p>
            <button onClick={cerrarForm} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Código</label>
              <input
                value={nueva.codigo}
                onChange={(e) => escribir('codigo', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                onKeyDown={teclas}
                onBlur={() => setBusqueda({ texto: '', porNombre: false })}
                maxLength={3}
                autoFocus
                autoComplete="off"
                role="combobox"
                aria-expanded={sugerencias.length > 0}
                aria-controls="sugerencias-divisas"
                placeholder="GBP"
                className={`${campo} uppercase tracking-widest`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre</label>
              <input
                value={nueva.nombre}
                onChange={(e) => escribir('nombre', e.target.value)}
                onKeyDown={teclas}
                onBlur={() => setBusqueda({ texto: '', porNombre: false })}
                autoComplete="off"
                role="combobox"
                aria-expanded={sugerencias.length > 0}
                aria-controls="sugerencias-divisas"
                placeholder="Libra esterlina"
                className={campo}
              />
            </div>

            {/* Sugerencias */}
            {sugerencias.length > 0 && (
              <ul
                id="sugerencias-divisas"
                role="listbox"
                className="animar-modal absolute left-0 right-0 top-full mt-2 z-20 bg-white border border-line rounded-xl shadow-xl py-1.5 max-h-80 overflow-y-auto"
              >
                {sugerencias.map((d, i) => {
                  const existe = yaExiste(d.codigo)
                  return (
                    <li
                      key={d.codigo}
                      role="option"
                      aria-selected={i === resaltada}
                      aria-disabled={existe}
                      // mousedown para que el clic llegue antes de que el campo pierda el foco
                      onMouseDown={(e) => {
                        e.preventDefault()
                        elegir(d)
                      }}
                      onMouseEnter={() => setResaltada(i)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                        existe
                          ? 'opacity-50 cursor-not-allowed'
                          : `cursor-pointer ${i === resaltada ? 'bg-brand-50' : ''}`
                      }`}
                    >
                      <Bandera codigo={d.codigo} />
                      <span className="font-bold w-12">{d.codigo}</span>
                      <span className="text-slate-600 truncate">{d.nombre}</span>
                      <span className="ml-auto pl-3 shrink-0 text-xs text-slate-400">
                        {existe ? 'Ya agregada' : d.simbolo}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {nueva.codigo.length === 3 && !divisaPorCodigo(nueva.codigo) && (
            <p className="text-xs text-amber-700 mt-3">
              {nueva.codigo} no es un código de divisa reconocido. Revisa que esté bien escrito.
            </p>
          )}

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
              {guardando ? 'Guardando…' : 'Guardar divisa'}
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="bg-slate-50 border-y border-line">
            {['Divisa', 'Estado', 'Activa'].map((c, i) => (
              <th
                key={c}
                className={`px-6 py-4 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${
                  i === 2 ? 'text-right' : 'text-left'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Moneda nacional fija */}
          <tr className="border-b border-line bg-slate-50/50">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Bandera codigo="MXN" tamano="md" />
                <div>
                  <p className="font-semibold">Peso mexicano</p>
                  <p className="text-xs text-slate-400 mt-0.5">Moneda nacional</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Siempre activa
              </span>
            </td>
            <td className="px-6 py-4 text-right text-xs text-slate-400">No editable</td>
          </tr>

          {divisas.map((d) => (
            <tr key={d.codigo} className="border-b border-line last:border-0 hover:bg-slate-50/60 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Bandera codigo={d.codigo} tamano="md" />
                  <div>
                    <p className="font-semibold">{d.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.codigo}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    d.activa ? 'text-brand-700' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${d.activa ? 'bg-brand-500' : 'bg-slate-300'}`} />
                  {d.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <Interruptor activo={d.activa} onClick={() => alternar(d)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}