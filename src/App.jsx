import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Ventanilla from './pages/Ventanilla'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="px-8 py-8 max-w-[1500px]">
            <Ventanilla />
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}