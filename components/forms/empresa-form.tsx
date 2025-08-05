"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"
import { createEmpresa, updateEmpresa } from "@/lib/actions/empresas-actions"
import { DIAS_SEMANA } from "@/lib/validations/empresas"

interface EmpresaFormProps {
  empresa?: {
    id: string
    nombre: string
    email: string
    telefono: string
    direccion: string
    descuento_porcentaje?: number
    sucursales?: Array<{
      id: string
      nombre: string
      direccion: string
      responsable_nombre?: string
      responsable_telefono?: string
      dias_entrega?: number[]
    }>
  }
  isEditing?: boolean
}

interface Sucursal {
  nombre: string
  direccion: string
  responsable_nombre: string
  responsable_telefono: string
  dias_entrega: number[]
}

export function EmpresaForm({ empresa, isEditing = false }: EmpresaFormProps) {
  const [sucursales, setSucursales] = useState<Sucursal[]>(
    empresa?.sucursales?.map((s) => ({
      nombre: s.nombre,
      direccion: s.direccion,
      responsable_nombre: s.responsable_nombre || "",
      responsable_telefono: s.responsable_telefono || "",
      dias_entrega: s.dias_entrega || [1, 2, 3, 4, 5],
    })) || [
      {
        nombre: "",
        direccion: "",
        responsable_nombre: "",
        responsable_telefono: "",
        dias_entrega: [1, 2, 3, 4, 5],
      },
    ],
  )

  const agregarSucursal = () => {
    setSucursales([
      ...sucursales,
      {
        nombre: "",
        direccion: "",
        responsable_nombre: "",
        responsable_telefono: "",
        dias_entrega: [1, 2, 3, 4, 5],
      },
    ])
  }

  const eliminarSucursal = (index: number) => {
    if (sucursales.length > 1) {
      setSucursales(sucursales.filter((_, i) => i !== index))
    }
  }

  const actualizarSucursal = (index: number, campo: keyof Sucursal, valor: any) => {
    const nuevasSucursales = [...sucursales]
    nuevasSucursales[index] = { ...nuevasSucursales[index], [campo]: valor }
    setSucursales(nuevasSucursales)
  }

  const toggleDiaEntrega = (sucursalIndex: number, dia: number) => {
    const sucursal = sucursales[sucursalIndex]
    const diasActuales = sucursal.dias_entrega
    const nuevosDias = diasActuales.includes(dia)
      ? diasActuales.filter((d) => d !== dia)
      : [...diasActuales, dia].sort()

    actualizarSucursal(sucursalIndex, "dias_entrega", nuevosDias)
  }

  const handleSubmit = async (formData: FormData) => {
    // Agregar datos de sucursales al FormData
    sucursales.forEach((sucursal, index) => {
      formData.append(`sucursales[${index}][nombre]`, sucursal.nombre)
      formData.append(`sucursales[${index}][direccion]`, sucursal.direccion)
      formData.append(`sucursales[${index}][responsable_nombre]`, sucursal.responsable_nombre)
      formData.append(`sucursales[${index}][responsable_telefono]`, sucursal.responsable_telefono)
      formData.append(`sucursales[${index}][dias_entrega]`, JSON.stringify(sucursal.dias_entrega))
    })

    if (isEditing && empresa?.id) {
      await updateEmpresa(empresa.id, formData)
    } else {
      await createEmpresa(formData)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la empresa</Label>
              <Input id="nombre" name="nombre" defaultValue={empresa?.nombre} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={empresa?.email} required />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" defaultValue={empresa?.telefono} required />
            </div>
            <div>
              <Label htmlFor="descuento_porcentaje">Descuento (%)</Label>
              <Input
                id="descuento_porcentaje"
                name="descuento_porcentaje"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={empresa?.descuento_porcentaje || 0}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" defaultValue={empresa?.direccion} required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sucursales</CardTitle>
          <Button type="button" onClick={agregarSucursal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Sucursal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sucursales.map((sucursal, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Sucursal {index + 1}</h4>
                {sucursales.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => eliminarSucursal(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Nombre de la sucursal</Label>
                  <Input
                    value={sucursal.nombre}
                    onChange={(e) => actualizarSucursal(index, "nombre", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={sucursal.direccion}
                    onChange={(e) => actualizarSucursal(index, "direccion", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Responsable</Label>
                  <Input
                    value={sucursal.responsable_nombre}
                    onChange={(e) => actualizarSucursal(index, "responsable_nombre", e.target.value)}
                    placeholder="Nombre del responsable"
                  />
                </div>
                <div>
                  <Label>Teléfono del responsable</Label>
                  <Input
                    value={sucursal.responsable_telefono}
                    onChange={(e) => actualizarSucursal(index, "responsable_telefono", e.target.value)}
                    placeholder="Teléfono del responsable"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Días de entrega</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sucursal-${index}-dia-${dia.value}`}
                        checked={sucursal.dias_entrega.includes(dia.value)}
                        onCheckedChange={() => toggleDiaEntrega(index, dia.value)}
                      />
                      <Label htmlFor={`sucursal-${index}-dia-${dia.value}`} className="text-sm font-normal">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{isEditing ? "Actualizar Empresa" : "Crear Empresa"}</Button>
      </div>
    </form>
  )
}
