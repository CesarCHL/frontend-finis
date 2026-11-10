import { opcionesAlcance, type ValorAlcance } from '../lib/alcance'
import { INPUT } from '../lib/estilos'
import type { Usuario } from '../types/finis'

interface SelectorAlcanceProps {
  usuario: Usuario
  valor: ValorAlcance
  onCambiar: (valor: ValorAlcance) => void
}

function SelectorAlcance({ usuario, valor, onCambiar }: SelectorAlcanceProps) {
  const opciones = opcionesAlcance(usuario)
  if (opciones.length === 0) return null
  return (
    <label className="flex items-center gap-2 text-sm">
      Ver:
      <select
        className={`${INPUT} !w-auto`}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectorAlcance
