// Cálculos de la pantalla de Estadísticas.
// Reciben las operaciones ya normalizadas por api/operaciones.js
// ({ fecha: 'AAAA-MM-DD', hora: 'HH:MM', tipo, divisa, total, cajero, ... }).

export const PERIODOS = [
  { id: 'hoy', label: 'Hoy', dias: 1 },
  { id: '7d', label: '7 días', dias: 7 },
  { id: '30d', label: '30 días', dias: 30 },
  { id: 'todo', label: 'Todo', dias: null },
]

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Fecha local en formato AAAA-MM-DD (el mismo que usa normalizar()). */
const fechaLocal = (d) => d.toLocaleDateString('en-CA')

function restarDias(dias) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d
}

export function filtrarPorPeriodo(operaciones, periodoId) {
  const periodo = PERIODOS.find((p) => p.id === periodoId)
  if (!periodo?.dias) return operaciones
  const desde = fechaLocal(restarDias(periodo.dias - 1))
  return operaciones.filter((o) => o.fecha >= desde)
}

const suma = (lista) => lista.reduce((s, o) => s + o.total, 0)

export function indicadores(operaciones) {
  const compras = operaciones.filter((o) => o.tipo === 'compra')
  const ventas = operaciones.filter((o) => o.tipo === 'venta')
  const volumen = suma(operaciones)
  const porDivisa = volumenPorDivisa(operaciones, Infinity)
  return {
    cantidad: operaciones.length,
    volumen,
    ticketPromedio: operaciones.length ? volumen / operaciones.length : 0,
    compras: { cantidad: compras.length, total: suma(compras) },
    ventas: { cantidad: ventas.length, total: suma(ventas) },
    divisaTop: porDivisa[0] ?? null,
  }
}

/**
 * Compras y ventas agrupadas en el tiempo. La agrupación se adapta al periodo:
 * por hora si es "hoy", por día hasta ~2 meses, y por mes si el rango es mayor.
 */
export function volumenEnElTiempo(operaciones, periodoId) {
  if (periodoId === 'hoy') {
    const horas = new Map()
    for (const o of operaciones) {
      const h = o.hora.slice(0, 2)
      const fila = horas.get(h) ?? { clave: h, etiqueta: `${h}:00`, compra: 0, venta: 0 }
      fila[o.tipo] += o.total
      horas.set(h, fila)
    }
    // Se rellenan las horas sin movimiento entre la primera y la última del día.
    const claves = [...horas.keys()].map(Number)
    for (let h = Math.min(...claves); h <= Math.max(...claves); h++) {
      const c = String(h).padStart(2, '0')
      if (!horas.has(c)) horas.set(c, { clave: c, etiqueta: `${c}:00`, compra: 0, venta: 0 })
    }
    return [...horas.values()].sort((a, b) => a.clave.localeCompare(b.clave))
  }

  const periodo = PERIODOS.find((p) => p.id === periodoId)
  const fechas = operaciones.map((o) => o.fecha).sort()
  const primera = fechas[0]
  const spanDias = primera
    ? (new Date() - new Date(primera + 'T00:00:00')) / 86_400_000
    : 0
  const porMes = !periodo?.dias && spanDias > 62

  const grupos = new Map()
  // Por día se rellenan los días sin movimiento para que la gráfica no "salte" fechas.
  if (!porMes) {
    const dias = periodo?.dias ?? Math.max(1, Math.ceil(spanDias) + 1)
    for (let i = dias - 1; i >= 0; i--) {
      const f = fechaLocal(restarDias(i))
      grupos.set(f, { clave: f, etiqueta: etiquetaDia(f), compra: 0, venta: 0 })
    }
  }

  for (const o of operaciones) {
    const clave = porMes ? o.fecha.slice(0, 7) : o.fecha
    const etiqueta = porMes ? etiquetaMes(clave) : etiquetaDia(clave)
    const fila = grupos.get(clave) ?? { clave, etiqueta, compra: 0, venta: 0 }
    fila[o.tipo] += o.total
    grupos.set(clave, fila)
  }
  return [...grupos.values()].sort((a, b) => a.clave.localeCompare(b.clave))
}

const etiquetaDia = (f) => {
  const [, m, d] = f.split('-')
  return `${Number(d)} ${MESES[Number(m) - 1]}`
}
const etiquetaMes = (f) => {
  const [a, m] = f.split('-')
  return `${MESES[Number(m) - 1]} ${a.slice(2)}`
}

/** Volumen en MXN por divisa, de mayor a menor. Lo que pase de `maximo` se junta en "Otras". */
export function volumenPorDivisa(operaciones, maximo = 5) {
  const mapa = new Map()
  for (const o of operaciones) {
    const fila = mapa.get(o.divisa) ?? { divisa: o.divisa, total: 0, cantidad: 0 }
    fila.total += o.total
    fila.cantidad += 1
    mapa.set(o.divisa, fila)
  }
  const lista = [...mapa.values()].sort((a, b) => b.total - a.total)
  const volumen = suma(operaciones) || 1
  const conPct = (f) => ({ ...f, pct: (f.total / volumen) * 100 })

  if (lista.length <= maximo) return lista.map(conPct)
  const resto = lista.slice(maximo)
  return [
    ...lista.slice(0, maximo),
    {
      divisa: 'Otras',
      total: resto.reduce((s, f) => s + f.total, 0),
      cantidad: resto.reduce((s, f) => s + f.cantidad, 0),
    },
  ].map(conPct)
}

/** Volumen y número de operaciones por cajero, de mayor a menor volumen. */
export function porCajero(operaciones, maximo = 6) {
  const mapa = new Map()
  for (const o of operaciones) {
    const fila = mapa.get(o.cajero) ?? { cajero: o.cajero, total: 0, cantidad: 0 }
    fila.total += o.total
    fila.cantidad += 1
    mapa.set(o.cajero, fila)
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, maximo)
}

/** Número de operaciones por hora del día, solo dentro del horario con movimiento. */
export function porHoraDelDia(operaciones) {
  const conteo = new Array(24).fill(0)
  for (const o of operaciones) conteo[Number(o.hora.slice(0, 2))] += 1
  const conMovimiento = conteo.map((c, h) => (c ? h : null)).filter((h) => h !== null)
  if (conMovimiento.length === 0) return []
  const desde = Math.min(...conMovimiento)
  const hasta = Math.max(...conMovimiento)
  const filas = []
  for (let h = desde; h <= hasta; h++) {
    filas.push({ hora: `${String(h).padStart(2, '0')}:00`, cantidad: conteo[h] })
  }
  return filas
}
