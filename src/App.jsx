import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Ventanilla from './pages/Ventanilla'
import TiposDeCambio from './pages/TiposDeCambio'
import Login from './pages/Login.jsx'
import Caja from './pages/Caja'
import Operaciones from './pages/Operaciones.jsx'
import Configuracion from './pages/Configuracion.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'

// Se carga aparte para que la librería de gráficas no pese en el resto de la app.
const Estadisticas = lazy(() => import('./pages/Estadisticas.jsx'))



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<Login />} />
        <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
          <Route path="/" element={<RutaProtegida ruta="/"><Ventanilla /></RutaProtegida>} />
          <Route path="/tipos-de-cambio" element={<RutaProtegida ruta="/tipos-de-cambio"><TiposDeCambio /></RutaProtegida>} />
          <Route path="/caja" element={<RutaProtegida ruta="/caja"><Caja /></RutaProtegida>} />
          <Route path="/operaciones" element={<RutaProtegida ruta="/operaciones"><Operaciones /></RutaProtegida>} />
          <Route path="/estadisticas" element={<RutaProtegida ruta="/estadisticas"><Suspense fallback={<p className="text-sm text-slate-400">Cargando…</p>}><Estadisticas /></Suspense></RutaProtegida>} />
          <Route path="/configuracion" element={<RutaProtegida ruta="/configuracion"><Configuracion /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  )
}

