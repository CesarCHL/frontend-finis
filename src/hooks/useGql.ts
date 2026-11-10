import { useEffect, useState } from 'react'
import { gql } from '../api/client'

interface Resultado<T> {
  key: string
  data?: T
  error?: string
}

/**
 * Consulta GraphQL ligada al ciclo de vida del componente (useEffect).
 * `loading` se deriva de la clave de la petición: mientras no llegue la respuesta
 * de la clave actual, se está cargando (y se muestra el Spinner).
 */
export function useGql<T>(
  query: string,
  variables?: Record<string, unknown>,
  enabled = true,
) {
  const [recarga, setRecarga] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)
  const key = JSON.stringify([query, variables ?? null, recarga])

  useEffect(() => {
    if (!enabled) return
    let cancelado = false
    const [q, v] = JSON.parse(key) as [string, Record<string, unknown> | null, number]
    gql<T>(q, v ?? undefined)
      .then((data) => {
        if (!cancelado) setResultado({ key, data })
      })
      .catch((e: Error) => {
        if (!cancelado) setResultado({ key, error: e.message })
      })
    return () => {
      cancelado = true
    }
  }, [key, enabled])

  const vigente = resultado?.key === key
  return {
    data: vigente ? resultado.data : undefined,
    error: vigente ? resultado.error : undefined,
    loading: enabled && !vigente,
    reload: () => setRecarga((n) => n + 1),
  }
}
