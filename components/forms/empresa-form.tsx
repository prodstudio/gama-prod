"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { createEmpresaAction, updateEmpresaAction } from "@/lib/actions/empresas-actions"
import type { Empresa, Plan } from "@/lib/types/database"
import Link from "next/link"

interface EmpresaFormProps {
  empresa?: Empresa
  planes: Plan[]
  mode: "create" | "edit"
}

export function EmpresaForm({ empresa, planes, mode }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [selectedPlan, setSelectedPlan] = useState(empresa?.plan_id || "none")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    // Si el plan seleccionado es "none", no lo enviamos
    if (selectedPlan === "none") {
      formData.delete("plan_id")
      formData.append("plan_id", "")
    }

    try {
      const result =
        mode === "create" ? await createEmpresaAction(formData) : await updateEmpresaAction(empresa!.id, formData)

      if (result?.error) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      }
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
          <Link href="/gama/empresas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "Crear Nueva Empresa" : "Editar Empresa"}
          </h1>
          <p className="text-gray-600">
            {mode === "create" ? "Registra una nueva empresa cliente" : "Modifica los datos de la empresa"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
          <CardDescription>Completa los datos de la empresa cliente</CardDescription>
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
                <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: TechCorp SA"
                  defaultValue={empresa?.nombre || ""}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.nombre && <p className="text-sm text-red-600">{fieldErrors.nombre[0]}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_contacto">Email de Contacto</Label>
                <Input
                  id="email_contacto"
                  name="email_contacto"
                  type="email"
                  placeholder="contacto@empresa.com"
                  defaultValue={empresa?.email_contacto || ""}
                  disabled={isLoading}
                />
                {fieldErrors.email_contacto && <p className="text-sm text-red-600">{fieldErrors.email_contacto[0]}</p>}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="+54-11-1234-5678"
                  defaultValue={empresa?.telefono || ""}
                  disabled={isLoading}
                />
                {fieldErrors.telefono && <p className="text-sm text-red-600">{fieldErrors.telefono[0]}</p>}
              </div>

              {/* Plan */}
              <div className="space-y-2">
                <Label htmlFor="plan_id">Plan Contratado</Label>
                <Select name="plan_id" value={selectedPlan} onValueChange={setSelectedPlan} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin plan asignado</SelectItem>
                    {planes.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.nombre} - ${plan.precio_mensual?.toLocaleString() || 0}/mes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.plan_id && <p className="text-sm text-red-600">{fieldErrors.plan_id[0]}</p>}
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                name="direccion"
                placeholder="Dirección completa de la empresa..."
                rows={3}
                defaultValue={empresa?.direccion || ""}
                disabled={isLoading}
              />
              {fieldErrors.direccion && <p className="text-sm text-red-600">{fieldErrors.direccion[0]}</p>}
            </div>

            {/* Estado activo */}
            <div className="flex items-center space-x-2">
              <Switch id="activa" name="activa" defaultChecked={empresa?.activa ?? true} disabled={isLoading} />
              <Label htmlFor="activa" className="font-normal">
                Empresa activa (puede realizar pedidos)
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
                  "Crear Empresa"
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/gama/empresas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
