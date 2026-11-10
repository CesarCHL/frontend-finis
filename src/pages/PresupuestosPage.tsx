import { useState } from 'react'
import { gql } from '../api/client'
import {
  BUDGET_REPORT,
  CATEGORIES,
  CREATE_BUDGET,
  DELETE_BUDGET,
} from '../api/operations'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import { BOTON, BOTON_PELIGRO, INPUT } from '../lib/estilos'
import { formatoMoneda } from '../lib/format'
import type { BudgetReportItem, Categoria, Periodo } from '../types/finis'

interface PresupuestosPageProps {
  periodo: Periodo
}

function PresupuestosPage({ periodo }: PresupuestosPageProps) {
  const reporte = useGql<{
    budgetReport: BudgetReportItem[]
    budgets: { id: string; categoryId: string }[]
  }>(BUDGET_REPORT, periodo)
  const cats = useGql<{ categories: Categoria[] }>(CATEGORIES)

  const [categoriaId, setCategoriaId] = useState('')
  const [limite, setLimite] = useState('')
  const [error, setError] = useState('')

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await gql(CREATE_BUDGET, {
        input: { categoryId: categoriaId, amountLimit: Number(limite), ...periodo },
      })
      setLimite('')
      reporte.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function borrar(categoryId: string) {
    const id = reporte.data?.budgets.find((b) => b.categoryId === categoryId)?.id
    if (!id) return
    try {
      await gql(DELETE_BUDGET, { id })
      reporte.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <Panel titulo="Nuevo presupuesto">
        <form onSubmit={crear} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            className={INPUT}
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Categoría...</option>
            {(cats.data?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className={INPUT}
            type="number"
            min="1"
            step="0.01"
            placeholder="Límite mensual"
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            required
          />
          <button type="submit" className={BOTON}>
            Crear
          </button>
        </form>
        {error && (
          <div className="mt-3">
            <MensajeError mensaje={error} />
          </div>
        )}
      </Panel>

      <Panel titulo="Avance del mes">
        {reporte.loading ? (
          <Spinner />
        ) : reporte.error ? (
          <MensajeError mensaje={reporte.error} onReintentar={reporte.reload} />
        ) : (reporte.data?.budgetReport.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">No hay presupuestos para este mes.</p>
        ) : (
          <ul className="space-y-4">
            {reporte.data?.budgetReport.map((b) => (
              <li key={b.categoryId} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{b.categoryName ?? 'Categoría'}</span>
                  <span>
                    {formatoMoneda(b.spent)} / {formatoMoneda(b.amountLimit)}
                    <button
                      type="button"
                      className={`${BOTON_PELIGRO} ml-2`}
                      onClick={() => borrar(b.categoryId)}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-2 rounded ${b.exceeded ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                  />
                </div>
                <p className={`text-xs ${b.exceeded ? 'text-red-600' : 'text-slate-500'}`}>
                  {b.percentUsed.toFixed(0)}% usado ·{' '}
                  {b.exceeded
                    ? `excedido por ${formatoMoneda(Math.abs(b.remaining))}`
                    : `quedan ${formatoMoneda(b.remaining)}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

export default PresupuestosPage
