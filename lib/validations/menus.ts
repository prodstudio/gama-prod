import { z } from "zod"

export const menuSemanalSchema = z.object({
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  activo: z.boolean().default(true),
  publicado: z.boolean().default(false),
  platos: z
    .array(
      z.object({
        plato_id: z.string().uuid("ID de plato inválido"),
        dia_semana: z.number().min(1).max(7, "Día de semana debe estar entre 1 y 7"),
      }),
    )
    .optional()
    .default([]),
})

export type MenuSemanalFormData = z.infer<typeof menuSemanalSchema>

export const menuPlatoSchema = z.object({
  menu_semanal_id: z.string().uuid("ID de menú semanal inválido"),
  plato_id: z.string().uuid("ID de plato inválido"),
  dia_semana: z.number().min(1).max(7, "Día de semana debe estar entre 1 y 7"),
})

export type MenuPlatoFormData = z.infer<typeof menuPlatoSchema>
