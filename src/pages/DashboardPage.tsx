import { MONTHLY_SUMMARY, TRANSACTIONS } from '../api/operations'
import GraficaPastel from '../components/GraficaPastel'
import MensajeError from '../components/MensajeError'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import { ETIQUETA_TIPO, formatoFecha, formatoMoneda, MESES } from '../lib/format'
import type { Alcance, Movimiento, MonthlySummary, Periodo } from '../types/finis'

interface DashboardPageProps {
  periodo: Periodo
  alcance: Alcance
  onVerMovimientos: (categoriaId?: string) => void
}

function DashboardPage({ periodo, alcance, onVerMovimientos }: DashboardPageProps) {
  const resumen = useGql<{ monthlySummary: MonthlySummary }>(MONTHLY_SUMMARY, { ...periodo, ...alcance })
  const recientes = useGql<{ transactions: Movimiento[] }>(TRANSACTIONS, { ...periodo, ...alcance, limit: 5 })

  if (resumen.loading) return <Spinner />
  if (resumen.error || !resumen.data) return <MensajeError mensaje={resumen.error ?? 'Sin datos'} onReintentar={resumen.reload} />

  const r = resumen.data.monthlySummary
  const gastos = r.byCategory.filter((c) => c.type.toLowerCase() === 'expense' && Number(c.total) > 0).sort((a, b) => Number(b.total) - Number(a.total))

  return (
    <div className="editorial-dashboard">
      <section className="balance-hero" aria-labelledby="balance-titulo">
        <div className="balance-side"><span>Ingresos</span><strong>{formatoMoneda(r.totalIncome)}</strong></div>
        <div className="balance-central"><h1 id="balance-titulo">Balance del mes</h1><p>{formatoMoneda(r.balance)}</p><span>{MESES[periodo.month - 1]} {periodo.year} · {r.transactionCount} {r.transactionCount === 1 ? 'movimiento' : 'movimientos'}</span></div>
        <div className="balance-side"><span>Gastos</span><strong>{formatoMoneda(r.totalExpense)}</strong></div>
      </section>

      <div className="editorial-grid">
        <section className="editorial-panel" aria-labelledby="movimientos-titulo">
          <div className="editorial-heading"><h2 id="movimientos-titulo">Últimos movimientos</h2><button type="button" onClick={() => onVerMovimientos()}>Ver todos →</button></div>
          {recientes.loading ? <Spinner /> : recientes.error ? <MensajeError mensaje={recientes.error} onReintentar={recientes.reload} /> : (recientes.data?.transactions.length ?? 0) === 0 ? <p className="editorial-empty">Sin movimientos en {MESES[periodo.month - 1]}.</p> : (
            <ul className="editorial-list">{recientes.data?.transactions.map((m) => {
              const ingreso = m.type === 'INCOME' || m.type === 'REFUND'
              return <li key={m.id}><div className="movement-icon" aria-hidden="true">{ingreso ? '↙' : '↗'}</div><div className="movement-info"><strong>{m.merchant?.name ?? m.description ?? 'Sin descripción'}</strong><span>{m.category?.name ?? ETIQUETA_TIPO[m.type]} · {m.owner.name}</span></div><div className="movement-amount"><strong className={ingreso ? 'income' : 'expense'}>{ingreso ? '+' : '-'}{formatoMoneda(m.amount)}</strong><span>{formatoFecha(m.occurredAt)}</span></div></li>
            })}</ul>
          )}
        </section>

        <section className="editorial-panel" aria-labelledby="categorias-titulo">
          <div className="editorial-heading"><h2 id="categorias-titulo">Gastos por categoría</h2><strong>{formatoMoneda(r.totalExpense)}</strong></div>
          {gastos.length === 0 ? <p className="editorial-empty">Sin gastos este mes.</p> : <><GraficaPastel datos={gastos.map((c) => ({ etiqueta: c.categoryName, valor: Number(c.total) }))} centro={formatoMoneda(r.totalExpense)} /><p className="category-hint">Selecciona una categoría para ver sus movimientos</p><ul className="category-links">{gastos.map((c) => <li key={c.categoryId}><button type="button" onClick={() => onVerMovimientos(c.categoryId)}><span>{c.categoryName}</span><strong>{formatoMoneda(c.total)} →</strong></button></li>)}</ul></>}
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
