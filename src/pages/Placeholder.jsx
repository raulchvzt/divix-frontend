export default function Placeholder({ seccion, titulo, descripcion }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {seccion} / <span className="text-brand-600 font-medium">{titulo}</span>
      </p>
      <h1 className="text-[32px] font-bold tracking-tight mt-2">{titulo}</h1>
      <p className="text-sm text-slate-500 mt-1">{descripcion}</p>
    </div>
  )
}