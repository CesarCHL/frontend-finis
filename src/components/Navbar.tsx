interface NavbarProps {
  nombre: string
  oscuro: boolean
  onCambiarTema: () => void
  onSalir: () => void
}

function Navbar({ nombre, oscuro, onCambiarTema, onSalir }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between bg-emerald-600 px-4 py-3 text-white shadow dark:bg-emerald-900">
      <span className="text-lg font-bold">💰 Finis</span>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">Hola, {nombre}</span>
        <button
          type="button"
          onClick={onCambiarTema}
          className="rounded-lg bg-white/20 px-3 py-1 hover:bg-white/30"
        >
          {oscuro ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
        <button
          type="button"
          onClick={onSalir}
          className="rounded-lg bg-white/20 px-3 py-1 hover:bg-white/30"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}

export default Navbar
