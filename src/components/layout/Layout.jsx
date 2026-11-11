import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        {/* La key hace que la animación de entrada se repita al cambiar de página. */}
        <main key={pathname} className="pagina px-8 py-8 max-w-[1500px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}