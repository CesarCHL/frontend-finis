import { MERCHANTS_LIST } from '../api/operations'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import type { Comercio, GrupoComercio } from '../types/finis'

function EstablecimientosPage() {
  const datos = useGql<{ merchants: Comercio[]; merchantGroups: GrupoComercio[] }>(
    MERCHANTS_LIST,
  )

  if (datos.loading) return <Spinner />
  if (datos.error || !datos.data)
    return <MensajeError mensaje={datos.error ?? 'Sin datos'} onReintentar={datos.reload} />

  const { merchants, merchantGroups } = datos.data
  const nombreGrupo = new Map(merchantGroups.map((g) => [g.id, g.name]))

  return (
    <Panel titulo={`Establecimientos (${merchants.length})`}>
      {merchants.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">
          Aún no tienes establecimientos. Aparecerán al nombrar tus gastos automáticos.
        </p>
      ) : (
        <ul className="space-y-2">
          {merchants.map((m) => (
            <li key={m.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
              <p className="font-semibold">{m.name}</p>
              {m.groupId && (
                <p className="text-xs text-slate-500">{nombreGrupo.get(m.groupId) ?? 'Grupo'}</p>
              )}
              {m.mappingRules.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  {m.mappingRules.map((r) => r.rawBankString).join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default EstablecimientosPage
