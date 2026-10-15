import { useEffect, useState } from 'react'

/**
 * Carga datos al montar y cada vez que cambian las dependencias.
 * Devuelve { datos, error, cargando }.
 */
export function useCarga(cargar, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, error: '', cargando: true })

  useEffect(() => {
    let vigente = true
    cargar()
      .then((datos) => vigente && setEstado({ datos, error: '', cargando: false }))
      .catch((e) => vigente && setEstado({ datos: null, error: e.message, cargando: false }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)

  return estado
}
