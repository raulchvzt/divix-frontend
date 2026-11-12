// Catálogo de divisas del mundo (ISO 4217) para sugerir al agregar una divisa.
// Sale de los datos que ya trae el navegador (Intl), con nombres en español y
// su símbolo, así que no hay que mantener una lista a mano.

// Códigos que no son monedas de un país (oro, plata, fondos, pruebas...).
const EXCLUIDAS = new Set(['MXN', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XDR', 'XPD', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX'])

// Las más comunes en una casa de cambio salen primero.
const COMUNES = ['USD', 'EUR', 'CAD', 'GBP', 'JPY', 'CHF', 'AUD', 'CNY', 'BRL', 'ARS', 'COP', 'CLP', 'PEN', 'GTQ']

// Respaldo por si el navegador es muy viejo y no tiene la lista.
const RESPALDO = [...COMUNES, 'BOB', 'CRC', 'DOP', 'HNL', 'NIO', 'PAB', 'PYG', 'UYU', 'VES', 'KRW', 'INR', 'HKD', 'SGD', 'NZD', 'SEK', 'NOK', 'DKK']

const quitarAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function simbolo(codigo) {
  try {
    const partes = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: codigo,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(1)
    const s = partes.find((p) => p.type === 'currency')?.value ?? codigo
    return s.length <= 5 ? s : codigo
  } catch {
    return codigo
  }
}

function construir() {
  let codigos = RESPALDO
  let nombres = null
  try {
    codigos = Intl.supportedValuesOf('currency')
  } catch {
    // se queda el respaldo
  }
  try {
    nombres = new Intl.DisplayNames(['es-MX', 'es'], { type: 'currency' })
  } catch {
    // sin nombres traducidos
  }

  return codigos
    .filter((c) => !EXCLUIDAS.has(c))
    .map((codigo) => {
      const nombre = nombres?.of(codigo) ?? codigo
      const bonito = nombre.charAt(0).toUpperCase() + nombre.slice(1)
      return { codigo, nombre: bonito, simbolo: simbolo(codigo), busqueda: quitarAcentos(`${codigo} ${bonito}`) }
    })
    .filter((d) => d.nombre !== d.codigo)
    .sort((a, b) => {
      const ia = COMUNES.indexOf(a.codigo)
      const ib = COMUNES.indexOf(b.codigo)
      if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
      return a.codigo.localeCompare(b.codigo)
    })
}

let catalogo = null
const obtenerCatalogo = () => (catalogo ??= construir())

/**
 * Divisas que coinciden con lo escrito.
 *  - en el campo código: las que EMPIEZAN con esas letras (G → GBP, GTQ, GEL…)
 *  - en el campo nombre: las que CONTIENEN el texto en su nombre (libra → GBP, EGP…)
 */
export function buscarDivisas(texto, { porNombre = false, limite = 8 } = {}) {
  const t = quitarAcentos(texto.trim())
  if (!t) return []
  const lista = obtenerCatalogo()
  const coincide = porNombre
    ? (d) => d.busqueda.includes(t)
    : (d) => d.codigo.toLowerCase().startsWith(t)
  return lista.filter(coincide).slice(0, limite)
}

/** Datos de una divisa por su código exacto, o null si no es un código válido. */
export const divisaPorCodigo = (codigo) =>
  obtenerCatalogo().find((d) => d.codigo === codigo?.toUpperCase()) ?? null
