interface NavbarProps {
  nombre: string
  oscuro: boolean
  onCambiarTema: () => void
  onSalir: () => void
}

function Navbar({ nombre, oscuro, onCambiarTema, onSalir }: NavbarProps) {
  return (
    <nav className="finis-navbar sticky top-0 z-10 flex items-center justify-between px-4 py-3">
      <span className="finis-navbar-name">FINIS</span>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">Hola, {nombre}</span>
        <button
          type="button"
          onClick={onCambiarTema}
          className="finis-top-button"
        >
          {oscuro ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
        <button
          type="button"
          onClick={onSalir}
          className="finis-top-button"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}

export default Navbar
