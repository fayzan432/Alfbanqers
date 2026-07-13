export type UnitSystem = 'metric' | 'imperial'

export function kgToLb(kg: number): number {
  return kg * 2.2046226218
}

export function lbToKg(lb: number): number {
  return lb / 2.2046226218
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54
}

export function displayWeight(kg: number, units: UnitSystem): string {
  return units === 'metric' ? `${kg.toFixed(1)} kg` : `${kgToLb(kg).toFixed(1)} lb`
}

export function displayHeight(cm: number, units: UnitSystem): string {
  if (units === 'metric') return `${Math.round(cm)} cm`
  const { feet, inches } = cmToFeetInches(cm)
  return `${feet}'${inches}"`
}

export function mlToOz(ml: number): number {
  return ml / 29.5735
}

export function ozToMl(oz: number): number {
  return oz * 29.5735
}

export function displayVolume(ml: number, units: UnitSystem): string {
  return units === 'metric' ? `${ml} ml` : `${mlToOz(ml).toFixed(1)} oz`
}
