export type Seccion =
  | 'dashboard'
  | 'movimientos'
  | 'establecimientos'
  | 'categorias'
  | 'presupuestos'
  | 'tarjetas'
  | 'familia'

const SECCIONES: { id: Seccion; etiqueta: string }[] = [
  { id: 'dashboard', etiqueta: '⌂  Inicio' },
  { id: 'movimientos', etiqueta: '⇄  Movimientos' },
  { id: 'establecimientos', etiqueta: '▤  Establecimientos' },
  { id: 'categorias', etiqueta: '◇  Categorías y grupos' },
  { id: 'presupuestos', etiqueta: '▥  Presupuestos' },
  { id: 'tarjetas', etiqueta: '▭  Tarjetas' },
  { id: 'familia', etiqueta: '♧  Familia' },
]

interface SidebarProps {
  seleccionada: Seccion
  onSeleccionar: (seccion: Seccion) => void
}

function Sidebar({ seleccionada, onSeleccionar }: SidebarProps) {
  return (
    <aside className="finis-sidebar">
      <div className="finis-brand">FINIS<span>FINANZAS PERSONALES<br />Y FAMILIARES</span></div>
      <ul className="flex flex-row flex-wrap gap-2 md:flex-col">
        {SECCIONES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSeleccionar(s.id)}
              className={`finis-nav-link ${seleccionada === s.id ? 'active' : ''}`}
            >
              {s.etiqueta}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
