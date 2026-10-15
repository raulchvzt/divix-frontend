import { useRef, useState } from 'react'
import { iniciarSesion } from '../api/auth.js'
import { ApiError } from '../api/client.js'

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const usernameInput = useRef(null)
  const passwordInput = useRef(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    if (!username.trim()) {
      setError('Introduce tu usuario. No puede contener únicamente espacios.')
      usernameInput.current.focus()
      return
    }
    if (!password) {
      setError('Introduce tu contraseña.')
      passwordInput.current.focus()
      return
    }
    submitting.current = true
    setLoading(true)
    try {
      const user = await iniciarSesion(username.trim(), password)
      setPassword('')
      onSuccess(user)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No se pudo conectar con el servicio. Inténtalo más tarde.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
      <div className="form-field">
        <label htmlFor="username">Usuario</label>
        <input ref={usernameInput} id="username" name="username" autoComplete="username"
          required value={username} onChange={(event) => setUsername(event.target.value)}
          disabled={loading} autoCapitalize="none" spellCheck={false} />
      </div>
      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <div className="password-field">
          <input ref={passwordInput} id="password" name="password" type={showPassword ? 'text' : 'password'}
            autoComplete="current-password" required value={password}
            onChange={(event) => setPassword(event.target.value)} disabled={loading} />
          <button className="password-toggle" type="button" disabled={loading}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-controls="password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>
      <div className="form-feedback" aria-live="assertive" aria-atomic="true">
        {error && <p className="error-message">{error}</p>}
      </div>
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
      <span className="sr-only" role="status">{loading ? 'Verificando los datos de acceso.' : ''}</span>
    </form>
  )
}
