import { useState } from 'react'
import { gql } from '../api/client'
import { ADD_CARD, DELETE_CARD, MY_CARDS } from '../api/operations'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import Spinner from '../components/Spinner'
import { useGql } from '../hooks/useGql'
import { BOTON, BOTON_PELIGRO, INPUT } from '../lib/estilos'
import type { Tarjeta } from '../types/finis'

function TarjetasPage() {
  const tarjetas = useGql<{ myCards: Tarjeta[] }>(MY_CARDS)
  const [banco, setBanco] = useState('')
  const [tipo, setTipo] = useState('DEBIT')
  const [last4, setLast4] = useState('')
  const [alias, setAlias] = useState('')
  const [error, setError] = useState('')

  async function agregar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await gql(ADD_CARD, { bank: banco, kind: tipo, last4, alias: alias || null })
      setBanco('')
      setLast4('')
      setAlias('')
      tarjetas.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function borrar(id: string) {
    try {
      await gql(DELETE_CARD, { id })
      tarjetas.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <Panel titulo="Agregar tarjeta">
        <form onSubmit={agregar} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input className={INPUT} placeholder="Banco" value={banco} onChange={(e) => setBanco(e.target.value)} required />
          <select className={INPUT} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="DEBIT">Débito</option>
            <option value="CREDIT">Crédito</option>
          </select>
          <input
            className={INPUT}
            placeholder="Últimos 4"
            maxLength={4}
            pattern="[0-9]{4}"
            value={last4}
            onChange={(e) => setLast4(e.target.value)}
            required
          />
          <input className={INPUT} placeholder="Alias (opcional)" value={alias} onChange={(e) => setAlias(e.target.value)} />
          <button type="submit" className={BOTON}>
            Agregar
          </button>
        </form>
        {error && (
          <div className="mt-3">
            <MensajeError mensaje={error} />
          </div>
        )}
      </Panel>

      <Panel titulo="Mis tarjetas">
        {tarjetas.loading ? (
          <Spinner />
        ) : tarjetas.error ? (
          <MensajeError mensaje={tarjetas.error} onReintentar={tarjetas.reload} />
        ) : (tarjetas.data?.myCards.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">Aún no tienes tarjetas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tarjetas.data?.myCards.map((t) => (
              <article
                key={t.id}
                className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-4 text-white shadow"
              >
                <p className="text-xs uppercase opacity-80">
                  {t.kind === 'CREDIT' ? 'Crédito' : 'Débito'} · {t.bank}
                </p>
                <p className="my-3 font-mono text-lg tracking-widest">•••• {t.last4}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.alias ?? 'Sin alias'}</span>
                  <button
                    type="button"
                    className={`${BOTON_PELIGRO} !text-white hover:!bg-white/20`}
                    onClick={() => borrar(t.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

export default TarjetasPage
