import { useState } from 'react'
import { gql } from '../api/client'
import {
  ACCEPT_FAMILY_INVITE,
  CREATE_FAMILY,
  CREATE_FAMILY_INVITE,
  LEAVE_FAMILY,
  REMOVE_FAMILY_MEMBER,
} from '../api/operations'
import MensajeError from '../components/MensajeError'
import Panel from '../components/Panel'
import { BOTON, BOTON_PELIGRO, INPUT } from '../lib/estilos'
import { formatoFecha } from '../lib/format'
import type { FamilyRole, Usuario } from '../types/finis'

interface FamiliaPageProps {
  usuario: Usuario
  onCambio: () => void
}

const ROL: Record<FamilyRole, string> = {
  PARENT: 'Padre/Madre',
  CHILD: 'Hijo/a',
}

function FamiliaPage({ usuario, onCambio }: FamiliaPageProps) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [invitacion, setInvitacion] = useState<{
    code: string
    role: FamilyRole
    expiresAt: string
  } | null>(null)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)

  async function ejecutar(accion: () => Promise<void>) {
    setError('')
    try {
      await accion()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const crearFamilia = (e: React.FormEvent) => {
    e.preventDefault()
    void ejecutar(async () => {
      await gql(CREATE_FAMILY, { name: nombre.trim() })
      onCambio()
    })
  }

  const unirse = (e: React.FormEvent) => {
    e.preventDefault()
    void ejecutar(async () => {
      await gql(ACCEPT_FAMILY_INVITE, { code: codigo.trim() })
      onCambio()
    })
  }

  const invitar = (role: FamilyRole) =>
    ejecutar(async () => {
      const d = await gql<{
        createFamilyInvite: { code: string; role: FamilyRole; expiresAt: string }
      }>(CREATE_FAMILY_INVITE, { role })
      setInvitacion(d.createFamilyInvite)
      setCopiado(false)
    })

  const quitar = (userId: string, nombreMiembro: string) => {
    if (
      !window.confirm(
        `¿Quitar a ${nombreMiembro}? Dejará de pertenecer a la familia y tú ya no verás sus gastos. Conserva sus propios datos.`,
      )
    )
      return
    void ejecutar(async () => {
      await gql(REMOVE_FAMILY_MEMBER, { userId })
      onCambio()
    })
  }

  const salir = () => {
    if (!window.confirm('Dejarás de ver los gastos de los demás y ellos los tuyos. ¿Salir de la familia?'))
      return
    void ejecutar(async () => {
      await gql(LEAVE_FAMILY)
      onCambio()
    })
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const familia = usuario.family
  const esPadre = usuario.familyRole === 'PARENT'

  return (
    <div className="space-y-4">
      {error && <MensajeError mensaje={error} />}

      {familia ? (
        <>
          <Panel titulo={`Mi familia · ${familia.name}`}>
            <p className="mb-2 text-xs text-slate-500">
              {familia.members.length} {familia.members.length === 1 ? 'integrante' : 'integrantes'}
            </p>
            <ul className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
              {familia.members.map((m) => (
                <li key={m.user.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {m.user.name}
                    {m.user.id === usuario.id && ' (tú)'}
                    <span className="block text-xs text-slate-500">
                      {ROL[m.role]} · {m.user.email}
                    </span>
                  </span>
                  {esPadre && m.user.id !== usuario.id && (
                    <button
                      type="button"
                      className={BOTON_PELIGRO}
                      onClick={() => quitar(m.user.id, m.user.name)}
                    >
                      Quitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" className={`${BOTON_PELIGRO} mt-3`} onClick={salir}>
              Salir de la familia
            </button>
          </Panel>

          {esPadre && (
            <Panel titulo="Invitar a alguien">
              <p className="mb-3 text-sm text-slate-500">¿A quién invitas?</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={BOTON} onClick={() => invitar('CHILD')}>
                  Hijo/a
                </button>
                <button type="button" className={BOTON} onClick={() => invitar('PARENT')}>
                  Padre/Madre
                </button>
              </div>
              {invitacion && (
                <div className="mt-4 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-700">
                  <p>Código de invitación</p>
                  <p className="my-1 font-mono text-xl tracking-widest">{invitacion.code}</p>
                  <p className="text-xs text-slate-500">
                    Se une como {ROL[invitacion.role].toLowerCase()}. Es de un solo uso y vence el{' '}
                    {formatoFecha(invitacion.expiresAt)}.
                  </p>
                  <button
                    type="button"
                    className={`${BOTON} mt-2`}
                    onClick={() =>
                      copiar(
                        `Únete a mi familia en Finis con este código: ${invitacion.code} (vence en 72 horas).`,
                      )
                    }
                  >
                    {copiado ? '¡Copiado!' : 'Compartir (copiar mensaje)'}
                  </button>
                </div>
              )}
            </Panel>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Aún no tienes familia. Crea una para invitar a tus hijos, o únete con el código que
            te dieron.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel titulo="Crear una familia">
              <form onSubmit={crearFamilia} className="flex gap-3">
                <input
                  className={INPUT}
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <button type="submit" className={BOTON}>
                  Crear
                </button>
              </form>
            </Panel>
            <Panel titulo="Tengo un código">
              <form onSubmit={unirse} className="flex gap-3">
                <input
                  className={INPUT}
                  placeholder="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
                <button type="submit" className={BOTON}>
                  Unirme
                </button>
              </form>
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}

export default FamiliaPage
