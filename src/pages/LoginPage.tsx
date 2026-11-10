import { useState } from 'react'
import { gql, saveTokens, type Tokens } from '../api/client'
import { LOGIN, REGISTER } from '../api/operations'
import MensajeError from '../components/MensajeError'
import { BOTON, INPUT } from '../lib/estilos'

interface LoginPageProps {
  onEntrar: () => void
}

function LoginPage({ onEntrar }: LoginPageProps) {
  const [registro, setRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const data = registro
        ? await gql<{ register: Tokens }>(REGISTER, { name: nombre, email, password })
        : await gql<{ login: Tokens }>(LOGIN, { email, password })
      const t = 'register' in data ? data.register : data.login
      saveTokens({ accessToken: t.accessToken, refreshToken: t.refreshToken })
      onEntrar()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
      <form
        onSubmit={enviar}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow dark:bg-slate-800 dark:text-slate-100"
      >
        <h1 className="text-center text-2xl font-bold">💰 Finis</h1>
        <p className="text-center text-sm text-slate-500">
          {registro ? 'Crea tu cuenta' : 'Inicia sesión'}
        </p>
        {error && <MensajeError mensaje={error} />}
        {registro && (
          <input
            className={INPUT}
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        )}
        <input
          className={INPUT}
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={INPUT}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={enviando} className={`${BOTON} w-full`}>
          {enviando ? 'Enviando...' : registro ? 'Registrarme' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => setRegistro((r) => !r)}
          className="w-full text-sm text-emerald-600 hover:underline"
        >
          {registro ? 'Ya tengo cuenta' : 'Crear una cuenta'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
