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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { createEmpresaAction, updateEmpresaAction } from "@/lib/actions/empresas-actions"
import type { Empresa, Plan } from "@/lib/types/database"
import Link from "next/link"

interface SucursalData {
  id: string
  nombre: string
  direccion: string
  responsable_nombre: string
  responsable_telefono: string
  dias_entrega: number[]
}

interface EmpresaFormProps {
  empresa?: Empresa
  planes: Plan[]
  mode: "create" | "edit"
}

const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
  { id: 6, nombre: "Sábado" },
  { id: 7, nombre: "Domingo" },
]

export function EmpresaForm({ empresa, planes, mode }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [selectedPlan, setSelectedPlan] = useState(empresa?.plan_id || "none")
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(empresa?.descuento_porcentaje || 0)

  // Estado para sucursales
  const [sucursales, setSucursales] = useState<SucursalData[]>([
    {
      id: "1",
      nombre: "Sucursal 1",
      direccion: "",
      responsable_nombre: "",
      responsable_telefono: "",
      dias_entrega: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
    },
  ])

  const planSeleccionado = planes.find((p) => p.id === selectedPlan)
  const precioBase = planSeleccionado?.precio_mensual || 0
  const descuento = (precioBase * descuentoPorcentaje) / 100
  const totalPorVianda = precioBase - descuento

  const agregarSucursal = () => {
    const nuevaSucursal: SucursalData = {
      id: (sucursales.length + 1).toString(),
      nombre: `Sucursal ${sucursales.length + 1}`,
      direccion: "",
      responsable_nombre: "",
      responsable_telefono: "",
      dias_entrega: [1, 2, 3, 4, 5],
    }
    setSucursales([...sucursales, nuevaSucursal])
  }

  const eliminarSucursal = (id: string) => {
    if (sucursales.length > 1) {
      setSucursales(sucursales.filter((s) => s.id !== id))
    }
  }

  const actualizarSucursal = (id: string, campo: keyof SucursalData, valor: any) => {
    setSucursales(sucursales.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)))
  }

  const toggleDiaEntrega = (sucursalId: string, dia: number) => {
    const sucursal = sucursales.find((s) => s.id === sucursalId)
    if (!sucursal) return

    const nuevosdias = sucursal.dias_entrega.includes(dia)
      ? sucursal.dias_entrega.filter((d) => d !== dia)
      : [...sucursal.dias_entrega, dia].sort()

    actualizarSucursal(sucursalId, "dias_entrega", nuevosdias)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    // Agregar datos de descuento
    formData.append("descuento_porcentaje", descuentoPorcentaje.toString())

    // Agregar datos de sucursales
    formData.append("sucursales", JSON.stringify(sucursales))

    // Si el plan seleccionado es "none", no lo enviamos
    if (selectedPlan === "none") {
      formData.delete("plan_id")
      formData.append("plan_id", "")
    }

    const result =
      mode === "create" ? await createEmpresaAction(formData) : await updateEmpresaAction(empresa!.id, formData)

    // Si result es undefined, significa que el redirect funcionó correctamente
    if (result?.error) {
      setError(result.error)
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
      setIsLoading(false)
    }
    // Si no hay error, el redirect ya ocurrió y no necesitamos hacer nada más
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
            {mode === "create" ? "Añadir Nueva Empresa" : "Editar Empresa"}
          </h1>
          <p className="text-gray-600">
            {mode === "create" ? "Registra una nueva empresa cliente" : "Modifica los datos de la empresa"}
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Datos Generales */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Generales</CardTitle>
            <CardDescription>Información básica de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Razón Social */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Razón Social *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Tech Solutions S.A."
                  defaultValue={empresa?.nombre || ""}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.nombre && <p className="text-sm text-red-600">{fieldErrors.nombre[0]}</p>}
              </div>

              {/* CUIT */}
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT</Label>
                <Input id="cuit" name="cuit" placeholder="Ej: 30-12345678-9" disabled={isLoading} />
              </div>

              {/* Ingresos Brutos */}
              <div className="space-y-2">
                <Label htmlFor="ingresos_brutos">Ingresos Brutos</Label>
                <Input
                  id="ingresos_brutos"
                  name="ingresos_brutos"
                  placeholder="Ej: 901-123456-7"
                  disabled={isLoading}
                />
              </div>

              {/* Cantidad de Comensales */}
              <div className="space-y-2">
                <Label htmlFor="cantidad_comensales">Cantidad de Comensales (Estimado)</Label>
                <Input
                  id="cantidad_comensales"
                  name="cantidad_comensales"
                  type="number"
                  placeholder="Ej: 50"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto Principal</CardTitle>
            <CardDescription>Información del contacto principal de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Nombre y Apellido */}
              <div className="space-y-2">
                <Label htmlFor="contacto_nombre">Nombre y Apellido</Label>
                <Input id="contacto_nombre" name="contacto_nombre" placeholder="Ej: Ana Torres" disabled={isLoading} />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_contacto">Email</Label>
                <Input
                  id="email_contacto"
                  name="email_contacto"
                  type="email"
                  placeholder="Ej: ana.t@empresa.com"
                  defaultValue={empresa?.email_contacto || ""}
                  disabled={isLoading}
                />
                {fieldErrors.email_contacto && <p className="text-sm text-red-600">{fieldErrors.email_contacto[0]}</p>}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="Ej: 11-5555-4444"
                  defaultValue={empresa?.telefono || ""}
                  disabled={isLoading}
                />
                {fieldErrors.telefono && <p className="text-sm text-red-600">{fieldErrors.telefono[0]}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan y Sucursales */}
        <Card>
          <CardHeader>
            <CardTitle>Plan y Sucursales</CardTitle>
            <CardDescription>
              Define el plan contratado y las direcciones de entrega. Puedes añadir múltiples sucursales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan y Descuento */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Plan Contratado */}
              <div className="space-y-2">
                <Label htmlFor="plan_id">Plan Contratado</Label>
                <Select name="plan_id" value={selectedPlan} onValueChange={setSelectedPlan} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar un plan" />
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

              {/* Descuento % */}
              <div className="space-y-2">
                <Label htmlFor="descuento_porcentaje">Descuento %</Label>
                <div className="relative">
                  <Input
                    id="descuento_porcentaje"
                    name="descuento_porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={descuentoPorcentaje}
                    onChange={(e) => setDescuentoPorcentaje(Number.parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                </div>
              </div>

              {/* Total por Vianda */}
              <div className="space-y-2">
                <Label>Total por Vianda</Label>
                <div className="text-2xl font-bold text-green-600">
                  ${totalPorVianda.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </div>
                {descuentoPorcentaje > 0 && (
                  <p className="text-sm text-gray-500">
                    Precio base: ${precioBase.toLocaleString("es-AR", { minimumFractionDigits: 2 })} - Descuento: $
                    {descuento.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Sucursales */}
            <div className="space-y-6">
              {sucursales.map((sucursal, index) => (
                <Card key={sucursal.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">{sucursal.nombre}</CardTitle>
                    {sucursales.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarSucursal(sucursal.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dirección */}
                    <div className="space-y-2">
                      <Label htmlFor={`direccion_${sucursal.id}`}>Dirección</Label>
                      <Textarea
                        id={`direccion_${sucursal.id}`}
                        placeholder="Ej: Av. Corrientes 1234, CABA"
                        value={sucursal.direccion}
                        onChange={(e) => actualizarSucursal(sucursal.id, "direccion", e.target.value)}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Responsable de Recepción */}
                      <div className="space-y-2">
                        <Label htmlFor={`responsable_${sucursal.id}`}>Responsable de Recepción</Label>
                        <Input
                          id={`responsable_${sucursal.id}`}
                          placeholder="Ej: Juan Pérez"
                          value={sucursal.responsable_nombre}
                          onChange={(e) => actualizarSucursal(sucursal.id, "responsable_nombre", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Teléfono del Responsable */}
                      <div className="space-y-2">
                        <Label htmlFor={`responsable_tel_${sucursal.id}`}>Teléfono del Responsable (Opcional)</Label>
                        <Input
                          id={`responsable_tel_${sucursal.id}`}
                          placeholder="Ej: 11-3333-2222"
                          value={sucursal.responsable_telefono}
                          onChange={(e) => actualizarSucursal(sucursal.id, "responsable_telefono", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Días de Entrega */}
                    <div className="space-y-3">
                      <Label>Días de Entrega</Label>
                      <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
                        {DIAS_SEMANA.map((dia) => (
                          <div key={dia.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dia_${sucursal.id}_${dia.id}`}
                              checked={sucursal.dias_entrega.includes(dia.id)}
                              onCheckedChange={() => toggleDiaEntrega(sucursal.id, dia.id)}
                              disabled={isLoading}
                            />
                            <Label
                              htmlFor={`dia_${sucursal.id}_${dia.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {dia.nombre}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Botón Añadir Sucursal */}
              <Button
                type="button"
                variant="outline"
                onClick={agregarSucursal}
                disabled={isLoading}
                className="w-full bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Otra Sucursal
              </Button>
            </div>

            {/* Estado activo */}
            <Separator />
            <div className="flex items-center space-x-2">
              <Switch id="activa" name="activa" defaultChecked={empresa?.activa ?? true} disabled={isLoading} />
              <Label htmlFor="activa" className="font-normal">
                Empresa activa (puede realizar pedidos)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creando..." : "Guardando..."}
              </>
            ) : mode === "create" ? (
              "Guardar Empresa"
            ) : (
              "Guardar Cambios"
            )}
          </Button>
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/gama/empresas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
