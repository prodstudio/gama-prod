import { z } from "zod"

export const empresaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  email_contacto: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val === "" || z.string().email().safeParse(val).success, {
      message: "Email inválido",
    }),
  telefono: z.string().trim().max(20, "El teléfono no puede exceder 20 caracteres").optional(),
  direccion: z.string().trim().max(500, "La dirección no puede exceder 500 caracteres").optional(),
  plan_id: z.string().trim().optional(),
  activa: z.boolean().default(true),
})

export const sucursalSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  direccion: z
    .string()
    .min(1, "La dirección es requerida")
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres")
    .trim(),
  telefono: z.string().trim().max(20, "El teléfono no puede exceder 20 caracteres").optional(),
  activa: z.boolean().default(true),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
export type SucursalFormData = z.infer<typeof sucursalSchema>
