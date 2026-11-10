interface MensajeErrorProps {
  mensaje: string
  onReintentar?: () => void
}

function MensajeError({ mensaje, onReintentar }: MensajeErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      <p>{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default MensajeError
