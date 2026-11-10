interface TarjetaResumenProps {
  titulo: string
  valor: string
  detalle?: string
  color?: 'verde' | 'rojo' | 'neutro'
}

const COLORES = {
  verde: 'text-emerald-600 dark:text-emerald-400',
  rojo: 'text-red-600 dark:text-red-400',
  neutro: 'text-slate-800 dark:text-slate-100',
}

function TarjetaResumen({
  titulo,
  valor,
  detalle,
  color = 'neutro',
}: TarjetaResumenProps) {
  return (
    <article className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h3 className="text-sm text-slate-500 dark:text-slate-400">{titulo}</h3>
      <p className={`text-2xl font-bold ${COLORES[color]}`}>{valor}</p>
      {detalle && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{detalle}</p>
      )}
    </article>
  )
}

export default TarjetaResumen
