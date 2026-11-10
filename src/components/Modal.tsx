import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

function Modal({ titulo, onCerrar, children }: ModalProps) {
  // Ciclo de vida: cierra con Escape mientras el modal esté montado
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
