import { useState } from 'react'
import { Wallet, Vault, ArrowRightLeft, Check } from 'lucide-react'
import { dinero } from '../utils/formato'

const CLAVE = 'divix-caja-v1'
const monedas = ['MXN', 'USD', 'CAD', 'CHF', 'GBP', 'EUR']
const denominaciones = [100, 50, 20, 10, 5, 2, 1]
const vacio = () => Object.fromEntries(monedas.map((moneda) => [moneda, '']))
const cantidadesVacias = () => Object.fromEntries(denominaciones.map((valor) => [valor, '']))
const fecha = () => new Date().toLocaleDateString('es-MX')
const importe = (valor) => Math.round(Number(valor) * 100)
const totalUSD = (cantidades) => denominaciones.reduce((total, valor) => total + valor * Number(cantidades[valor] || 0), 0)

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (guardado?.version === 1 && ['abierta', 'cerrada'].includes(guardado.estado)
      && monedas.every((moneda) => Number.isSafeInteger(guardado.saldos?.[moneda]) && guardado.saldos[moneda] >= 0)
      && Number.isSafeInteger(guardado.reserva) && guardado.reserva >= 0
      && Array.isArray(guardado.movimientos)) return guardado
  } catch { /* Sin datos locales válidos, se solicita el fondo inicial. */ }
  return null
}

const inputClase = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm'
const botonClase = 'rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50'

export default function Caja() {
  const [caja, setCaja] = useState(cargar)
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

  function guardar(datos, aviso) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos))
      setCaja(datos)
      setError('')
      setMensaje(aviso)
      return true
    } catch {
      setError('No se pudo guardar en este navegador. No se aplicaron cambios.')
      return false
    }
  }

  function abrir(event) {
    event.preventDefault()
    const saldos = Object.fromEntries(monedas.map((moneda) => [moneda, importe(moneda === 'USD' ? totalUSD(billetes) : fondos[moneda])]))
    guardar({ version: 1, estado: 'abierta', fecha: fecha(), saldos, reserva: importe(reserva), inicial: { ...saldos, reserva: importe(reserva) }, movimientos: [] }, 'Fondo inicial guardado. Caja abierta.')
  }

  function reponer(event) {
    event.preventDefault()
    const monto = importe(reposicion)
    if (!Number.isSafeInteger(monto) || monto <= 0 || monto > caja.reserva) {
      setError('La reposición debe ser mayor que cero y no superar la reserva de caja fuerte.')
      return
    }
    if (guardar({ ...caja, reserva: caja.reserva - monto, saldos: { ...caja.saldos, MXN: caja.saldos.MXN + monto }, movimientos: [...caja.movimientos, { tipo: 'reposición', moneda: 'MXN', monto, concepto: 'Caja fuerte → cajero', hora: new Date().toLocaleTimeString('es-MX') }] }, 'Reposición registrada. El total de pesos no cambia.')) setReposicion('')
  }

  function registrar(event) {
    event.preventDefault()
    const monto = importe(movimiento.monto)
    const saldo = caja.saldos[movimiento.moneda] + (movimiento.tipo === 'entrada' ? monto : -monto)
    if (!Number.isSafeInteger(monto) || monto <= 0 || saldo < 0 || !movimiento.concepto.trim()) {
      setError('Revisa el importe y concepto. No puedes retirar más efectivo del disponible.')
      return
    }
    if (guardar({ ...caja, saldos: { ...caja.saldos, [movimiento.moneda]: saldo }, movimientos: [...caja.movimientos, { ...movimiento, concepto: movimiento.concepto.trim(), monto, hora: new Date().toLocaleTimeString('es-MX') }] }, 'Movimiento registrado.')) setMovimiento({ ...movimiento, monto: '', concepto: '' })
  }

  function cerrar(event) {
    event.preventDefault()
    const saldos = Object.fromEntries(monedas.map((moneda) => [moneda, importe(moneda === 'USD' ? totalUSD(billetes) : contado[moneda])]))
    const reservaReal = importe(reservaContada)
    const diferencias = Object.fromEntries(monedas.map((moneda) => [moneda, saldos[moneda] - caja.saldos[moneda]]))
    if (guardar({ ...caja, estado: 'cerrada', saldos, reserva: reservaReal, ultimoCorte: { fecha: caja.fecha, diferencias, diferenciaReserva: reservaReal - caja.reserva, billetes: { ...billetes } } }, 'Corte guardado. El efectivo contado será el fondo de la siguiente apertura.')) setCorte(false)
  }

  function conteoUSD() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2">Billete USD</th><th>Cantidad de billetes</th><th className="text-right">Importe USD</th></tr></thead>
          <tbody>{denominaciones.map((valor) => <tr key={valor} className="border-t border-line">
            <td className="py-3">{dinero(valor)}</td>
            <td><input aria-label={`Cantidad de billetes de ${valor} dólares`} type="number" min="0" step="1" required className={`${inputClase} max-w-32`} value={billetes[valor]} onChange={(event) => setBilletes({ ...billetes, [valor]: event.target.value })} /></td>
            <td className="text-right font-medium">{dinero(valor * Number(billetes[valor] || 0))}</td>
          </tr>)}</tbody>
          <tfoot><tr className="border-t border-line font-bold"><td colSpan="2" className="py-3">Total USD</td><td className="text-right">{dinero(totalUSD(billetes))}</td></tr></tfoot>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">Operación / <span className="font-medium text-brand-600">Caja y cortes</span></p><h1 className="mt-2 text-[32px] font-bold tracking-tight">Caja y cortes</h1><p className="mt-1 text-sm text-slate-500">El cierre de un día es el fondo inicial del siguiente.</p></div>
        {caja?.estado === 'abierta' && !corte && <button className={botonClase} onClick={() => { setCorte(true); setBilletes(cantidadesVacias()); setContado(vacio()); setReservaContada(''); setMensaje(''); setError('') }}>Realizar corte</button>}
      </div>
      <p className="mb-5 rounded-xl border border-line bg-white px-4 py-3 text-sm text-slate-500">Datos locales de este navegador. Las operaciones de Ventanilla todavía no actualizan estos saldos. Registra aquí sus entradas y salidas; cada moneda conserva su propio saldo.</p>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {mensaje && <p role="status" className="mb-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">{mensaje}</p>}

      {!caja ? <form onSubmit={abrir} className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Registrar fondo inicial</h2><p className="mt-1 mb-6 text-sm text-slate-500">Captura el efectivo del cierre anterior. Ingresa 0 cuando no haya existencias.</p>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4"><label className="block text-sm font-medium">Pesos en caja fuerte (MXN)<input className={`${inputClase} mt-2`} type="number" min="0" step="0.01" required placeholder="Ej. 1000000" value={reserva} onChange={(event) => setReserva(event.target.value)} /></label>
            {monedas.filter((moneda) => moneda !== 'USD').map((moneda) => <label key={moneda} className="block text-sm font-medium">{moneda === 'MXN' ? 'Pesos del cajero (MXN)' : `Saldo ${moneda}`}<input className={`${inputClase} mt-2`} type="number" min="0" step="0.01" required placeholder={moneda === 'MXN' ? 'Ej. 100000' : '0.00'} value={fondos[moneda]} onChange={(event) => setFondos({ ...fondos, [moneda]: event.target.value })} /></label>)}
            <p className="text-sm font-semibold">Total MXN: {dinero(Number(reserva || 0) + Number(fondos.MXN || 0))}</p>
          </div><div><h3 className="mb-3 font-semibold">Dólares por denominación</h3>{conteoUSD()}</div>
        </div><button className={`${botonClase} mt-6`} type="submit">Guardar fondo y abrir caja</button>
      </form> : <>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[{ nombre: 'Caja fuerte · MXN', valor: caja.reserva, Icono: Vault }, { nombre: 'Caja del cajero · MXN', valor: caja.saldos.MXN, Icono: Wallet }, { nombre: 'Total disponible · MXN', valor: caja.reserva + caja.saldos.MXN, Icono: ArrowRightLeft }].map(({ nombre, valor, Icono }) => <div key={nombre} className="rounded-2xl border border-line bg-white p-5"><Icono size={22} className="mb-3 text-brand-600" /><p className="text-sm text-slate-500">{nombre}</p><p className="mt-2 text-2xl font-bold">{dinero(valor / 100)}</p></div>)}
        </div>
        <section className="mb-6 rounded-2xl border border-line bg-white p-6"><div className="mb-4 flex flex-wrap justify-between gap-2"><h2 className="font-bold">Saldos por moneda</h2><span className="text-sm text-slate-500">{caja.estado === 'abierta' ? 'Caja abierta' : 'Caja cerrada'} · {caja.fecha}</span></div><div className="grid grid-cols-2 gap-4 md:grid-cols-5">{monedas.filter((moneda) => moneda !== 'MXN').map((moneda) => <div key={moneda}><p className="text-sm text-slate-500">{moneda}</p><p className="mt-1 text-lg font-bold">{dinero(caja.saldos[moneda] / 100)}</p></div>)}</div></section>

        {caja.estado === 'cerrada' && <section className="mb-6 rounded-2xl border border-line bg-white p-6"><h2 className="mb-3 flex items-center gap-2 font-bold"><Check size={20} className="text-brand-600" /> Corte guardado · {caja.ultimoCorte.fecha}</h2><p className="mb-4 text-sm text-slate-500">Estos saldos contados se conservarán para la siguiente apertura.</p><div className="mb-5 flex flex-wrap gap-4 text-sm">{monedas.map((moneda) => <span key={moneda}>{moneda} {moneda === 'MXN' ? '(cajero)' : ''}: diferencia {dinero(caja.ultimoCorte.diferencias[moneda] / 100)}</span>)}<span>Caja fuerte MXN: diferencia {dinero(caja.ultimoCorte.diferenciaReserva / 100)}</span></div><button className={botonClase} onClick={() => guardar({ ...caja, estado: 'abierta', fecha: fecha(), inicial: { ...caja.saldos, reserva: caja.reserva }, movimientos: [] }, 'Nueva apertura con los saldos del último corte.')}>Abrir con el último cierre</button></section>}

        {caja.estado === 'abierta' && (corte ? <form onSubmit={cerrar} className="rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-bold">Conteo de cierre</h2><p className="mt-1 mb-6 text-sm text-slate-500">Cuenta el efectivo real. Diferencia positiva: sobrante; negativa: faltante. Los campos vacíos no se consideran cero.</p><div className="grid gap-8 lg:grid-cols-2"><div className="space-y-4">
          {[...monedas.filter((moneda) => moneda !== 'USD'), 'reserva'].map((moneda) => {
            const esReserva = moneda === 'reserva'
            const valor = esReserva ? reservaContada : contado[moneda]
            const esperado = esReserva ? caja.reserva : caja.saldos[moneda]
            return <label key={moneda} className="block text-sm font-medium">{esReserva ? 'Caja fuerte · MXN' : moneda === 'MXN' ? 'Cajero · MXN' : moneda}<input className={`${inputClase} mt-2`} type="number" min="0" step="0.01" required value={valor} onChange={(event) => esReserva ? setReservaContada(event.target.value) : setContado({ ...contado, [moneda]: event.target.value })} /><span className="mt-1 block text-xs text-slate-500">Esperado: {dinero(esperado / 100)}{valor !== '' && ` · Diferencia: ${dinero((importe(valor) - esperado) / 100)}`}</span></label>
          })}
        </div><div><h3 className="mb-3 font-semibold">Conteo de dólares</h3>{conteoUSD()}<p className="text-sm text-slate-500">Esperado: {dinero(caja.saldos.USD / 100)}{denominaciones.every((valor) => billetes[valor] !== '') && ` · Diferencia: ${dinero(totalUSD(billetes) - caja.saldos.USD / 100)}`}</p></div></div><div className="mt-6 flex gap-3"><button type="submit" className={botonClase}>Confirmar y cerrar caja</button><button type="button" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold" onClick={() => setCorte(false)}>Cancelar</button></div></form> : <div className="mb-6 grid items-start gap-5 lg:grid-cols-2">
          <form onSubmit={reponer} className="rounded-2xl border border-line bg-white p-6"><h2 className="font-bold">Reposición al cajero</h2><p className="mt-1 mb-4 text-sm text-slate-500">Traslada pesos de la caja fuerte al cajero. No modifica el total.</p><label className="block text-sm font-medium">Importe MXN<input className={`${inputClase} mt-2`} type="number" min="0.01" step="0.01" required value={reposicion} onChange={(event) => setReposicion(event.target.value)} /></label><button type="submit" className={`${botonClase} mt-4`}>Registrar reposición</button></form>
          <form onSubmit={registrar} className="rounded-2xl border border-line bg-white p-6"><h2 className="mb-4 font-bold">Entrada o salida de efectivo</h2><div className="grid grid-cols-2 gap-3"><label className="text-sm">Moneda<select className={`${inputClase} mt-2`} value={movimiento.moneda} onChange={(event) => setMovimiento({ ...movimiento, moneda: event.target.value })}>{monedas.map((moneda) => <option key={moneda}>{moneda}</option>)}</select></label><label className="text-sm">Movimiento<select className={`${inputClase} mt-2`} value={movimiento.tipo} onChange={(event) => setMovimiento({ ...movimiento, tipo: event.target.value })}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></label><label className="text-sm">Importe<input className={`${inputClase} mt-2`} type="number" min="0.01" step="0.01" required value={movimiento.monto} onChange={(event) => setMovimiento({ ...movimiento, monto: event.target.value })} /></label><label className="text-sm">Concepto<input className={`${inputClase} mt-2`} required maxLength="120" value={movimiento.concepto} onChange={(event) => setMovimiento({ ...movimiento, concepto: event.target.value })} /></label></div><p className="mt-3 text-xs text-slate-500">Los movimientos MXN afectan la caja del cajero. Una compra o venta requiere registrar cada moneda involucrada.</p><button type="submit" className={`${botonClase} mt-4`}>Guardar movimiento</button></form>
        </div>)}

        {caja.movimientos.length > 0 && <section className="mt-6 rounded-2xl border border-line bg-white p-6"><h2 className="mb-4 font-bold">Movimientos del turno</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="pb-3">Hora</th><th>Movimiento</th><th>Concepto</th><th>Moneda</th><th className="text-right">Importe</th></tr></thead><tbody>{caja.movimientos.map((item, index) => <tr key={index} className="border-t border-line"><td className="py-3 pr-3">{item.hora}</td><td className="pr-3">{item.tipo}</td><td className="pr-3">{item.concepto}</td><td>{item.moneda}</td><td className="text-right">{dinero(item.monto / 100)}</td></tr>)}</tbody></table></div></section>}
      </>}
    </div>
  )
}
