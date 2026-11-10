const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'https://finis-api.onrender.com/graphql'

const TOKENS_KEY = 'finis.tokens'
export const EVENTO_SESION_EXPIRADA = 'finis:sesion-expirada'

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export class ApiError extends Error {
  code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.code = code
  }
}

export function getTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

export function saveTokens(tokens: Tokens | null) {
  try {
    if (tokens) localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    else localStorage.removeItem(TOKENS_KEY)
  } catch {
    // localStorage no disponible: la sesión dura solo mientras la pestaña esté abierta
  }
}

interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string; extensions?: { code?: string } }[]
}

async function post<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  token?: string,
): Promise<GraphQLResponse<T>> {
  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 'NETWORK')
  }
  if (!res.ok) throw new ApiError(`Error del servidor (${res.status}).`, 'HTTP')
  return (await res.json()) as GraphQLResponse<T>
}

function primerError(res: GraphQLResponse<unknown>): ApiError | null {
  const e = res.errors?.[0]
  return e ? new ApiError(e.message, e.extensions?.code) : null
}

const REFRESH = /* GraphQL */ `
  mutation Refresh($t: String!) {
    refreshToken(refreshToken: $t) {
      accessToken
      refreshToken
    }
  }
`

async function renovarTokens(): Promise<Tokens | null> {
  const actuales = getTokens()
  if (!actuales) return null
  try {
    const res = await post<{ refreshToken: Tokens }>(REFRESH, {
      t: actuales.refreshToken,
    })
    if (res.errors || !res.data) return null
    const nuevos = {
      accessToken: res.data.refreshToken.accessToken,
      refreshToken: res.data.refreshToken.refreshToken,
    }
    saveTokens(nuevos)
    return nuevos
  } catch {
    return null
  }
}

/** Ejecuta una operación GraphQL; si el access token venció, lo renueva una vez y reintenta. */
export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let res = await post<T>(query, variables, getTokens()?.accessToken)
  let error = primerError(res)

  if (error?.code === 'UNAUTHENTICATED' && getTokens()) {
    const nuevos = await renovarTokens()
    if (nuevos) {
      res = await post<T>(query, variables, nuevos.accessToken)
      error = primerError(res)
    } else {
      saveTokens(null)
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
  }

  if (error) throw error
  if (!res.data) throw new ApiError('Respuesta vacía del servidor.')
  return res.data
}
