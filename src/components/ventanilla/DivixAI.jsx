import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Bot, Send, History, SquarePen, ChevronLeft } from 'lucide-react'
import {
  consultarAsistente,
  listarConversaciones,
  obtenerConversacion,
} from '../../api/operaciones'
import { obtenerUsuario } from '../../api/auth'

const sugerencias = [
  '¿Cuántos dólares vendimos hoy?',
  '¿Cuánto efectivo debo tener en caja?',
  '¿Cómo van las ventas de esta semana?',
]

const CLAVE_CONVERSACION = 'divix_conversacion'
const leerGuardada = () => {
  try {
    return localStorage.getItem(CLAVE_CONVERSACION)
  } catch {
    return null
  }
}
const guardar = (id) => {
  try {
    if (id) localStorage.setItem(CLAVE_CONVERSACION, id)
    else localStorage.removeItem(CLAVE_CONVERSACION)
  } catch {
    /* sin almacenamiento: la conversación sigue en memoria */
  }
}

// Texto del asistente: respeta saltos de línea, viñetas y **negritas** (sin HTML crudo).
function Texto({ children }) {
  return children.split('\n').map((linea, i) => {
    const viñeta = /^\s*[-*]\s+/.test(linea)
    const limpia = linea.replace(/^\s*[-*]\s+/, '')
    const partes = limpia.split(/\*\*(.+?)\*\*/g)
    return (
      <p key={i} className={`${viñeta ? 'pl-3' : ''} ${linea.trim() === '' ? 'h-2' : ''}`}>
        {viñeta && '• '}
        {partes.map((t, j) => (j % 2 ? <strong key={j}>{t}</strong> : t))}
      </p>
    )
  })
}

const fechaCorta = (f) =>
  new Date(f).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function DivixAI({ onClose, lleno = false }) {
  const [vista, setVista] = useState('chat') // 'chat' | 'historial'
  const [mensajes, setMensajes] = useState([]) // { rol: 'usuario' | 'asistente' | 'error', texto }
  const [idConversacion, setIdConversacion] = useState(leerGuardada)
  const [pregunta, setPregunta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [historial, setHistorial] = useState(null)
  const [errorHistorial, setErrorHistorial] = useState('')
  const caja = useRef(null)
  const nombre = obtenerUsuario()?.nombre?.split(' ')[0] ?? ''

  const aMensajes = (turnos) =>
    turnos.flatMap((t) => [
      { rol: 'usuario', texto: t.pregunta },
      { rol: 'asistente', texto: t.respuesta },
    ])

  // Al abrir el panel, recupera la conversación que estaba en curso.
  useEffect(() => {
    const guardada = leerGuardada()
    if (!guardada) return
    obtenerConversacion(guardada)
      .then((turnos) => setMensajes(aMensajes(turnos)))
      .catch(() => {
        guardar(null)
        setIdConversacion(null)
      })
  }, [])

  useEffect(() => {
    // Baja solo dentro del chat (no mueve toda la página).
    const el = caja.current
    if (el && mensajes.length > 0) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [mensajes, enviando, vista])

  const nueva = () => {
    guardar(null)
    setIdConversacion(null)
    setMensajes([])
    setPregunta('')
    setVista('chat')
  }

  const abrirHistorial = async () => {
    setVista('historial')
    setErrorHistorial('')
    try {
      setHistorial(await listarConversaciones())
    } catch (e) {
      setErrorHistorial(e.message)
    }
  }

  const abrirConversacion = async (id) => {
    try {
      const turnos = await obtenerConversacion(id)
      setMensajes(aMensajes(turnos))
      // Las consultas antiguas ("solo-N") no se pueden continuar: se abren de lectura.
      const continuable = !id.startsWith('solo-')
      setIdConversacion(continuable ? id : null)
      guardar(continuable ? id : null)
      setVista('chat')
    } catch (e) {
      setErrorHistorial(e.message)
    }
  }

  const preguntar = async (texto) => {
    const q = texto.trim()
    if (q.length < 3 || enviando) return
    setPregunta('')
    setMensajes((m) => [...m, { rol: 'usuario', texto: q }])
    setEnviando(true)
    try {
      const r = await consultarAsistente(q, idConversacion)
      setMensajes((m) => [...m, { rol: 'asistente', texto: r.respuesta }])
      setIdConversacion(r.idConversacion)
      guardar(r.idConversacion)
    } catch (e) {
      setMensajes((m) => [...m, { rol: 'error', texto: e.message }])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <aside className={`animar-panel bg-ink-800 text-white rounded-2xl p-6 shadow-lg ${lleno ? 'h-full flex flex-col' : ''}`}>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-brand-500">
          <Sparkles size={20} />
          <span className="text-[11px] font-bold tracking-[0.2em]">DIVIX AI</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          {vista === 'chat' ? (
            <button onClick={abrirHistorial} title="Historial" className="hover:text-white transition-colors">
              <History size={20} />
            </button>
          ) : (
            <button onClick={() => setVista('chat')} title="Volver" className="hover:text-white transition-colors">
              <ChevronLeft size={22} />
            </button>
          )}
          <button onClick={nueva} title="Nueva conversación" className="hover:text-white transition-colors">
            <SquarePen size={20} />
          </button>
          <button onClick={onClose} title="Cerrar" className="hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        {vista === 'chat' ? 'Tu asistente financiero' : 'Conversaciones anteriores'}
      </h2>

      {vista === 'historial' ? (
        <div className={`flex flex-col gap-2 overflow-y-auto ${lleno ? 'flex-1 min-h-0' : 'max-h-[420px]'}`}>
          {errorHistorial && <p className="text-sm text-red-400">{errorHistorial}</p>}
          {!historial && !errorHistorial && <p className="text-sm text-slate-400">Cargando…</p>}
          {historial?.length === 0 && <p className="text-sm text-slate-400">Aún no has hecho consultas.</p>}
          {historial?.map((c) => (
            <button
              key={c.id}
              onClick={() => abrirConversacion(c.id)}
              className="text-left bg-ink-900 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3 transition-colors"
            >
              <p className="text-sm text-slate-100">{c.titulo}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {fechaCorta(c.ultimaFecha)} · {c.mensajes} {c.mensajes === 1 ? 'pregunta' : 'preguntas'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div ref={caja} className={`flex flex-col gap-3 overflow-y-auto pr-1 mb-4 ${lleno ? 'flex-1 min-h-0' : 'max-h-[340px]'}`}>
            {mensajes.length === 0 && (
              <>
                <div className="flex gap-3 bg-ink-700 border border-white/10 rounded-xl p-4">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-500/15 text-brand-500 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Hola {nombre}. Pregúntame por tus operaciones, tu caja o los tipos de cambio.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {sugerencias.map((s) => (
                    <button
                      key={s}
                      onClick={() => preguntar(s)}
                      disabled={enviando}
                      className="text-left text-xs text-slate-200 bg-ink-900 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3.5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {mensajes.map((m, i) =>
              m.rol === 'usuario' ? (
                <div key={i} className="animar-mensaje self-end max-w-[85%] bg-brand-600 rounded-xl rounded-br-sm px-4 py-2.5 text-sm">
                  {m.texto}
                </div>
              ) : (
                <div
                  key={i}
                  className={`animar-mensaje flex gap-3 border rounded-xl p-4 ${
                    m.rol === 'error' ? 'bg-red-500/10 border-red-400/30' : 'bg-ink-700 border-white/10'
                  }`}
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-500/15 text-brand-500 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div className={`min-w-0 flex-1 text-sm leading-relaxed [overflow-wrap:anywhere] ${m.rol === 'error' ? 'text-red-300' : 'text-slate-200'}`}>
                    <Texto>{m.texto}</Texto>
                  </div>
                </div>
              ),
            )}

            {enviando && (
              <p className="animar-mensaje puntos-cargando text-sm text-slate-400">
                Pensando<span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              preguntar(pregunta)
            }}
            className="flex gap-2"
          >
            <input
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              maxLength={1000}
              placeholder="Escribe tu pregunta…"
              className="flex-1 min-w-0 bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500/60"
            />
            <button
              type="submit"
              disabled={enviando}
              className="w-12 flex items-center justify-center bg-white text-ink-800 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </aside>
  )
}
