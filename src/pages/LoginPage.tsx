import { useState } from 'react'
import { gql, saveTokens, type Tokens } from '../api/client'
import { LOGIN, REGISTER } from '../api/operations'
import MensajeError from '../components/MensajeError'

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
    <div className="finis-auth">
      <form
        onSubmit={enviar}
        className="finis-auth-card"
      >
        <h1 className="finis-auth-brand">FINIS</h1>
        <p className="finis-auth-kicker">FINANZAS PERSONALES Y FAMILIARES</p>
        <div className="finis-auth-divider" />
        <h2 className="finis-auth-title">
          {registro ? 'Crea tu cuenta' : 'Inicia sesión'}
        </h2>
        <p className="finis-auth-subtitle">{registro ? 'Comienza a organizar tus finanzas.' : 'Tu dinero, más claro.'}</p>
        {error && <MensajeError mensaje={error} />}
        {registro && (
          <input
            className="finis-auth-input"
            aria-label="Nombre"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        )}
        <input
          className="finis-auth-input"
          aria-label="Correo"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="finis-auth-input"
          aria-label="Contraseña"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={enviando} className="finis-auth-submit">
          {enviando ? 'Enviando...' : registro ? 'Registrarme' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => setRegistro((r) => !r)}
          className="finis-auth-switch"
        >
          {registro ? 'Ya tengo cuenta' : 'Crear una cuenta'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
