import { api } from './client'

const normalizar = (o) => {
  const f = new Date(o.fechaHora)
  return {
    id: o.id,
    fecha: f.toLocaleDateString('en-CA'), // AAAA-MM-DD en hora local
    hora: f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
    tipo: o.tipoOperacion,
    divisa: o.moneda?.codigo ?? '—',
    monto: Number(o.cantidadDivisa),
    tasa: Number(o.tipoCambioAplicado),
    total: Number(o.importeTotal),
    cajero: o.usuario?.nombre ?? '—',
  }
}

export async function listarOperaciones() {
  return (await api('/operaciones')).map(normalizar)
}

export async function resumenDia() {
  const r = await api('/operaciones/resumen-dia')
  return {
    compras: Number(r.totalCompras),
    ventas: Number(r.totalVentas),
    cantidad: r.cantidadOperaciones,
  }
}

/** El servidor calcula tipo de cambio e importe; aquí solo se manda lo que captura el cajero. */
export const registrarOperacion = ({ idCliente, idMoneda, tipo, monto }) =>
  api('/operaciones', {
    method: 'POST',
    body: { idCliente, idMoneda, tipoOperacion: tipo, cantidadDivisa: String(monto) },
  })

/** Corte abierto del usuario, o null si no hay (o su rol no tiene caja). */
export async function corteActivo() {
  try {
    return await api('/cortes-caja/activo')
  } catch {
    return null
  }
}

/** Cliente genérico para el mostrador; se crea una sola vez si no existe. */
export async function obtenerClienteGeneral() {
  const r = await api('/clientes?busqueda=Cliente&limite=200')
  const existente = r.datos.find((c) => c.identificacion === 'CLIENTE-GENERAL')
  if (existente) return existente
  return api('/clientes', {
    method: 'POST',
    body: { nombre: 'Cliente', apellidoPaterno: 'General', identificacion: 'CLIENTE-GENERAL' },
  })
}

export const consultarAsistente = (pregunta, idConversacion) =>
  api('/asistente-ia/consultar', {
    method: 'POST',
    body: idConversacion ? { pregunta, idConversacion } : { pregunta },
  })

export const listarConversaciones = () => api('/asistente-ia/conversaciones')
export const obtenerConversacion = (id) => api(`/asistente-ia/conversaciones/${encodeURIComponent(id)}`)
