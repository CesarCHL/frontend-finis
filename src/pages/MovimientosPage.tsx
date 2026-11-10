import { useState } from 'react'
import { gql } from '../api/client'
import { CATEGORIES, CREATE_TRANSACTION, DELETE_TRANSACTION, TRANSACTIONS } from '../api/operations'
import DetalleMovimiento from '../components/DetalleMovimiento'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import { BOTON, BOTON_PELIGRO, INPUT } from '../lib/estilos'
import { ETIQUETA_TIPO, formatoFecha, formatoMoneda, MESES } from '../lib/format'
import type { Alcance, Categoria, Movimiento, Periodo, Usuario } from '../types/finis'

const PAGINA = 30

interface MovimientosPageProps {
  periodo: Periodo
  alcance: Alcance
  usuario: Usuario
}

function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function MovimientosPage({ periodo, alcance, usuario }: MovimientosPageProps) {
  const [limite, setLimite] = useState(PAGINA)
  const movs = useGql<{ transactions: Movimiento[] }>(TRANSACTIONS, {
    ...periodo,
    ...alcance,
    limit: limite,
  })
  const cats = useGql<{ categories: Categoria[] }>(CATEGORIES)

  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [detalle, setDetalle] = useState<Movimiento | null>(null)

  // Formulario de registro manual
  const [tipo, setTipo] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [monto, setMonto] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(hoyISO)
  const [notas, setNotas] = useState('')
  const [paraQuien, setParaQuien] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [aviso, setAviso] = useState('')

  const esPadre = usuario.familyRole === 'PARENT'
  const otros = esPadre
    ? (usuario.family?.members ?? []).filter((m) => m.user.id !== usuario.id)
    : []
  const categorias = cats.data?.categories ?? []
  // Para registrar a nombre de otra persona solo sirven las categorías compartidas (globales)
  const categoriasForm = categorias.filter(
    (c) => c.type.toLowerCase() === tipo.toLowerCase() && (!paraQuien || c.isGlobal),
  )

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    setAviso('')
    try {
      await gql(CREATE_TRANSACTION, {
        input: {
          amount: monto,
          type: tipo,
          category_id: categoriaId,
          description: descripcion,
          date: fecha,
          notes: notas || null,
          source: 'manual',
          ownerId: paraQuien || null,
        },
      })
      setMonto('')
      setDescripcion('')
      setNotas('')
      setAviso('Movimiento registrado')
      movs.reload()
    } catch (err) {
      setErrorForm((err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(id: string) {
    if (!window.confirm('¿Eliminar este movimiento?')) return
    try {
      await gql(DELETE_TRANSACTION, { id })
      movs.reload()
    } catch (err) {
      setErrorForm((err as Error).message)
    }
  }

  const todos = movs.data?.transactions ?? []
  const lista = todos.filter(
    (m) =>
      (!filtroCategoria || m.category?.id === filtroCategoria) &&
      (m.merchant?.name ?? m.description ?? m.rawDescription ?? '')
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Panel titulo="Registrar movimiento">
        <form onSubmit={crear} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex gap-2 sm:col-span-2">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTipo(t)
                  setCategoriaId('')
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  tipo === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {ETIQUETA_TIPO[t]}
              </button>
            ))}
          </div>
          {otros.length > 0 && (
            <select
              className={`${INPUT} sm:col-span-2`}
              value={paraQuien}
              onChange={(e) => {
                setParaQuien(e.target.value)
                setCategoriaId('')
              }}
            >
              <option value="">¿Para quién? Yo</option>
              {otros.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          )}
          <input
            className={INPUT}
            placeholder="Monto"
            inputMode="decimal"
            pattern="[0-9]+(\.[0-9]{1,2})?"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
          <input
            className={INPUT}
            type="date"
            value={fecha}
            max={hoyISO()}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          <select
            className={INPUT}
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Categoría...</option>
            {categoriasForm.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isGlobal ? ' (global)' : ''}
              </option>
            ))}
          </select>
          <input
            className={INPUT}
            placeholder="¿Dónde fue?"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
          <input
            className={`${INPUT} sm:col-span-2`}
            placeholder="Notas (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
          {categoriasForm.length === 0 && !cats.loading && (
            <p className="text-xs text-slate-500 sm:col-span-2">
              No hay categorías de {ETIQUETA_TIPO[tipo].toLowerCase()} disponibles. Crea una en
              la sección Categorías.
            </p>
          )}
          <button type="submit" disabled={guardando} className={`${BOTON} sm:col-span-2`}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
        {errorForm && (
          <div className="mt-3">
            <MensajeError mensaje={errorForm} />
          </div>
        )}
        {aviso && <p className="mt-3 text-sm text-emerald-600">{aviso}</p>}
      </Panel>

      <Panel titulo={`Movimientos de ${MESES[periodo.month - 1]}`}>
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="search"
            className={INPUT}
            placeholder="Buscar por descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className={INPUT}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {movs.loading ? (
          <Spinner />
        ) : movs.error ? (
          <MensajeError mensaje={movs.error} onReintentar={movs.reload} />
        ) : lista.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Sin movimientos en {MESES[periodo.month - 1]}.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {lista.map((m) => {
                const ingreso = m.type === 'INCOME' || m.type === 'REFUND'
                const propio = m.owner.id === usuario.id
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setDetalle(m)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-medium">
                        {m.merchant?.name ?? m.rawDescription ?? m.description ?? 'Sin descripción'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatoFecha(m.occurredAt)} · {m.category?.name ?? 'Sin categoría'} ·{' '}
                        {ETIQUETA_TIPO[m.type]}
                        {m.installment && ` ${m.installment.number}/${m.installment.total}`} ·{' '}
                        {m.owner.name}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${ingreso ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {ingreso ? '+' : '-'}
                        {formatoMoneda(m.amount)}
                      </span>
                      {propio && (
                        <button type="button" className={BOTON_PELIGRO} onClick={() => borrar(m.id)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            {todos.length === limite && (
              <button
                type="button"
                className={`${BOTON} mt-4 w-full`}
                onClick={() => setLimite((l) => l + PAGINA)}
              >
                Cargar más
              </button>
            )}
          </>
        )}
      </Panel>

      {detalle && (
        <DetalleMovimiento
          movimiento={detalle}
          puedeRenombrar={detalle.owner.id === usuario.id}
          onCerrar={() => setDetalle(null)}
          onRenombrado={movs.reload}
        />
      )}
    </div>
  )
}

export default MovimientosPage
