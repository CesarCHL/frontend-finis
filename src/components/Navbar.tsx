interface NavbarProps {
  oscuro: boolean
  onCambiarTema: () => void
  totalCarrito: number
}

function Navbar({ oscuro, onCambiarTema, totalCarrito }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between bg-indigo-600 px-4 py-3 text-white shadow dark:bg-indigo-900">
      <span className="text-lg font-bold">📊 Dashboard de Productos</span>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
          🛒 {totalCarrito}
        </span>
        <button
          type="button"
          onClick={onCambiarTema}
          className="rounded-lg bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
        >
          {oscuro ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
