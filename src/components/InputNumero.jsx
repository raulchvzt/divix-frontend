import { useLayoutEffect, useRef } from 'react'

/**
 * Campo para cantidades que muestra separador de miles mientras se escribe
 * (10000000 → 10,000,000).
 *
 * El valor que recibe y entrega sigue siendo el número "limpio" como texto
 * ("10000000.50"), así que se usa igual que un <input type="number">:
 *   <InputNumero value={monto} onChange={(e) => setMonto(e.target.value)} />
 *
 * Props extra:
 *  - decimales: cuántos decimales se permiten (0 para solo enteros). Default 2.
 *  - min: valor mínimo; si no se cumple, el formulario no se envía.
 *  - multiploDe: el valor debe ser múltiplo de este número (p. ej. billetes de 100).
 */

/** Deja solo dígitos y un punto decimal, con el máximo de decimales indicado. */
function limpiar(texto, decimales) {
  let [entero = '', ...resto] = String(texto ?? '').replace(/[^\d.]/g, '').split('.')
  entero = entero.replace(/^0+(?=\d)/, '')
  if (decimales === 0 || resto.length === 0) return entero
  const fraccion = resto.join('').slice(0, decimales)
  return `${entero || '0'}.${fraccion}`
}

/** Agrega las comas de miles a un número limpio, respetando lo que se está escribiendo. */
function formatear(limpio) {
  if (limpio === '') return ''
  const [entero, fraccion] = limpio.split('.')
  const conComas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fraccion === undefined ? conComas : `${conComas}.${fraccion}`
}

/** Cuántos caracteres "útiles" (dígitos o punto) hay antes de la posición dada. */
const utilesAntes = (texto, pos) => texto.slice(0, pos).replace(/[^\d.]/g, '').length

export default function InputNumero({ value, onChange, decimales = 2, min, multiploDe, ...props }) {
  const ref = useRef(null)
  const cursor = useRef(null)
  const mostrado = formatear(limpiar(value, decimales))

  // Al agregar o quitar comas el cursor saltaría al final; lo regresamos a su lugar.
  useLayoutEffect(() => {
    const input = ref.current
    if (!input || cursor.current === null || document.activeElement !== input) return
    let pos = 0
    let vistos = 0
    while (pos < mostrado.length && vistos < cursor.current) {
      if (/[\d.]/.test(mostrado[pos])) vistos++
      pos++
    }
    input.setSelectionRange(pos, pos)
    cursor.current = null
  }, [mostrado])

  // Validación del mínimo, ya que un campo de texto no entiende el atributo min.
  useLayoutEffect(() => {
    const input = ref.current
    if (!input) return
    const numero = parseFloat(limpiar(value, decimales))
    const bajoMinimo = min !== undefined && value !== '' && !(numero >= Number(min))
    const noMultiplo = multiploDe && value !== '' && numero % Number(multiploDe) !== 0
    input.setCustomValidity(
      bajoMinimo
        ? `El valor mínimo es ${formatear(String(min))}.`
        : noMultiplo
          ? `Debe ser múltiplo de ${formatear(String(multiploDe))}.`
          : '',
    )
  }, [value, min, multiploDe, decimales])

  const cambiar = (e) => {
    const texto = e.target.value
    const nuevo = limpiar(texto, decimales)
    cursor.current = utilesAntes(texto, e.target.selectionStart ?? texto.length)
    // El resto de la app recibe el número sin comas, igual que antes.
    onChange?.({ target: { name: e.target.name, value: nuevo } })
  }

  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode={decimales === 0 ? 'numeric' : 'decimal'}
      autoComplete="off"
      value={mostrado}
      onChange={cambiar}
    />
  )
}
