import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Ventanilla from './pages/Ventanilla'
import TiposDeCambio from './pages/TiposDeCambio'
import Placeholder from './pages/Placeholder'
import Login from './pages/Login.jsx'
import Caja from './pages/Caja'
import Operaciones from './pages/Operaciones.jsx'
import Configuracion from './pages/Configuracion.jsx'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Ventanilla />} />
          <Route path="/tipos-de-cambio" element={<TiposDeCambio />} />
          <Route
            path="/caja"
            element={<Caja />}
          />
         <Route path="/operaciones" element={<Operaciones />} />

          <Route path="/configuracion" element={<Configuracion />} />

          <Route
            path="/ayuda"
            element={<Placeholder seccion="Administración" titulo="Centro de ayuda" descripcion="Encuentra respuestas y soporte." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

