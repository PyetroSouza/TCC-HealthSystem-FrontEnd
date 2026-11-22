
import {
  Pill,
  Droplets,
  FlaskConical,
  FlaskRound,
  Milk,
  Syringe,
  Package,
  Paintbrush,
  SprayCan
} from 'lucide-react'

const iconesDosagem = {
  comprimido: Pill,
  cápsula: Pill,
  gotas: Droplets,
  solução: FlaskConical,
  xarope: Milk,
  suspensão: FlaskRound,
  injeção: Syringe,
  pomada: Package,
  creme: Paintbrush,
  spray: SprayCan
}

export function obterIconeDosagem(tipoDosagem) {
  const tipo = String(tipoDosagem ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')

  return iconesDosagem[tipo] ?? Pill
}
