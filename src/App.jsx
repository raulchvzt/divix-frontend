import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
        </div>
      </div>
    </BrowserRouter>
  )
}