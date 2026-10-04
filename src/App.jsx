import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Ventanilla from './pages/Ventanilla'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Ventanilla />} />
          <Route
            path="/tipos-de-cambio"
            element={<Placeholder seccion="Operación" titulo="Tipos de cambio" descripcion="Administra los precios de compra y venta de cada divisa." />}
          />
          <Route
            path="/caja"
            element={<Placeholder seccion="Operación" titulo="Caja y cortes" descripcion="Controla el efectivo y realiza el corte de tu turno." />}
          />
          <Route
            path="/operaciones"
            element={<Placeholder seccion="Operación" titulo="Operaciones" descripcion="Consulta el historial completo de transacciones." />}
          />
          <Route
            path="/configuracion"
            element={<Placeholder seccion="Administración" titulo="Configuración" descripcion="Ajusta usuarios, divisas y preferencias del sistema." />}
          />
          <Route
            path="/ayuda"
            element={<Placeholder seccion="Administración" titulo="Centro de ayuda" descripcion="Encuentra respuestas y soporte." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}