import { useEffect, useState } from 'react'
import {
  EVENTO_SESION_EXPIRADA,
  getTokens,
  gql,
  saveTokens,
} from './api/client'
import { LOGOUT, ME } from './api/operations'
import MensajeError from './components/MensajeError'
import Navbar from './components/Navbar'
import Sidebar, { type Seccion } from './components/Sidebar'
import Spinner from './components/Spinner'
import { useGql } from './hooks/useGql'
import { INPUT } from './lib/estilos'
import SelectorAlcance from './components/SelectorAlcance'
import { argumentosAlcance, opcionesAlcance } from './lib/alcance'
import { MESES } from './lib/format'
import CategoriasPage from './pages/CategoriasPage'
import DashboardPage from './pages/DashboardPage'
import EstablecimientosPage from './pages/EstablecimientosPage'
import FamiliaPage from './pages/FamiliaPage'
import LoginPage from './pages/LoginPage'
import MovimientosPage from './pages/MovimientosPage'
import PresupuestosPage from './pages/PresupuestosPage'
import TarjetasPage from './pages/TarjetasPage'
import type { Usuario } from './types/finis'

function App() {
  const hoy = new Date()

  // Estado (useState)
  const [sesion, setSesion] = useState(() => getTokens() !== null)
  const [oscuro, setOscuro] = useState(false)
  const [seccion, setSeccion] = useState<Seccion>('dashboard')
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [alcanceSel, setAlcanceSel] = useState('yo')

  const perfil = useGql<{ me: Usuario | null }>(ME, undefined, sesion)

  // Ciclo de vida: aplica el tema al <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
  }, [oscuro])

  // Ciclo de vida: si el servidor invalida la sesión, regresa al login
  useEffect(() => {
    const alExpirar = () => setSesion(false)
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [])

  // Ciclo de vida: título de la pestaña según la sección
  useEffect(() => {
    document.title = `Finis · ${seccion}`
  }, [seccion])

  async function salir() {
    try {
      await gql(LOGOUT, { refreshToken: getTokens()?.refreshToken })
    } catch {
      // aunque falle en el servidor, se cierra la sesión local
    }
    saveTokens(null)
    setSesion(false)
  }

  if (!sesion) {
    return (
      <LoginPage
        onEntrar={() => {
          setSesion(true)
          perfil.reload()
        }}
      />
    )
  }

  const usuario = perfil.data?.me
  const periodo = { month: mes, year: anio }
  // Si el alcance elegido ya no es válido (p. ej. salió de la familia), se vuelve a "Yo"
  const valido = usuario ? opcionesAlcance(usuario).some((o) => o.valor === alcanceSel) : false
  const alcance = argumentosAlcance(valido ? alcanceSel : 'yo')

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Navbar
        nombre={usuario?.name ?? ''}
        oscuro={oscuro}
        onCambiarTema={() => setOscuro((o) => !o)}
        onSalir={salir}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Sidebar seleccionada={seccion} onSeleccionar={setSeccion} />
        </div>

        <section className="space-y-4 md:col-span-3">
          {perfil.loading ? (
            <Spinner />
          ) : perfil.error || !usuario ? (
            <MensajeError
              mensaje={perfil.error ?? 'No se pudo cargar tu perfil.'}
              onReintentar={perfil.reload}
            />
          ) : (
            <>
              {(seccion === 'dashboard' ||
                seccion === 'movimientos' ||
                seccion === 'presupuestos') && (
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className={`${INPUT} !w-auto`}
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                  >
                    {MESES.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`${INPUT} !w-24`}
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                  />
                  {usuario && seccion !== 'presupuestos' && (
                    <SelectorAlcance
                      usuario={usuario}
                      valor={valido ? alcanceSel : 'yo'}
                      onCambiar={setAlcanceSel}
                    />
                  )}
                </div>
              )}

              {seccion === 'dashboard' && (
                <DashboardPage periodo={periodo} alcance={alcance} />
              )}
              {seccion === 'movimientos' && (
                <MovimientosPage periodo={periodo} alcance={alcance} usuario={usuario} />
              )}
              {seccion === 'establecimientos' && <EstablecimientosPage />}
              {seccion === 'categorias' && <CategoriasPage />}
              {seccion === 'presupuestos' && <PresupuestosPage periodo={periodo} />}
              {seccion === 'tarjetas' && <TarjetasPage />}
              {seccion === 'familia' && (
                <FamiliaPage usuario={usuario} onCambio={perfil.reload} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
