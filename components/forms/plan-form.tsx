"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { createPlanAction, updatePlanAction } from "@/lib/actions/planes-actions"
import type { Plan } from "@/lib/types/database"
import Link from "next/link"

interface PlanFormProps {
  plan?: Plan
  mode: "create" | "edit"
}

export function PlanForm({ plan, mode }: PlanFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const result = mode === "create" ? await createPlanAction(formData) : await updatePlanAction(plan!.id, formData)

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
          <Link href="/gama/planes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{mode === "create" ? "Crear Nuevo Plan" : "Editar Plan"}</h1>
          <p className="text-gray-600">
            {mode === "create" ? "Define un nuevo plan de contratación" : "Modifica los detalles del plan"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Plan</CardTitle>
          <CardDescription>Completa los detalles del plan de contratación</CardDescription>
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
                <Label htmlFor="nombre">Nombre del Plan *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Plan Básico"
                  defaultValue={plan?.nombre || ""}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.nombre && <p className="text-sm text-red-600">{fieldErrors.nombre[0]}</p>}
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="precio_mensual">Precio Mensual</Label>
                <Input
                  id="precio_mensual"
                  name="precio_mensual"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="15000.00"
                  defaultValue={plan?.precio_mensual || ""}
                  disabled={isLoading}
                />
                {fieldErrors.precio_mensual && <p className="text-sm text-red-600">{fieldErrors.precio_mensual[0]}</p>}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Describe las características del plan..."
                rows={3}
                defaultValue={plan?.descripcion || ""}
                disabled={isLoading}
              />
              {fieldErrors.descripcion && <p className="text-sm text-red-600">{fieldErrors.descripcion[0]}</p>}
            </div>

            {/* Características incluidas */}
            <div className="space-y-4">
              <Label className="text-base font-medium">¿Qué incluye este plan?</Label>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="incluye_entrada"
                    name="incluye_entrada"
                    defaultChecked={plan?.incluye_entrada || false}
                    disabled={isLoading}
                  />
                  <Label htmlFor="incluye_entrada" className="font-normal">
                    Incluye Entrada
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="incluye_postre"
                    name="incluye_postre"
                    defaultChecked={plan?.incluye_postre || false}
                    disabled={isLoading}
                  />
                  <Label htmlFor="incluye_postre" className="font-normal">
                    Incluye Postre
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="incluye_bebida"
                    name="incluye_bebida"
                    defaultChecked={plan?.incluye_bebida || false}
                    disabled={isLoading}
                  />
                  <Label htmlFor="incluye_bebida" className="font-normal">
                    Incluye Bebida
                  </Label>
                </div>
              </div>
            </div>

            {/* Estado activo */}
            <div className="flex items-center space-x-2">
              <Switch id="activo" name="activo" defaultChecked={plan?.activo ?? true} disabled={isLoading} />
              <Label htmlFor="activo" className="font-normal">
                Plan activo (disponible para asignar a empresas)
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
                  "Crear Plan"
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/gama/planes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
