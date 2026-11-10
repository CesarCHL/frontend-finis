// Solo para mostrar: los montos viajan como string (Decimal) y nunca se operan como number.
const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatoMoneda(monto: string | number): string {
  return moneda.format(Number(monto))
}

export function formatoFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  })
}

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const ETIQUETA_TIPO: Record<string, string> = {
  EXPENSE: 'Gasto',
  INCOME: 'Ingreso',
  REFUND: 'Reembolso',
  TRANSFER: 'Transferencia',
  INSTALLMENT: 'Mensualidad',
}
