import { MONTHLY_SUMMARY, SPENDING_TREND, TRANSACTIONS } from '../api/operations'
import GraficaPastel from '../components/GraficaPastel'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import TarjetaResumen from '../components/TarjetaResumen'
import { useGql } from '../hooks/useGql'
import { ETIQUETA_TIPO, formatoFecha, formatoMoneda, MESES } from '../lib/format'
import type {
  Alcance,
  Movimiento,
  MonthlySummary,
  Periodo,
  SpendingTrend,
} from '../types/finis'

interface DashboardPageProps {
  periodo: Periodo
  alcance: Alcance
}

function DashboardPage({ periodo, alcance }: DashboardPageProps) {
  const resumen = useGql<{ monthlySummary: MonthlySummary }>(MONTHLY_SUMMARY, {
    ...periodo,
    ...alcance,
  })
  const recientes = useGql<{ transactions: Movimiento[] }>(TRANSACTIONS, {
    ...periodo,
    ...alcance,
    limit: 5,
  })
  const tendencia = useGql<{ spendingTrendByCategory: SpendingTrend[] }>(
    SPENDING_TREND,
    { months: 6, ...alcance },
  )

  if (resumen.loading) return <Spinner />
  if (resumen.error || !resumen.data)
    return (
      <MensajeError
        mensaje={resumen.error ?? 'Sin datos'}
        onReintentar={resumen.reload}
      />
    )

  const r = resumen.data.monthlySummary
  const gastos = r.byCategory
    .filter((c) => c.type.toLowerCase() === 'expense' && Number(c.total) > 0)
    .sort((a, b) => Number(b.total) - Number(a.total))
  const maxCategoria = Math.max(1, ...gastos.map((c) => Number(c.total)))

  // Total por mes (suma de categorías) para la gráfica de tendencia
  const porMes = new Map<string, { etiqueta: string; total: number }>()
  for (const t of tendencia.data?.spendingTrendByCategory ?? []) {
    const k = `${t.year}-${String(t.month).padStart(2, '0')}`
    const prev = porMes.get(k)
    porMes.set(k, {
      etiqueta: MESES[t.month - 1].slice(0, 3),
      total: (prev?.total ?? 0) + Number(t.total),
    })
  }
  const meses = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b))
  const maxMes = Math.max(1, ...meses.map(([, m]) => m.total))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaResumen titulo="Ingresos" valor={formatoMoneda(r.totalIncome)} color="verde" />
        <TarjetaResumen titulo="Total gastado" valor={formatoMoneda(r.totalExpense)} color="rojo" />
        <TarjetaResumen
          titulo="Balance"
          valor={formatoMoneda(r.balance)}
          detalle={`${r.transactionCount} movimientos`}
          color={Number(r.balance) >= 0 ? 'verde' : 'rojo'}
        />
      </div>

      {r.transactionCount === 0 && (
        <p className="text-center text-sm text-slate-500">
          Registra un gasto para empezar a ver tu resumen.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel titulo="Gasto por categoría">
          {gastos.length === 0 ? (
            <p className="text-sm text-slate-500">Sin gastos este mes.</p>
          ) : (
            <div className="space-y-5">
              <GraficaPastel
                datos={gastos.map((c) => ({
                  etiqueta: c.categoryName,
                  valor: Number(c.total),
                }))}
                centro={formatoMoneda(r.totalExpense)}
              />
              <ul className="space-y-3">
                {gastos.map((c) => (
                  <li key={c.categoryId} className="text-sm">
                    <div className="flex justify-between">
                      <span>{c.categoryName}</span>
                      <span className="font-medium">{formatoMoneda(c.total)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-2 rounded bg-emerald-500"
                        style={{ width: `${(Number(c.total) / maxCategoria) * 100}%` }}
                      />
                    </div>
                    {c.variationPercent !== null && (
                      <span className="text-xs text-slate-500">
                        {c.variationPercent >= 0 ? '▲' : '▼'}{' '}
                        {Math.abs(c.variationPercent).toFixed(0)}% vs mes anterior
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel titulo="Últimos movimientos">
            {recientes.loading ? (
              <Spinner />
            ) : recientes.error ? (
              <MensajeError mensaje={recientes.error} onReintentar={recientes.reload} />
            ) : (recientes.data?.transactions.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">Sin movimientos en {MESES[periodo.month - 1]}.</p>
            ) : (
              <ul className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {recientes.data?.transactions.map((m) => {
                  const ingreso = m.type === 'INCOME' || m.type === 'REFUND'
                  return (
                    <li key={m.id} className="flex justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {m.merchant?.name ?? m.description ?? 'Sin descripción'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatoFecha(m.occurredAt)} · {ETIQUETA_TIPO[m.type]} · {m.owner.name}
                        </p>
                      </div>
                      <span className={ingreso ? 'text-emerald-600' : 'text-red-600'}>
                        {ingreso ? '+' : '-'}
                        {formatoMoneda(m.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel titulo="Tendencia de gasto (6 meses)">
            {tendencia.loading ? (
              <Spinner />
            ) : tendencia.error ? (
              <MensajeError mensaje={tendencia.error} onReintentar={tendencia.reload} />
            ) : meses.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay historial.</p>
            ) : (
              <div className="flex h-44 items-end gap-2">
                {meses.map(([k, m]) => (
                  <div key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] text-slate-500">{formatoMoneda(m.total)}</span>
                    <div
                      className="w-full rounded-t bg-emerald-500"
                      style={{ height: `${(m.total / maxMes) * 70}%` }}
                    />
                    <span className="text-xs">{m.etiqueta}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
