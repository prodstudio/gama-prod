"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, X } from "lucide-react"
import { createSucursalAction, updateSucursalAction } from "@/lib/actions/empresas-actions"
import type { Sucursal } from "@/lib/types/database"

interface SucursalFormProps {
  empresaId: string
  sucursal?: Sucursal | null
  onClose: () => void
  mode: "create" | "edit"
}

export function SucursalForm({ empresaId, sucursal, onClose, mode }: SucursalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const result =
        mode === "create"
          ? await createSucursalAction(empresaId, formData)
          : await updateSucursalAction(sucursal!.id, formData)

      if (result?.error) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else {
        onClose()
      }
    } catch (err) {
      setError("Error inesperado. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gama-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{mode === "create" ? "Nueva Sucursal" : "Editar Sucursal"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Sucursal *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej: Oficina Central"
                defaultValue={sucursal?.nombre || ""}
                disabled={isLoading}
                required
              />
              {fieldErrors.nombre && <p className="text-sm text-red-600">{fieldErrors.nombre[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                placeholder="+54-11-1234-5678"
                defaultValue={sucursal?.telefono || ""}
                disabled={isLoading}
              />
              {fieldErrors.telefono && <p className="text-sm text-red-600">{fieldErrors.telefono[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Textarea
              id="direccion"
              name="direccion"
              placeholder="Dirección completa de la sucursal..."
              rows={2}
              defaultValue={sucursal?.direccion || ""}
              disabled={isLoading}
              required
            />
            {fieldErrors.direccion && <p className="text-sm text-red-600">{fieldErrors.direccion[0]}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="activa" name="activa" defaultChecked={sucursal?.activa ?? true} disabled={isLoading} />
            <Label htmlFor="activa" className="font-normal">
              Sucursal activa (disponible para entregas)
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creando..." : "Guardando..."}
                </>
              ) : mode === "create" ? (
                "Crear Sucursal"
              ) : (
                "Guardar Cambios"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
