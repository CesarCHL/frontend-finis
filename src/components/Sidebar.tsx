interface SidebarProps {
  categorias: string[]
  seleccionada: string
  onSeleccionar: (categoria: string) => void
}

function Sidebar({ categorias, seleccionada, onSeleccionar }: SidebarProps) {
  return (
    <aside className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 font-semibold text-slate-700 dark:text-slate-200">
        Categorías
      </h2>
      <ul className="flex flex-row flex-wrap gap-2 md:flex-col">
        {['Todas', ...categorias].map((categoria) => (
          <li key={categoria}>
            <button
              type="button"
              onClick={() => onSeleccionar(categoria)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                seleccionada === categoria
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {categoria}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
