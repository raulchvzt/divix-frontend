import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="px-8 py-8 max-w-[1500px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}