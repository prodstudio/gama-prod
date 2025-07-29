"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { createIngredienteAction, updateIngredienteAction } from "@/lib/actions/ingredientes-actions"
import { CATEGORIAS_INGREDIENTES, UNIDADES_MEDIDA } from "@/lib/validations/ingredientes"
import type { Ingrediente } from "@/lib/types/database"
import Link from "next/link"

interface IngredienteFormProps {
  ingrediente?: Ingrediente
  mode: "create" | "edit"
}

export function IngredienteForm({ ingrediente, mode }: IngredienteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [selectedCategoria, setSelectedCategoria] = useState(ingrediente?.categoria || "Sin categoría")
  const [selectedUnidad, setSelectedUnidad] = useState(ingrediente?.unidad_de_medida || "Unidad")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const result =
        mode === "create"
          ? await createIngredienteAction(formData)
          : await updateIngredienteAction(ingrediente!.id, formData)

      if (result?.error) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      }
      // Si no hay error, la acción redirige automáticamente
    } catch (err) {
      setError("Error inesperado. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/gama/ingredientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "Crear Nuevo Ingrediente" : "Editar Ingrediente"}
          </h1>
          <p className="text-gray-600">
            {mode === "create" ? "Agrega un nuevo ingrediente al catálogo" : "Modifica los detalles del ingrediente"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Ingrediente</CardTitle>
          <CardDescription>Completa los detalles del ingrediente</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Ingrediente *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Pollo"
                  defaultValue={ingrediente?.nombre || ""}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.nombre && <p className="text-sm text-red-600">{fieldErrors.nombre[0]}</p>}
              </div>

              {/* Unidad de medida */}
              <div className="space-y-2">
                <Label htmlFor="unidad_de_medida">Unidad de Medida *</Label>
                <Select
                  name="unidad_de_medida"
                  value={selectedUnidad}
                  onValueChange={setSelectedUnidad}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.unidad_de_medida && (
                  <p className="text-sm text-red-600">{fieldErrors.unidad_de_medida[0]}</p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  name="categoria"
                  value={selectedCategoria}
                  onValueChange={setSelectedCategoria}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sin categoría">Sin categoría</SelectItem>
                    {CATEGORIAS_INGREDIENTES.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.categoria && <p className="text-sm text-red-600">{fieldErrors.categoria[0]}</p>}
              </div>
            </div>

            {/* Estado activo */}
            <div className="flex items-center space-x-2">
              <Switch id="activo" name="activo" defaultChecked={ingrediente?.activo ?? true} disabled={isLoading} />
              <Label htmlFor="activo" className="font-normal">
                Ingrediente activo (disponible para usar en platos)
              </Label>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creando..." : "Guardando..."}
                  </>
                ) : mode === "create" ? (
                  "Crear Ingrediente"
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/gama/ingredientes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
