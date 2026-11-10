import { useState } from 'react'
import { gql } from '../api/client'
import {
  CATEGORIES,
  CREATE_CATEGORY,
  CREATE_MERCHANT_GROUP,
  MERCHANT_GROUPS,
} from '../api/operations'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import { BOTON, INPUT } from '../lib/estilos'
import type { Categoria, GrupoComercio } from '../types/finis'

function CategoriasPage() {
  const cats = useGql<{ categories: Categoria[] }>(CATEGORIES)
  const grupos = useGql<{ merchantGroups: GrupoComercio[] }>(MERCHANT_GROUPS)

  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('expense')
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [error, setError] = useState('')

  async function crearCategoria(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await gql(CREATE_CATEGORY, { name: nombre.trim(), type: tipo, isGlobal: false })
      setNombre('')
      cats.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function crearGrupo(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await gql(CREATE_MERCHANT_GROUP, { name: nombreGrupo.trim() })
      setNombreGrupo('')
      grupos.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const todas = cats.data?.categories ?? []
  const propias = todas.filter((c) => !c.isGlobal)
  const sistema = todas.filter((c) => c.isGlobal)

  const lista = (items: Categoria[], vacio: string) =>
    items.length === 0 ? (
      <p className="text-sm text-slate-500">{vacio}</p>
    ) : (
      <ul className="flex flex-wrap gap-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700"
          >
            {c.name}{' '}
            <span className="text-xs text-slate-500">
              · {c.type.toLowerCase() === 'income' ? 'ingreso' : 'gasto'}
            </span>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="space-y-4">
      {error && <MensajeError mensaje={error} />}

      <Panel titulo="Nueva categoría">
        <form onSubmit={crearCategoria} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className={INPUT}
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <select className={INPUT} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <button type="submit" className={BOTON}>
            Crear categoría
          </button>
        </form>
      </Panel>

      {cats.loading ? (
        <Spinner />
      ) : cats.error ? (
        <MensajeError mensaje={cats.error} onReintentar={cats.reload} />
      ) : (
        <>
          <Panel titulo={`Mis categorías (${propias.length})`}>
            {lista(propias, "Crea tu primera categoría personalizada con el formulario de arriba.")}
          </Panel>
          <Panel titulo="Categorías del sistema (solo lectura)">
            {lista(sistema, 'No hay categorías del sistema.')}
          </Panel>
        </>
      )}

      <Panel titulo={`Grupos de comercios (${grupos.data?.merchantGroups.length ?? 0})`}>
        <form onSubmit={crearGrupo} className="mb-3 flex gap-3">
          <input
            className={INPUT}
            placeholder="Nombre del grupo (ej. Restaurantes)"
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            required
          />
          <button type="submit" className={BOTON}>
            Crear
          </button>
        </form>
        {grupos.loading ? (
          <Spinner />
        ) : grupos.error ? (
          <MensajeError mensaje={grupos.error} onReintentar={grupos.reload} />
        ) : (grupos.data?.merchantGroups.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">
            Crea grupos como 'Restaurantes', 'Servicios' o 'Suscripciones' para agrupar tus
            establecimientos.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {grupos.data?.merchantGroups.map((g) => (
              <li key={g.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700">
                {g.name}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

export default CategoriasPage
