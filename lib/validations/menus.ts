import { z } from "zod"

export const menuSemanalSchema = z
  .object({
    fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
    fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
    activo: z.boolean().default(false),
    publicado: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const inicio = new Date(data.fecha_inicio)
      const fin = new Date(data.fecha_fin)
      return fin > inicio
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fecha_fin"],
    },
  )

export const menuPlatoSchema = z.object({
  plato_id: z.string().uuid("ID de plato inválido"),
  dia_semana: z.number().min(1).max(7, "Día de semana debe estar entre 1 y 7"),
})

export const crearMenuSemanalSchema = menuSemanalSchema.extend({
  platos: z.array(menuPlatoSchema).min(1, "Debe asignar al menos un plato"),
})

export type MenuSemanalInput = z.infer<typeof menuSemanalSchema>
export type MenuPlatoInput = z.infer<typeof menuPlatoSchema>
export type CrearMenuSemanalInput = z.infer<typeof crearMenuSemanalSchema>
