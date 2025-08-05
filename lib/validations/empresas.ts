import { z } from "zod"

export const empresaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  descuento_porcentaje: z
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%")
    .default(0),
})

export const sucursalSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  responsable_nombre: z.string().optional(),
  responsable_telefono: z.string().optional(),
  dias_entrega: z.array(z.number().min(1).max(7)).min(1, "Debe seleccionar al menos un día").default([1, 2, 3, 4, 5]),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
export type SucursalFormData = z.infer<typeof sucursalSchema>

// Días de la semana para el selector
export const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
]
