import { z } from "zod"

export const menuSemanalSchema = z.object({
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fecha_fin: z.string().min(1, "La fecha de fin es obligatoria"),
  activo: z.boolean().default(true),
  publicado: z.boolean().default(false),
})

export const menuPlatoSchema = z.object({
  menu_semanal_id: z.string().uuid("ID de menú semanal inválido"),
  plato_id: z.string().uuid("ID de plato inválido"),
  dia_semana: z.number().min(1).max(7, "Día de semana debe estar entre 1 y 7"),
})

export const crearMenuSemanalSchema = z.object({
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fecha_fin: z.string().min(1, "La fecha de fin es obligatoria"),
  activo: z.boolean().default(true),
  publicado: z.boolean().default(false),
  platos: z
    .array(
      z.object({
        plato_id: z.string().uuid("ID de plato inválido"),
        dia_semana: z.number().min(1).max(7, "Día de semana debe estar entre 1 y 7"),
      }),
    )
    .min(1, "Debe asignar al menos un plato"),
})

export type MenuSemanalInput = z.infer<typeof menuSemanalSchema>
export type MenuPlatoInput = z.infer<typeof menuPlatoSchema>
export type CrearMenuSemanalInput = z.infer<typeof crearMenuSemanalSchema>
