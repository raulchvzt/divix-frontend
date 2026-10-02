import { DollarSign } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
        <DollarSign />
      </div>
      <h1 className="text-3xl font-bold">
        divix<span className="text-brand-600">.</span>
      </h1>
    </div>
  )
}