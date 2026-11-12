// Bandera de cada divisa (EUR → Unión Europea, USD → Estados Unidos, etc.).
// Las imágenes vienen de la librería flag-icons (MIT) y se incluyen en el
// proyecto, así que no dependen de internet. Si una divisa no tiene bandera
// aquí, se muestra su código como antes.

// Se incluyen todas las banderas; cada una es un archivo aparte que el
// navegador solo descarga cuando se muestra.
const archivos = import.meta.glob('/node_modules/flag-icons/flags/1x1/*.svg', {
  eager: true,
  query: '?no-inline',
  import: 'default',
})
const banderas = Object.fromEntries(
  Object.entries(archivos).map(([ruta, url]) => [ruta.match(/(\w+)\.svg$/)[1], url]),
)

// Divisas cuyo país no coincide con las dos primeras letras del código.
const PAIS_DE_DIVISA = { EUR: 'eu', XAF: null, XOF: null }

/** URL de la bandera de una divisa, o null si no hay. */
function urlBandera(codigo) {
  if (!codigo) return null
  const c = codigo.toUpperCase()
  const pais = c in PAIS_DE_DIVISA ? PAIS_DE_DIVISA[c] : c.slice(0, 2).toLowerCase()
  return (pais && banderas[pais]) || null
}

const TAMANOS = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
}

/**
 * Bandera circular de una divisa.
 *   <Bandera codigo="EUR" />            pequeña, para tablas
 *   <Bandera codigo="EUR" tamano="lg" /> grande, para tarjetas
 */
export default function Bandera({ codigo, tamano = 'sm', className = '' }) {
  const url = urlBandera(codigo)
  const base = `${TAMANOS[tamano]} rounded-full shrink-0 ${className}`

  if (!url) {
    return (
      <span className={`${base} bg-ink-800 text-white font-bold inline-flex items-center justify-center`}>
        {codigo}
      </span>
    )
  }
  return (
    <img
      src={url}
      alt=""
      aria-hidden="true"
      className={`${base} object-cover ring-1 ring-black/10`}
      draggable={false}
    />
  )
}
