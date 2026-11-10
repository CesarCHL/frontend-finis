export type Seccion =
  | 'dashboard'
  | 'movimientos'
  | 'establecimientos'
  | 'categorias'
  | 'presupuestos'
  | 'tarjetas'
  | 'familia'

const SECCIONES: { id: Seccion; etiqueta: string }[] = [
  { id: 'dashboard', etiqueta: '📊 Inicio' },
  { id: 'movimientos', etiqueta: '🧾 Movimientos' },
  { id: 'establecimientos', etiqueta: '🏪 Establecimientos' },
  { id: 'categorias', etiqueta: '🏷️ Categorías y grupos' },
  { id: 'presupuestos', etiqueta: '🎯 Presupuestos' },
  { id: 'tarjetas', etiqueta: '💳 Tarjetas' },
  { id: 'familia', etiqueta: '👨‍👩‍👧 Familia' },
]

interface SidebarProps {
  seleccionada: Seccion
  onSeleccionar: (seccion: Seccion) => void
}

function Sidebar({ seleccionada, onSeleccionar }: SidebarProps) {
  return (
    <aside className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <ul className="flex flex-row flex-wrap gap-2 md:flex-col">
        {SECCIONES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSeleccionar(s.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                seleccionada === s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
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
