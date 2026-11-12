import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, CheckCircle2 } from 'lucide-react'
import { obtenerNegocio } from '../../api/configuracion'
import { useCarga } from '../../api/useCarga'
import { dinero } from '../../utils/formato'
import { describirBilletes } from '../../utils/billetes'

/**
 * Ticket de una operación recién registrada, con botón para imprimirlo.
 *
 * Se dibuja en un portal directo en <body> para que, al imprimir, se pueda
 * ocultar toda la app y mandar a la impresora solo el ticket (ver el bloque
 * @media print de index.css). Mide 80 mm de ancho, el tamaño de las
 * impresoras de tickets; en una impresora normal sale centrado en la hoja.
 *
 * `operacion`: { folio, fecha, tipo, codigo, nombreDivisa, cantidad, tasa, total, cajero, cliente }
 */

const numero = (n, decimales = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })

function Fila({ etiqueta, valor, fuerte = false }) {
  return (
    <div className={`flex justify-between gap-3 ${fuerte ? 'font-bold' : ''}`}>
      <span>{etiqueta}</span>
      <span className="text-right">{valor}</span>
    </div>
  )
}

const Separador = () => <div className="border-t border-dashed border-black/50 my-2.5" />

function Papel({ operacion: o, negocio }) {
  const fecha = o.fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = o.fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  // El tipo de cambio de divisas con valor bajo (p. ej. JPY) necesita más decimales.
  const decimalesTasa = o.tasa < 1 ? 4 : 2

  return (
    <div className="ticket-papel w-[80mm] bg-white text-black font-mono text-[12px] leading-snug px-[5mm] py-[6mm]">
      <div className="text-center">
        <p className="text-[15px] font-bold uppercase">{negocio?.nombre || 'Divix'}</p>
        {negocio?.rfc && <p>RFC: {negocio.rfc}</p>}
        {negocio?.direccion && <p>{negocio.direccion}</p>}
        {negocio?.telefono && <p>Tel. {negocio.telefono}</p>}
      </div>

      <Separador />
      <p className="text-center font-bold">COMPROBANTE DE OPERACIÓN</p>
      <Separador />

      <Fila etiqueta="Folio" valor={`#${String(o.folio ?? '—').padStart(6, '0')}`} />
      <Fila etiqueta="Fecha" valor={fecha} />
      <Fila etiqueta="Hora" valor={hora} />
      <Fila etiqueta="Cajero" valor={o.cajero} />
      <Fila etiqueta="Cliente" valor={o.cliente} />

      <Separador />
      <p className="text-center font-bold uppercase">
        {o.tipo === 'compra' ? 'Compra' : 'Venta'} de {o.codigo}
      </p>
      <p className="text-center mb-2">{o.nombreDivisa}</p>

      <Fila etiqueta="Cantidad" valor={`${numero(o.cantidad)} ${o.codigo}`} />
      <Fila etiqueta="Tipo de cambio" valor={`$${numero(o.tasa, decimalesTasa)}`} />
      {o.billetes && describirBilletes(o.billetes) && (
        <p className="mt-1 text-[11px]">
          Billetes {o.tipo === 'compra' ? 'recibidos' : 'entregados'}: {describirBilletes(o.billetes)}
        </p>
      )}
      <Separador />
      <div className="text-[14px]">
        <Fila
          etiqueta={o.tipo === 'compra' ? 'TOTAL PAGADO' : 'TOTAL A PAGAR'}
          valor={`${dinero(o.total)} MXN`}
          fuerte
        />
      </div>
      <Separador />

      <p className="text-center">¡Gracias por su preferencia!</p>
      <p className="text-center text-[10px] mt-1">Conserve este comprobante.</p>
    </div>
  )
}

export default function Ticket({ operacion, onCerrar }) {
  const { datos: negocio } = useCarga(obtenerNegocio)

  // Esc cierra el ticket.
  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  return createPortal(
    <div className="zona-ticket animar-fondo fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4">
      <div className="ticket-modal animar-modal bg-white rounded-2xl shadow-2xl max-h-full flex flex-col overflow-hidden">
        <div className="ticket-controles flex items-center gap-3 px-6 py-4 border-b border-line">
          <CheckCircle2 size={22} className="text-brand-600" />
          <div>
            <h2 className="font-bold">Operación registrada</h2>
            <p className="text-sm text-slate-500">Imprime el ticket para el cliente.</p>
          </div>
          <button
            onClick={onCerrar}
            className="ml-auto w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ticket-vista overflow-auto bg-slate-100 px-3 sm:px-8 py-6 flex justify-center">
          <div className="shadow-md">
            <Papel operacion={operacion} negocio={negocio} />
          </div>
        </div>

        <div className="ticket-controles flex justify-end gap-3 px-6 py-4 border-t border-line">
          <button
            onClick={onCerrar}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 border border-line hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            autoFocus
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir ticket
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
