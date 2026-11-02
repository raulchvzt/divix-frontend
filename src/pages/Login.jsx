import { Navigate, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { obtenerToken } from '../api/client.js'
import { rutaInicio } from '../api/permisos.js'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()

  if (obtenerToken()) return <Navigate to={rutaInicio()} replace />

  return (
    <main className="login-page">
      <div className="login-container">
        <header className="brand">
          <div className="brand-mark" aria-hidden="true">D</div>
          <p className="brand-name">Divix</p>
          <p className="brand-description">Sistema de gestión para centros cambiarios</p>
          <div className="currency-engraving" aria-hidden="true">
            <svg viewBox="0 0 320 220" fill="none">
              {Array.from({ length: 12 }, (_, index) => (
                <ellipse key={index} cx="160" cy="110" rx={70 + index * 7} ry={35 + index * 6} />
              ))}
              <path className="exchange-symbol" d="M125 94h76m-17-17 17 17-17 17M195 130h-76m17-17-17 17 17 17" />
            </svg>
          </div>
          <p className="brand-audience">Acceso para cajeros y administradores</p>
        </header>
        <section className="login-card" aria-labelledby="login-heading">
          <h1 id="login-heading" tabIndex={-1}>Bienvenido a Divix</h1>
          <p className="card-description">Ingresa tus datos para acceder al sistema.</p>
          <LoginForm onSuccess={() => navigate(rutaInicio(), { replace: true })} />
        </section>
        <footer className="login-footer">Acceso para cajeros y administradores</footer>
      </div>
    </main>
  )
}
