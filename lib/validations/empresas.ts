import { z } from "zod"

export const empresaSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  email_contacto: z
    .string()
    .email("Email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  telefono: z.string().max(20, "El teléfono no puede exceder 20 caracteres").optional().or(z.literal("")),
  direccion: z.string().max(500, "La dirección no puede exceder 500 caracteres").optional().or(z.literal("")),
  plan_id: z.string().uuid("Debe seleccionar un plan válido").optional().or(z.literal("")),
  activa: z.boolean().default(true),
})

export const sucursalSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres"),
  telefono: z.string().max(20, "El teléfono no puede exceder 20 caracteres").optional().or(z.literal("")),
  activa: z.boolean().default(true),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
export type SucursalFormData = z.infer<typeof sucursalSchema>
