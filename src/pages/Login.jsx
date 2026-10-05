import { useEffect, useRef, useState } from 'react'
import LoginForm from '../components/LoginForm.jsx'
import { isDemoMode } from '../services/auth.js'
import './Login.css'

export default function Login() {
  const [user, setUser] = useState(null)
  const heading = useRef(null)
  const previousUser = useRef(null)

  useEffect(() => {
    if (user || previousUser.current) heading.current?.focus()
    previousUser.current = user
  }, [user])

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
          {isDemoMode && <span className="demo-badge">Modo demostración</span>}
          <h1 id="login-heading" ref={heading} tabIndex={-1}>
            {user ? 'Acceso de prueba exitoso' : 'Bienvenido a Divix'}
          </h1>
          {user ? (
            <div className="success-content">
              <p>La demostración se completó correctamente. No se ha creado una sesión real.</p>
              <dl><dt>Nombre</dt><dd>{user.name}</dd><dt>Rol</dt><dd>{user.role}</dd></dl>
              <button className="primary-button" onClick={() => setUser(null)}>Volver al login</button>
            </div>
          ) : (
            <>
              <p className="card-description">Ingresa tus datos para acceder al sistema.</p>
              <LoginForm onSuccess={setUser} />
              {isDemoMode && (
                <aside className="demo-info" aria-label="Datos ficticios de prueba">
                  <strong>Datos ficticios de prueba</strong>
                  <p>Usuario: <code>cajero.demo</code> o <code>admin.demo</code></p>
                  <p>Contraseña: <code>DivixDemo123!</code></p>
                  <p>Otros datos mostrarán un error de credenciales.</p>
                </aside>
              )}
            </>
          )}
        </section>
        <footer className="login-footer">Acceso para cajeros y administradores</footer>
      </div>
    </main>
  )
}
