// Control de billetes de USD por denominación (la misma lógica que el backend
// en common/billetes.ts). Un mapa de billetes es { "100": 5, "50": 2, ... }.

export const DENOMINACIONES = [100, 50, 20, 10, 5, 2, 1]

export const billetesVacios = () => Object.fromEntries(DENOMINACIONES.map((d) => [String(d), 0]))

export const totalBilletes = (mapa) => DENOMINACIONES.reduce((t, d) => t + d * (Number(mapa?.[d]) || 0), 0)

export const cantidadBilletes = (mapa) => DENOMINACIONES.reduce((t, d) => t + (Number(mapa?.[d]) || 0), 0)

/** "4 de $100, 2 de $50" para mostrar en el ticket o en una tabla. */
export const describirBilletes = (mapa) =>
  DENOMINACIONES.filter((d) => mapa?.[d] > 0)
    .map((d) => `${mapa[d]} de $${d}`)
    .join(', ')

/** Denominaciones en las que se piden más billetes de los que hay. */
export const faltantes = (mapa, disponibles) =>
  disponibles ? DENOMINACIONES.filter((d) => (Number(mapa?.[d]) || 0) > (disponibles[d] ?? 0)) : []

/**
 * Billetes sugeridos para un importe: los más grandes primero. Si se pasan los
 * `disponibles`, solo usa los que hay en caja y busca una combinación exacta
 * (por ejemplo, $60 sin billetes de $10 → 3 de $20). Devuelve null si no se
 * puede formar el importe con lo que hay.
 */
export function sugerirBilletes(monto, disponibles = null) {
  const objetivo = Math.round(Number(monto))
  if (!objetivo || objetivo < 0 || objetivo !== Number(monto)) return null

  if (!disponibles) {
    const r = billetesVacios()
    let resto = objetivo
    for (const d of DENOMINACIONES) {
      r[d] = Math.floor(resto / d)
      resto -= r[d] * d
    }
    return r
  }

  // Búsqueda con retroceso: de cada denominación prueba primero la mayor cantidad posible.
  const r = billetesVacios()
  const buscar = (i, resto) => {
    if (resto === 0) return true
    if (i === DENOMINACIONES.length) return false
    const d = DENOMINACIONES[i]
    const maximo = Math.min(disponibles[d] ?? 0, Math.floor(resto / d))
    // Basta con probar unas pocas cantidades por denominación para encontrar una combinación.
    for (let n = maximo; n >= Math.max(0, maximo - 5); n--) {
      r[d] = n
      if (buscar(i + 1, resto - n * d)) return true
    }
    r[d] = 0
    return false
  }
  return buscar(0, objetivo) ? r : null
}

/** true si la selección de billetes está lista para enviarse. */
export function billetesValidos(monto, modo, disponibles, value) {
  const objetivo = Number(monto) || 0
  if (!Number.isInteger(objetivo) || objetivo <= 0) return false
  if (totalBilletes(value) !== objetivo) return false
  return faltantes(value, modo === 'entregar' ? disponibles : null).length === 0
}
