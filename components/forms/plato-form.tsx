"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, ChefHat } from "lucide-react"
import { createPlatoAction, updatePlatoAction } from "@/lib/actions/platos-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Ingrediente {
  id: string
  nombre: string
  categoria: string
  unidad_de_medida: string
  activo: boolean
}

interface PlatoIngrediente {
  ingrediente_id: string
  cantidad: number
  ingrediente?: {
    id: string
    nombre: string
    unidad_de_medida: string
  }
}

interface PlatoFormProps {
  plato?: {
    id: string
    nombre: string
    descripcion?: string
    tipo?: string
    imagen_url?: string
    activo: boolean
    plato_ingredientes?: PlatoIngrediente[]
  }
  ingredientesDisponibles: Ingrediente[]
}

export function PlatoForm({ plato, ingredientesDisponibles = [] }: PlatoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIngredientes, setSelectedIngredientes] = useState<PlatoIngrediente[]>(plato?.plato_ingredientes || [])

  const agregarIngrediente = () => {
    setSelectedIngredientes([
      ...selectedIngredientes,
      {
        ingrediente_id: "",
        cantidad: 0,
      },
    ])
  }

  const removerIngrediente = (index: number) => {
    setSelectedIngredientes(selectedIngredientes.filter((_, i) => i !== index))
  }

  const actualizarIngrediente = (index: number, field: keyof PlatoIngrediente, value: any) => {
    const updated = [...selectedIngredientes]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedIngredientes(updated)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // 1. Filtrar ingredientes que son válidos para guardar
      const ingredientesValidos = selectedIngredientes.filter(
        (ing) => ing.ingrediente_id && ing.cantidad > 0
      )

      // 2. *** MODIFICACIÓN CLAVE ***
      // Se crea un nuevo array que contiene SÓLO los campos que existen en la tabla 'plato_ingredientes'.
      // Esto evita enviar datos extra (como 'unidad_de_medida') que causaban el error en la base de datos.
      const ingredientesParaGuardar = ingredientesValidos.map((ing) => ({
        ingrediente_id: ing.ingrediente_id,
        cantidad: ing.cantidad,
      }));

      // 3. Agregar la lista de ingredientes ya limpia al FormData para enviarla a la Server Action.
      formData.set("ingredientes", JSON.stringify(ingredientesParaGuardar))

      if (plato) {
        await updatePlatoAction(plato.id, formData)
        toast.success("Plato actualizado correctamente")
      } else {
        await createPlatoAction(formData)
        toast.success("Plato creado correctamente")
      }

      // Navegar manualmente después del éxito
      router.push("/gama/platos")
      router.refresh()
    } catch (error: any) {
      console.error("Error submitting form:", error)
      if (error?.message && !error.message.includes("NEXT_REDIRECT")) {
        toast.error(error.message)
      } else {
        toast.error("Error inesperado al procesar el formulario")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Información básica del plato */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del plato *</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={plato?.nombre || ""}
            placeholder="Ej: Pasta Carbonara"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de plato</Label>
          <Select name="tipo" defaultValue={plato?.tipo || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="principal">Principal</SelectItem>
              <SelectItem value="postre">Postre</SelectItem>
              <SelectItem value="bebida">Bebida</SelectItem>
              <SelectItem value="acompañamiento">Acompañamiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={plato?.descripcion || ""}
          placeholder="Describe el plato, sus características principales..."
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imagen_url">Imagen del plato</Label>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upload de archivo */}
            <div className="space-y-2">
              <Label htmlFor="imagen_file" className="text-sm text-muted-foreground">
                Subir desde dispositivo
              </Label>
              <Input id="imagen_file" name="imagen_file" type="file" accept="image/*" className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, WebP (máx. 5MB)</p>
            </div>

            {/* URL manual */}
            <div className="space-y-2">
              <Label htmlFor="imagen_url" className="text-sm text-muted-foreground">
                O ingresa una URL
              </Label>
              <Input
                id="imagen_url"
                name="imagen_url"
                type="url"
                defaultValue={plato?.imagen_url || ""}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="activo" name="activo" defaultChecked={plato?.activo !== false} />
        <Label htmlFor="activo">Plato activo</Label>
      </div>

      <Separator />

      {/* Sección de ingredientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ingredientes</h3>
            <p className="text-sm text-muted-foreground">Selecciona los ingredientes y sus cantidades</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={agregarIngrediente}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar ingrediente
          </Button>
        </div>

        {selectedIngredientes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground text-center">
                No hay ingredientes seleccionados.
                <br />
                Haz clic en "Agregar ingrediente" para comenzar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedIngredientes.map((ingredienteSeleccionado, index) => {
              // Usar find de forma segura
              const ingrediente = ingredientesDisponibles?.find?.(
                (i) => i.id === ingredienteSeleccionado.ingrediente_id,
              )

              return (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`ingrediente-${index}`}>Ingrediente</Label>
                        <Select
                          value={ingredienteSeleccionado.ingrediente_id}
                          onValueChange={(value) => actualizarIngrediente(index, "ingrediente_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un ingrediente" />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredientesDisponibles?.map?.((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                <div className="flex items-center gap-2">
                                  <span>{ing.nombre}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {ing.categoria}
                                  </Badge>
                                </div>
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32">
                        <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`cantidad-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={ingredienteSeleccionado.cantidad}
                            onChange={(e) =>
                              actualizarIngrediente(index, "cantidad", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                          {ingrediente && (
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {ingrediente.unidad_de_medida}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerIngrediente(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Botones de acción */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : plato ? "Actualizar plato" : "Crear plato"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/gama/platos")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
