import { api } from './client'

// ---- Negocio ----
export const obtenerNegocio = () => api('/negocio')
export const guardarNegocio = (datos) => api('/negocio', { method: 'PUT', body: datos })

// ---- Usuarios ----
export const listarUsuarios = async () => (await api('/usuarios?limite=200')).datos
export const listarRoles = () => api('/roles')
export const crearUsuario = (datos) => api('/usuarios', { method: 'POST', body: datos })
export const activarUsuario = (id) => api(`/usuarios/${id}/activar`, { method: 'PATCH' })
export const desactivarUsuario = (id) => api(`/usuarios/${id}/desactivar`, { method: 'PATCH' })

// ---- Divisas (monedas) ----
export const listarMonedas = () => api('/monedas')
export const crearMoneda = (codigo, nombre) =>
  api('/monedas', { method: 'POST', body: { codigo, nombre } })
export const activarMoneda = (id) => api(`/monedas/${id}/activar`, { method: 'PATCH' })
export const desactivarMoneda = (id) => api(`/monedas/${id}/desactivar`, { method: 'PATCH' })
