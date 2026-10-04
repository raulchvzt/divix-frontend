// Datos ficticios, exclusivamente para desarrollo. No representan cuentas reales.
const demoUsers = [
  { username: 'cajero.demo', password: 'DivixDemo123!', name: 'Alex Martínez', role: 'Cajero' },
  { username: 'admin.demo', password: 'DivixDemo123!', name: 'Andrea López', role: 'Administrador' },
]

export const isDemoMode = import.meta.env.DEV

export class AuthError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export async function authenticate({ username, password }) {
  // No hay endpoint acordado: producción siempre falla de forma segura.
  if (!isDemoMode) {
    throw new AuthError('SERVICE_UNAVAILABLE', 'El servicio de acceso no está disponible. Inténtalo más tarde.')
  }

  await new Promise((resolve) => setTimeout(resolve, 800))
  const user = demoUsers.find((entry) => entry.username === username && entry.password === password)
  if (!user) {
    throw new AuthError('INVALID_CREDENTIALS', 'Usuario o contraseña incorrectos.')
  }
  return { name: user.name, role: user.role }
}
