function Spinner() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      <span>Cargando...</span>
    </div>
  )
}

export default Spinner
