import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import DivixAI from '../ventanilla/DivixAI'

export default function Layout() {
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [iaAbierta, setIaAbierta] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        iaAbierta={iaAbierta}
        onIA={() => setIaAbierta((v) => !v)}
      />
      <div className="flex-1 min-w-0">
        <Topbar onMenu={() => setMenuAbierto(true)} />
        {/* La key hace que la animación de entrada se repita al cambiar de página. */}
        <main key={pathname} className="pagina px-4 py-5 sm:px-6 lg:px-8 lg:py-8 max-w-[1500px]">
          <Outlet />
        </main>
      </div>

      {/* Chat de Divix AI: panel pegado al menú izquierdo, disponible en todas las pantallas. */}
      {iaAbierta && (
        <div className="fixed inset-0 z-50 p-2 lg:inset-auto lg:top-3 lg:bottom-3 lg:left-[256px] lg:w-[400px] lg:p-0">
          <DivixAI lleno onClose={() => setIaAbierta(false)} />
        </div>
      )}
    </div>
  )
}