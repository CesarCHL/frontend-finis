import type { ReactNode } from 'react'

interface PanelProps {
  titulo: string
  children: ReactNode
}

function Panel({ titulo, children }: PanelProps) {
  return (
    <section className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 font-semibold text-slate-700 dark:text-slate-200">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export default Panel
