import { z } from "zod"

export const CATEGORIAS_PLATOS = ["entrada", "principal", "postre", "ensalada", "sopa", "bebida"] as const

export const TIPOS_PLATO = ["vegetariano", "vegano", "sin_gluten", "picante", "saludable"] as const

export const platoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().nullable(),
  tipo: z.string().max(50, "El tipo no puede exceder 50 caracteres").optional().nullable(),
  imagen_url: z.string().url("Debe ser una URL válida").optional().nullable().or(z.literal("")),
  activo: z.boolean().default(true),
})

export type PlatoFormData = z.infer<typeof platoSchema>

export const ingredientePlatoSchema = z.object({
  ingrediente_id: z.string().uuid("ID de ingrediente inválido"),
  cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  unidad_medida: z.string().min(1, "La unidad de medida es requerida"),
  es_opcional: z.boolean().default(false),
  notas: z.string().optional().nullable(),
})

export type IngredientePlatoFormData = z.infer<typeof ingredientePlatoSchema>
