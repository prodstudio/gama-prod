import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Search } from "lucide-react"
import Link from "next/link"
import { DeleteIngredienteButton } from "@/components/forms/delete-ingrediente-button"

interface IngredientesPageProps {
  searchParams: {
    search?: string
    categoria?: string
  }
}

export default async function IngredientesPage({ searchParams }: IngredientesPageProps) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  let query = supabaseAdmin.from("ingredientes").select("*")

  // Aplicar filtros
  if (searchParams.search) {
    query = query.ilike("nombre", `%${searchParams.search}%`)
  }

  if (searchParams.categoria && searchParams.categoria !== "all") {
    query = query.eq("categoria", searchParams.categoria)
  }

  const { data: ingredientes, error } = await query.order("nombre", { ascending: true })

  if (error) {
    console.error("Error fetching ingredientes:", error)
  }

  // Obtener categorías únicas para el filtro
  const { data: categorias } = await supabaseAdmin.from("ingredientes").select("categoria").not("categoria", "is", null)

  const categoriasUnicas = [...new Set(categorias?.map((c) => c.categoria).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ingredientes</h1>
          <p className="text-gray-600">Administra los ingredientes disponibles para crear platos</p>
        </div>
        <Button asChild>
          <Link href="/gama/ingredientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ingrediente
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="search" className="text-sm font-medium mb-2 block">
                Buscar por nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  name="search"
                  placeholder="Buscar ingredientes..."
                  defaultValue={searchParams.search || ""}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="categoria" className="text-sm font-medium mb-2 block">
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                defaultValue={searchParams.categoria || "all"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="all">Todas las categorías</option>
                {categoriasUnicas.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ingredientes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ingredientes?.map((ingrediente) => (
          <Card key={ingrediente.id} className={!ingrediente.activo ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ingrediente.nombre}</CardTitle>
                  <CardDescription className="mt-1">
                    {ingrediente.unidad_de_medida}
                    {ingrediente.categoria && ` • ${ingrediente.categoria}`}
                  </CardDescription>
                </div>
                <Badge variant={ingrediente.activo ? "default" : "secondary"}>
                  {ingrediente.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                  <Link href={`/gama/ingredientes/${ingrediente.id}/editar`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
                <DeleteIngredienteButton ingredienteId={ingrediente.id} ingredienteNombre={ingrediente.nombre} />
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No hay ingredientes registrados</p>
                <Button asChild>
                  <Link href="/gama/ingredientes/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer ingrediente
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {ingredientes && ingredientes.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {ingredientes.length} ingrediente{ingredientes.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
