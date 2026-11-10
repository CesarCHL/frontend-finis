import type { Producto } from '../types/producto'

interface TarjetaProductoProps {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

function TarjetaProducto({ producto, onAgregar }: TarjetaProductoProps) {
  return (
    <article className="flex flex-col rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-slate-100 text-5xl dark:bg-slate-700">
        {producto.imagen}
      </div>
      <span className="text-xs font-medium uppercase text-indigo-600 dark:text-indigo-400">
        {producto.categoria}
      </span>
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">
        {producto.nombre}
      </h3>
      <p className="mb-3 flex-1 text-sm text-slate-500 dark:text-slate-400">
        {producto.descripcion}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 dark:text-slate-100">
          ${producto.precio.toLocaleString('es-MX')}
        </span>
        <button
          type="button"
          onClick={() => onAgregar(producto)}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
        >
          Agregar
        </button>
      </div>
    </article>
  )
}

export default TarjetaProducto
