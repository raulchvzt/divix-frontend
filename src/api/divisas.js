import { api } from './client'

/**
 * Divisas activas con su tipo de cambio vigente, en la forma que usan las pantallas.
 * Con incluirSinTasa=true también devuelve las que aún no tienen precio (compra/venta null).
 */
export async function obtenerDivisas({ incluirSinTasa = false } = {}) {
  const [tasas, monedas] = await Promise.all([
    api('/tipos-cambio/actual'),
    incluirSinTasa ? api('/monedas') : Promise.resolve([]),
  ])
  const lista = tasas.map((t) => ({
    id: t.moneda.id,
    codigo: t.moneda.codigo,
    nombre: t.moneda.nombre,
    compra: Number(t.tipoCambioCompra),
    venta: Number(t.tipoCambioVenta),
  }))
  for (const m of monedas) {
    if (m.activo && !lista.some((d) => d.id === m.id)) {
      lista.push({ id: m.id, codigo: m.codigo, nombre: m.nombre, compra: null, venta: null })
    }
  }
  return lista
}

/** Solo administrador. Los importes viajan como texto. */
export const guardarTipoCambio = (idMoneda, compra, venta) =>
  api('/tipos-cambio', {
    method: 'POST',
    body: { idMoneda, tipoCambioCompra: String(compra), tipoCambioVenta: String(venta) },
  })
