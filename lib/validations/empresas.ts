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
  descuento_porcentaje: z
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%")
    .optional(),
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
  responsable_nombre: z
    .string()
    .min(1, "El nombre del responsable es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  responsable_telefono: z.string().trim().max(20, "El teléfono no puede exceder 20 caracteres").optional(),
  dias_entrega: z.array(z.number().min(1).max(7)).min(1, "Debe seleccionar al menos un día de entrega"),
  activa: z.boolean().default(true),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
export type SucursalFormData = z.infer<typeof sucursalSchema>
