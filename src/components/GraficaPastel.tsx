const COLORES = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
]

interface Rebanada {
  etiqueta: string
  valor: number
}

interface GraficaPastelProps {
  datos: Rebanada[]
  centro: string
}

/** Gráfica de pastel/dona con conic-gradient (sin librerías). */
function GraficaPastel({ datos, centro }: GraficaPastelProps) {
  const total = datos.reduce((s, d) => s + d.valor, 0)
  const tramos = datos.map((d, i) => {
    const antes = datos.slice(0, i).reduce((suma, x) => suma + x.valor, 0)
    const inicio = (antes / total) * 100
    const fin = ((antes + d.valor) / total) * 100
    return `${COLORES[i % COLORES.length]} ${inicio}% ${fin}%`
  })

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${tramos.join(', ')})` }}
        role="img"
        aria-label="Gasto por categoría"
      >
        <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white text-center text-xs font-semibold dark:bg-slate-800">
          {centro}
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {datos.map((d, i) => (
          <li key={d.etiqueta} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: COLORES[i % COLORES.length] }}
            />
            {d.etiqueta} · {((d.valor / total) * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GraficaPastel
