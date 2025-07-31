import { z } from "zod"

export const menuSemanalSchema = z
  .object({
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
      .default([]),
  })
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio)
      const fechaFin = new Date(data.fecha_fin)
      return fechaFin >= fechaInicio
    },
    {
      message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
      path: ["fecha_fin"],
    },
  )
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio)
      const fechaFin = new Date(data.fecha_fin)
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    },
    {
      message: "El menú no puede durar más de 7 días",
      path: ["fecha_fin"],
    },
  )

export type MenuSemanalFormData = z.infer<typeof menuSemanalSchema>
