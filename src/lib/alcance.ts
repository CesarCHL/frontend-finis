import type { Usuario } from '../types/finis'

/** Valor del selector: "yo", "familia" o el id de un integrante. */
export type ValorAlcance = string

/** Solo un padre o madre con al menos otro integrante puede elegir (igual que en el móvil). */
export function opcionesAlcance(usuario: Usuario) {
  const familia = usuario.family
  if (usuario.familyRole !== 'PARENT' || !familia || familia.members.length < 2)
    return []
  return [
    { valor: 'yo', etiqueta: 'Yo' },
    ...familia.members
      .filter((m) => m.user.id !== usuario.id)
      .map((m) => ({ valor: m.user.id, etiqueta: m.user.name })),
    { valor: 'familia', etiqueta: 'Toda la familia' },
  ]
}

export function argumentosAlcance(valor: ValorAlcance) {
  if (valor === 'yo') return { ownerId: null, wholeFamily: false }
  if (valor === 'familia') return { ownerId: null, wholeFamily: true }
  return { ownerId: valor, wholeFamily: false }
}
