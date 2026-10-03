import { Sparkles, X, Bot, MessageSquare } from 'lucide-react'

const sugerencias = [
  '¿Cuántos dólares vendimos hoy?',
  '¿Cuál fue el margen de esta semana?',
]

export default function DivixAI({ onClose }) {
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
          Hola Mariana. Hoy llevas un{' '}
          <span className="text-brand-500 font-semibold">12% más</span> de ventas que ayer. ¿En qué
          te ayudo?
        </p>
      </div>

      {/* Sugerencias */}
      <div className="flex flex-col gap-2 mb-5">
        {sugerencias.map((s) => (
          <button
            key={s}
            className="text-left text-xs text-slate-200 bg-ink-900 border border-white/10 hover:border-brand-500/50 rounded-xl px-4 py-3.5 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Botón */}
      <button className="w-full flex items-center justify-center gap-2 bg-white text-ink-800 text-sm font-semibold rounded-xl py-3.5 hover:bg-slate-100 transition-colors">
        <MessageSquare size={20} strokeWidth={1.8} />
        Abrir conversación
      </button>
    </aside>
  )
}