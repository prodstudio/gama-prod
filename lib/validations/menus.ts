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
      .min(1, "Debe agregar al menos un plato"),
  })
  .refine((data) => new Date(data.fecha_inicio) < new Date(data.fecha_fin), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["fecha_fin"],
  })

export type MenuSemanalFormData = z.infer<typeof menuSemanalSchema>
