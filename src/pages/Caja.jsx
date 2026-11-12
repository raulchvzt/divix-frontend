import { useState } from 'react'
import { Wallet, Vault, ArrowRightLeft, Check } from 'lucide-react'
import { dinero } from '../utils/formato'
import { useCarga } from '../api/useCarga'
import InputNumero from '../components/InputNumero'
import {
  obtenerCorteActivo,
  obtenerUltimoCierre,
  abrirCorte,
  cerrarCorte,
  registrarMovimiento,
} from '../api/caja'

const monedas = ['MXN', 'USD', 'CAD', 'CHF', 'GBP', 'EUR']
const denominaciones = [100, 50, 20, 10, 5, 2, 1]
const vacio = () => Object.fromEntries(monedas.map((moneda) => [moneda, '']))
const cantidadesVacias = () => Object.fromEntries(denominaciones.map((valor) => [valor, '']))
const num = (valor) => Number(valor ?? 0)
const importe = (valor) => Math.round(Number(valor) * 100) / 100
const fechaCorta = (f) => new Date(f).toLocaleDateString('es-MX')
const hora = (f) => new Date(f).toLocaleTimeString('es-MX')
// En el conteo de dólares se captura el IMPORTE de cada denominación y se calcula cuántos billetes son.
const totalUSD = (importes) => denominaciones.reduce((total, valor) => total + Number(importes[valor] || 0), 0)
const cuantosBilletes = (valor, importe) => (importe === '' ? null : Number(importe) / valor)
const etiquetaMovimiento = { entrada: 'entrada', salida: 'salida', reposicion: 'reposición' }

const inputClase = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm'
const botonClase = 'rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50'

export default function Caja() {
  const [version, setVersion] = useState(0)
  const { datos: corteActivo, error: errorCarga, cargando } = useCarga(obtenerCorteActivo, [version])
  const { datos: ultimo, cargando: cargandoUltimo } = useCarga(obtenerUltimoCierre, [version])
  const [fondos, setFondos] = useState(vacio)
  const [reserva, setReserva] = useState('')
  const [billetes, setBilletes] = useState(cantidadesVacias)
  const [contado, setContado] = useState(vacio)
  const [reservaContada, setReservaContada] = useState('')
  const [corte, setCorte] = useState(false)
  const [reposicion, setReposicion] = useState('')
  const [movimiento, setMovimiento] = useState({ moneda: 'MXN', tipo: 'entrada', monto: '', concepto: '' })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Misma forma que usaba la pantalla: saldos por moneda y reserva (en pesos, no en centavos)
  const origen = corteActivo ?? null
  const caja = origen
    ? {
        estado: 'abierta',
        fecha: fechaCorta(origen.fechaApertura),
        reserva: num(origen.esperados.reserva),
        saldos: Object.fromEntries(monedas.map((m) => [m, num(origen.esperados[m])])),
        movimientos: origen.movimientos,
      }
    : ultimo
      ? {
          estado: 'cerrada',
          fecha: fechaCorta(ultimo.fechaCierre),
          reserva: num(ultimo.reservaFinal),
          saldos: Object.fromEntries(
            monedas.map((m) => [m, m === 'MXN' ? num(ultimo.efectivoFinal) : num(ultimo.saldosFinales?.[m])]),
          ),
          movimientos: [],
        }
      : null

  // Ejecuta una llamada al backend mostrando error o aviso, y recarga los datos.
  async function ejecutar(accion, aviso) {
    setError('')
    setMensaje('')
    setEnviando(true)
    try {
      await accion()
      setMensaje(aviso)
      setVersion((v) => v + 1)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setEnviando(false)
    }
  }

  function abrir(event) {
    event.preventDefault()
    const saldosIniciales = Object.fromEntries(
      monedas
        .filter((m) => m !== 'MXN')
        .map((m) => [m, String(m === 'USD' ? totalUSD(billetes) : importe(fondos[m]))]),
    )
    ejecutar(
      () => abrirCorte({ efectivoInicial: String(importe(fondos.MXN)), reservaInicial: String(importe(reserva)), saldosIniciales }),
      'Fondo inicial guardado. Caja abierta.',
    )
  }

  function abrirConUltimoCierre() {
    ejecutar(
      () =>
        abrirCorte({
          efectivoInicial: ultimo.efectivoFinal,
          reservaInicial: ultimo.reservaFinal,
          saldosIniciales: ultimo.saldosFinales ?? {},
        }),
      'Nueva apertura con los saldos del último corte.',
    )
  }

  async function reponer(event) {
    event.preventDefault()
    const ok = await ejecutar(
      () => registrarMovimiento(origen.id, { tipoMovimiento: 'reposicion', monto: String(importe(reposicion)) }),
      'Reposición registrada. El total de pesos no cambia.',
    )
    if (ok) setReposicion('')
  }

  async function registrar(event) {
    event.preventDefault()
    const ok = await ejecutar(
      () =>
        registrarMovimiento(origen.id, {
          tipoMovimiento: movimiento.tipo,
          moneda: movimiento.moneda,
          monto: String(importe(movimiento.monto)),
          concepto: movimiento.concepto.trim(),
        }),
      'Movimiento registrado.',
    )
    if (ok) setMovimiento({ ...movimiento, monto: '', concepto: '' })
  }

  async function cerrar(event) {
    event.preventDefault()
    const saldosFinales = Object.fromEntries(
      monedas
        .filter((m) => m !== 'MXN')
        .map((m) => [m, String(m === 'USD' ? totalUSD(billetes) : importe(contado[m]))]),
    )
    const ok = await ejecutar(
      () =>
        cerrarCorte(origen.id, {
          efectivoFinal: String(importe(contado.MXN)),
          reservaFinal: String(importe(reservaContada)),
          saldosFinales,
        }),
      'Corte guardado. El efectivo contado será el fondo de la siguiente apertura.',
    )
    if (ok) setCorte(false)
  }

  function conteoUSD() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2">Billete USD</th><th>Importe USD</th><th className="text-right">Cantidad de billetes</th></tr></thead>
          <tbody>{denominaciones.map((valor) => {
            const cantidad = cuantosBilletes(valor, billetes[valor])
            const noCuadra = cantidad !== null && !Number.isInteger(cantidad)
            return <tr key={valor} className="border-t border-line">
              <td className="py-3">{dinero(valor)}</td>
              <td className="py-2">
                <InputNumero aria-label={`Importe en billetes de ${valor} dólares`} decimales={0} multiploDe={valor} required placeholder="0" className={`${inputClase} max-w-40 ${noCuadra ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`} value={billetes[valor]} onChange={(event) => setBilletes({ ...billetes, [valor]: event.target.value })} />
                {noCuadra && <p className="text-xs font-medium text-red-600 mt-1">Debe ser múltiplo de {dinero(valor)}</p>}
              </td>
              <td className={`text-right font-medium ${noCuadra ? 'text-red-600' : ''}`}>
                {cantidad === null ? '—' : noCuadra ? 'No cuadra' : `${cantidad.toLocaleString('en-US')} ${cantidad === 1 ? 'billete' : 'billetes'}`}
              </td>
            </tr>
          })}</tbody>
          <tfoot><tr className="border-t border-line font-bold"><td className="py-3">Total USD</td><td>{dinero(totalUSD(billetes))}</td><td className="text-right">{denominaciones.reduce((t, valor) => t + Math.floor(cuantosBilletes(valor, billetes[valor]) ?? 0), 0).toLocaleString('en-US')} billetes</td></tr></tfoot>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">Operación / <span className="font-medium text-brand-600">Caja y cortes</span></p><h1 className="mt-2 text-2xl sm:text-[32px] font-bold tracking-tight">Caja y cortes</h1><p className="mt-1 text-sm text-slate-500">El cierre de un día es el fondo inicial del siguiente.</p></div>
        {caja?.estado === 'abierta' && !corte && <button className={botonClase} onClick={() => { setCorte(true); setBilletes(cantidadesVacias()); setContado(vacio()); setReservaContada(''); setMensaje(''); setError('') }}>Realizar corte</button>}
      </div>
      <p className="mb-5 rounded-xl border border-line bg-white px-4 py-3 text-sm text-slate-500">Los saldos esperados incluyen las compras y ventas que registraste en Ventanilla desde que abriste caja, más los movimientos de esta pantalla. Cada moneda conserva su propio saldo.</p>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {mensaje && <p role="status" className="mb-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">{mensaje}</p>}

      {errorCarga && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorCarga}</p>}
      {(cargando || cargandoUltimo) && !caja ? <p className="text-sm text-slate-400">Cargando caja…</p> : !caja ? <form onSubmit={abrir} className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Registrar fondo inicial</h2><p className="mt-1 mb-6 text-sm text-slate-500">Captura el efectivo del cierre anterior. Ingresa 0 cuando no haya existencias.</p>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4"><label className="block text-sm font-medium">Pesos en caja fuerte (MXN)<InputNumero className={`${inputClase} mt-2`} min="0" required placeholder="Ej. 1000000" value={reserva} onChange={(event) => setReserva(event.target.value)} /></label>
            {monedas.filter((moneda) => moneda !== 'USD').map((moneda) => <label key={moneda} className="block text-sm font-medium">{moneda === 'MXN' ? 'Pesos del cajero (MXN)' : `Saldo ${moneda}`}<InputNumero className={`${inputClase} mt-2`} min="0" required placeholder={moneda === 'MXN' ? 'Ej. 100000' : '0.00'} value={fondos[moneda]} onChange={(event) => setFondos({ ...fondos, [moneda]: event.target.value })} /></label>)}
            <p className="text-sm font-semibold">Total MXN: {dinero(Number(reserva || 0) + Number(fondos.MXN || 0))}</p>
          </div><div><h3 className="mb-3 font-semibold">Dólares por denominación</h3>{conteoUSD()}</div>
        </div><button className={`${botonClase} mt-6`} type="submit" disabled={enviando}>Guardar fondo y abrir caja</button>
      </form> : <>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[{ nombre: 'Caja fuerte · MXN', valor: caja.reserva, Icono: Vault }, { nombre: 'Caja del cajero · MXN', valor: caja.saldos.MXN, Icono: Wallet }, { nombre: 'Total disponible · MXN', valor: caja.reserva + caja.saldos.MXN, Icono: ArrowRightLeft }].map(({ nombre, valor, Icono }) => <div key={nombre} className="min-w-0 rounded-2xl border border-line bg-white p-5"><Icono size={22} className="mb-3 text-brand-600" /><p className="text-sm text-slate-500">{nombre}</p><p className="mt-2 text-xl sm:text-2xl font-bold [overflow-wrap:anywhere]">{dinero(valor)}</p></div>)}
        </div>
        <section className="mb-6 rounded-2xl border border-line bg-white p-6"><div className="mb-4 flex flex-wrap justify-between gap-2"><h2 className="font-bold">Saldos por moneda</h2><span className="text-sm text-slate-500">{caja.estado === 'abierta' ? 'Caja abierta' : 'Caja cerrada'} · {caja.fecha}</span></div><div className="grid grid-cols-2 gap-4 md:grid-cols-5">{monedas.filter((moneda) => moneda !== 'MXN').map((moneda) => <div key={moneda} className="min-w-0"><p className="text-sm text-slate-500">{moneda}</p><p className="mt-1 text-lg font-bold [overflow-wrap:anywhere]">{dinero(caja.saldos[moneda])}</p></div>)}</div></section>

        {caja.estado === 'cerrada' && <section className="mb-6 rounded-2xl border border-line bg-white p-6"><h2 className="mb-3 flex items-center gap-2 font-bold"><Check size={20} className="text-brand-600" /> Corte guardado · {caja.fecha}</h2><p className="mb-4 text-sm text-slate-500">Estos saldos contados se conservarán para la siguiente apertura.</p><div className="mb-5 flex flex-wrap gap-4 text-sm">{monedas.map((moneda) => <span key={moneda}>{moneda} {moneda === 'MXN' ? '(cajero)' : ''}: diferencia {dinero(num(ultimo.diferencias?.[moneda]))}</span>)}<span>Caja fuerte MXN: diferencia {dinero(num(ultimo.diferencias?.reserva))}</span></div><button className={botonClase} onClick={abrirConUltimoCierre} disabled={enviando}>Abrir con el último cierre</button></section>}

        {caja.estado === 'abierta' && (corte ? <form onSubmit={cerrar} className="rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-bold">Conteo de cierre</h2><p className="mt-1 mb-6 text-sm text-slate-500">Cuenta el efectivo real. Diferencia positiva: sobrante; negativa: faltante. Los campos vacíos no se consideran cero.</p><div className="grid gap-8 lg:grid-cols-2"><div className="space-y-4">
          {[...monedas.filter((moneda) => moneda !== 'USD'), 'reserva'].map((moneda) => {
            const esReserva = moneda === 'reserva'
            const valor = esReserva ? reservaContada : contado[moneda]
            const esperado = esReserva ? caja.reserva : caja.saldos[moneda]
            return <label key={moneda} className="block text-sm font-medium">{esReserva ? 'Caja fuerte · MXN' : moneda === 'MXN' ? 'Cajero · MXN' : moneda}<InputNumero className={`${inputClase} mt-2`} min="0" required value={valor} onChange={(event) => esReserva ? setReservaContada(event.target.value) : setContado({ ...contado, [moneda]: event.target.value })} /><span className="mt-1 block text-xs text-slate-500">Esperado: {dinero(esperado)}{valor !== '' && ` · Diferencia: ${dinero(importe(valor) - esperado)}`}</span></label>
          })}
        </div><div><h3 className="mb-3 font-semibold">Conteo de dólares</h3>{conteoUSD()}<p className="text-sm text-slate-500">Esperado: {dinero(caja.saldos.USD)}{denominaciones.every((valor) => billetes[valor] !== '') && ` · Diferencia: ${dinero(totalUSD(billetes) - caja.saldos.USD)}`}</p></div></div><div className="mt-6 flex gap-3"><button type="submit" disabled={enviando} className={botonClase}>Confirmar y cerrar caja</button><button type="button" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold" onClick={() => setCorte(false)}>Cancelar</button></div></form> : <div className="mb-6 grid items-start gap-5 lg:grid-cols-2">
          <form onSubmit={reponer} className="rounded-2xl border border-line bg-white p-6"><h2 className="font-bold">Reposición al cajero</h2><p className="mt-1 mb-4 text-sm text-slate-500">Traslada pesos de la caja fuerte al cajero. No modifica el total.</p><label className="block text-sm font-medium">Importe MXN<InputNumero className={`${inputClase} mt-2`} min="0.01" required value={reposicion} onChange={(event) => setReposicion(event.target.value)} /></label><button type="submit" disabled={enviando} className={`${botonClase} mt-4`}>Registrar reposición</button></form>
          <form onSubmit={registrar} className="rounded-2xl border border-line bg-white p-6"><h2 className="mb-4 font-bold">Entrada o salida de efectivo</h2><div className="grid grid-cols-2 gap-3"><label className="text-sm">Moneda<select className={`${inputClase} mt-2`} value={movimiento.moneda} onChange={(event) => setMovimiento({ ...movimiento, moneda: event.target.value })}>{monedas.map((moneda) => <option key={moneda}>{moneda}</option>)}</select></label><label className="text-sm">Movimiento<select className={`${inputClase} mt-2`} value={movimiento.tipo} onChange={(event) => setMovimiento({ ...movimiento, tipo: event.target.value })}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></label><label className="text-sm">Importe<InputNumero className={`${inputClase} mt-2`} min="0.01" required value={movimiento.monto} onChange={(event) => setMovimiento({ ...movimiento, monto: event.target.value })} /></label><label className="text-sm">Concepto<input className={`${inputClase} mt-2`} required maxLength="120" value={movimiento.concepto} onChange={(event) => setMovimiento({ ...movimiento, concepto: event.target.value })} /></label></div><p className="mt-3 text-xs text-slate-500">Los movimientos MXN afectan la caja del cajero. Las compras y ventas de Ventanilla ya se reflejan solas; usa esto para otros movimientos de efectivo.</p><button type="submit" disabled={enviando} className={`${botonClase} mt-4`}>Guardar movimiento</button></form>
        </div>)}

        {caja.movimientos.length > 0 && <section className="mt-6 rounded-2xl border border-line bg-white p-6"><h2 className="mb-4 font-bold">Movimientos del turno</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="pb-3">Hora</th><th>Movimiento</th><th>Concepto</th><th>Moneda</th><th className="text-right">Importe</th></tr></thead><tbody>{caja.movimientos.map((item) => <tr key={item.id} className="border-t border-line"><td className="py-3 pr-3">{hora(item.fechaHora)}</td><td className="pr-3">{etiquetaMovimiento[item.tipoMovimiento]}</td><td className="pr-3">{item.concepto}</td><td>{item.moneda}</td><td className="text-right">{dinero(num(item.monto))}</td></tr>)}</tbody></table></div></section>}
      </>}
    </div>
  )
}
