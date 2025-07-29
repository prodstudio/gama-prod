import { z } from "zod"

export const planSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),
  incluye_entrada: z.boolean().default(false),
  incluye_postre: z.boolean().default(false),
  incluye_bebida: z.boolean().default(false),
  precio_mensual: z
    .number()
    .min(0, "El precio debe ser mayor a 0")
    .max(999999.99, "El precio es demasiado alto")
    .optional(),
  activo: z.boolean().default(true),
})

export type PlanFormData = z.infer<typeof planSchema>
