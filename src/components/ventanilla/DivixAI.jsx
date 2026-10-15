import { useState } from 'react'
import { Sparkles, X, Bot, Send } from 'lucide-react'
import { consultarAsistente } from '../../api/operaciones'
import { obtenerUsuario } from '../../api/auth'

const sugerencias = [
  '¿Cuántos dólares vendimos hoy?',
  '¿Cuál fue el margen de esta semana?',
]

export default function DivixAI({ onClose }) {
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const nombre = obtenerUsuario()?.nombre?.split(' ')[0] ?? ''

  const preguntar = async (texto) => {
    const q = texto.trim()
    if (q.length < 3 || enviando) return
    setPregunta(q)
    setError('')
    setRespuesta('')
    setEnviando(true)
    try {
      const r = await consultarAsistente(q)
      setRespuesta(r.respuesta)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <aside className="bg-ink-800 text-white rounded-2xl p-6 shadow-lg">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-brand-500">
          <Sparkles size={20} />
          <span className="text-[11px] font-bold tracking-[0.2em]">DIVIX AI</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={22} />
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">Tu asistente financiero</h2>
      <p className="text-sm text-slate-400 leading-relaxed mb-5">
        Obtén respuestas rápidas sobre tu operación.
      </p>

      {/* Mensaje del asistente */}
      <div className="flex gap-3 bg-ink-700 border border-white/10 rounded-xl p-4 mb-3">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-500/15 text-brand-500 flex items-center justify-center">
          <Bot size={20} />
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          {enviando ? 'Pensando…' : error || respuesta || `Hola ${nombre}. ¿En qué te ayudo?`}
        </p>
      </div>

      {/* Sugerencias */}
      <div className="flex flex-col gap-2 mb-5">
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

      {/* Pregunta libre */}
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
    </aside>
  )
}