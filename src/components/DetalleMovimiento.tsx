import { useState } from 'react'
import { gql } from '../api/client'
import { MERCHANT_GROUPS, RENAME_MERCHANT, CATEGORIES } from '../api/operations'
import { useGql } from '../hooks/useGql'
import { BOTON, INPUT } from '../lib/estilos'
import { ETIQUETA_TIPO, formatoFecha, formatoMoneda } from '../lib/format'
import type { Categoria, GrupoComercio, Movimiento } from '../types/finis'
import MensajeError from './MensajeError'
import Modal from './Modal'

const ORIGEN: Record<string, string> = {
  manual: 'Manual',
  notification: 'Automático (notificación)',
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{etiqueta}</span>
      <span className="text-right">{valor}</span>
    </div>
  )
}

interface DetalleMovimientoProps {
  movimiento: Movimiento
  /** Solo se puede nombrar el establecimiento de movimientos propios. */
  puedeRenombrar: boolean
  onCerrar: () => void
  onRenombrado: () => void
}

function DetalleMovimiento({
  movimiento: m,
  puedeRenombrar,
  onCerrar,
  onRenombrado,
}: DetalleMovimientoProps) {
  const sinNombrar = m.merchantId === null && !!m.rawDescription?.trim()
  const [renombrando, setRenombrando] = useState(false)

  return (
    <Modal titulo="Detalle del movimiento" onCerrar={onCerrar}>
      <p className="mb-1 text-lg font-semibold">
        {m.merchant?.name ?? m.rawDescription ?? m.description ?? 'Sin descripción'}
      </p>
      <p className="mb-3 text-2xl font-bold">{formatoMoneda(m.amount)}</p>
      <Fila etiqueta="Tipo" valor={ETIQUETA_TIPO[m.type]} />
      <Fila etiqueta="Fecha" valor={formatoFecha(m.occurredAt)} />
      <Fila etiqueta="Categoría" valor={m.category?.name ?? 'Sin categoría'} />
      <Fila etiqueta="Origen" valor={ORIGEN[m.source] ?? m.source} />
      {!puedeRenombrar && <Fila etiqueta="De" valor={m.owner.name} />}
      {m.installment && (
        <Fila
          etiqueta="Mensualidad"
          valor={`${m.installment.number} de ${m.installment.total}`}
        />
      )}
      {m.rawDescription && <Fila etiqueta="Texto del banco" valor={m.rawDescription} />}
      {m.notes && <Fila etiqueta="Notas" valor={m.notes} />}

      {puedeRenombrar && sinNombrar && !renombrando && (
        <button type="button" className={`${BOTON} mt-4 w-full`} onClick={() => setRenombrando(true)}>
          Renombrar establecimiento
        </button>
      )}
      {renombrando && (
        <FormularioRenombrar
          rawDescription={m.rawDescription ?? ''}
          onListo={() => {
            onRenombrado()
            onCerrar()
          }}
        />
      )}
    </Modal>
  )
}

function FormularioRenombrar({
  rawDescription,
  onListo,
}: {
  rawDescription: string
  onListo: () => void
}) {
  const cats = useGql<{ categories: Categoria[] }>(CATEGORIES)
  const grupos = useGql<{ merchantGroups: GrupoComercio[] }>(MERCHANT_GROUPS)
  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [grupoId, setGrupoId] = useState('')
  const [aplicar, setAplicar] = useState(true)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await gql(RENAME_MERCHANT, {
        input: {
          rawDescription,
          name: nombre.trim(),
          defaultCategoryId: categoriaId || null,
          groupId: grupoId || null,
          applyToPastTransactions: aplicar,
        },
      })
      onListo()
    } catch (err) {
      setError((err as Error).message)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="mt-4 space-y-3">
      <input
        className={INPUT}
        placeholder="Nombre del establecimiento"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <select className={INPUT} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
        <option value="">Categoría por defecto (opcional)</option>
        {(cats.data?.categories ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select className={INPUT} value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
        <option value="">Grupo (opcional)</option>
        {(grupos.data?.merchantGroups ?? []).map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={aplicar} onChange={(e) => setAplicar(e.target.checked)} />
        Aplicar a gastos anteriores con el mismo texto
      </label>
      {error && <MensajeError mensaje={error} />}
      <button type="submit" disabled={enviando} className={`${BOTON} w-full`}>
        {enviando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}

export default DetalleMovimiento
