import { z } from "zod"

export const ingredienteSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  unidad_de_medida: z
    .string()
    .min(1, "La unidad de medida es requerida")
    .max(50, "La unidad de medida no puede exceder 50 caracteres")
    .trim(),
  categoria: z.string().max(100, "La categoría no puede exceder 100 caracteres").trim().optional(),
  activo: z.boolean().default(true),
})

export type IngredienteFormData = z.infer<typeof ingredienteSchema>

// Categorías predefinidas para el selector
export const CATEGORIAS_INGREDIENTES = [
  "proteína",
  "carbohidrato",
  "verdura",
  "fruta",
  "lácteo",
  "grasa",
  "condimento",
  "especia",
  "legumbre",
  "cereal",
  "otro",
] as const

// Unidades de medida comunes
export const UNIDADES_MEDIDA = [
  "gramos",
  "kilogramos",
  "ml",
  "litros",
  "unidades",
  "cucharadas",
  "cucharaditas",
  "tazas",
  "pizca",
  "al gusto",
] as const
