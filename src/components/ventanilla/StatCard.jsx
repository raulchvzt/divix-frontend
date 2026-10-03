import { TrendingUp } from 'lucide-react'

const tonos = {
  verde: 'bg-brand-50 text-brand-600',
  gris: 'bg-slate-100 text-slate-600',
}

export default function StatCard({ icon: Icon, label, value, badge, tono = 'verde' }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tonos[tono]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          <TrendingUp size={16} />
          {badge}
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-[26px] font-bold tracking-tight">{value}</p>
    </div>
  )
}