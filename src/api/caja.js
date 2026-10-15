import { api } from './client'

export const obtenerCorteActivo = () => api('/cortes-caja/activo')
export const obtenerUltimoCierre = () => api('/cortes-caja/ultimo-cierre')
export const abrirCorte = (body) => api('/cortes-caja/abrir', { method: 'POST', body })
export const cerrarCorte = (id, body) => api(`/cortes-caja/${id}/cerrar`, { method: 'POST', body })
export const registrarMovimiento = (id, body) =>
  api(`/cortes-caja/${id}/movimientos`, { method: 'POST', body })
