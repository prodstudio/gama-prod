// Tipos para validación manual (sin Zod para evitar conflictos)
export interface MenuSemanalFormData {
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  platos: Array<{
    plato_id: string
    dia_semana: number
  }>
}

export interface MenuPlatoFormData {
  menu_id: string
  plato_id: string
  dia_semana: number
}

// Función de validación manual
export function validateMenuSemanal(data: MenuSemanalFormData): string | null {
  if (!data.fecha_inicio) return "La fecha de inicio es requerida"
  if (!data.fecha_fin) return "La fecha de fin es requerida"

  const fechaInicio = new Date(data.fecha_inicio)
  const fechaFin = new Date(data.fecha_fin)

  if (fechaFin < fechaInicio) {
    return "La fecha de fin debe ser posterior o igual a la fecha de inicio"
  }

  const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 6) {
    return "El menú semanal no puede durar más de 7 días"
  }

  if (!data.platos || data.platos.length === 0) {
    return "Debes agregar al menos un plato al menú"
  }

  // Validar platos
  for (const plato of data.platos) {
    if (!plato.plato_id) return "ID de plato inválido"
    if (plato.dia_semana < 1 || plato.dia_semana > 7) {
      return "Día de semana debe estar entre 1 y 7"
    }
  }

  return null
}

export function validateMenuPlato(data: MenuPlatoFormData): string | null {
  if (!data.menu_id) return "ID de menú inválido"
  if (!data.plato_id) return "ID de plato inválido"
  if (data.dia_semana < 1 || data.dia_semana > 7) {
    return "Día de semana debe estar entre 1 y 7"
  }

  return null
}
