import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function IngredientesStats() {
  const [{ count: totalIngredientes }, { count: ingredientesActivos }, { data: ingredientesPorCategoria }] =
    await Promise.all([
      supabaseAdmin.from("ingredientes").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("ingredientes").select("*", { count: "exact", head: true }).eq("activo", true),
      supabaseAdmin.from("ingredientes").select("categoria").not("categoria", "is", null).eq("activo", true),
    ])

  // Contar ingredientes por categoría
  const categoriaCount = ingredientesPorCategoria?.reduce(
    (acc, item) => {
      const categoria = item.categoria || "Sin categoría"
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoriasOrdenadas = Object.entries(categoriaCount || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 categorías

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total de ingredientes</span>
            <span className="font-medium">{totalIngredientes || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ingredientes activos</span>
            <span className="font-medium text-green-600">{ingredientesActivos || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ingredientes inactivos</span>
            <span className="font-medium text-gray-500">{(totalIngredientes || 0) - (ingredientesActivos || 0)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriasOrdenadas.length > 0 ? (
            <div className="space-y-2">
              {categoriasOrdenadas.map(([categoria, count]) => (
                <div key={categoria} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{categoria}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay ingredientes categorizados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
