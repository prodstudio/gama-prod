"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import { crearMenuSemanal } from "@/lib/actions/menus-actions"

interface Plato {
  id: string
  nombre: string
  tipo: string
}

interface PlatoAsignado {
  plato_id: string
  dia_semana: number
  plato?: Plato
}

export function MenuSemanalForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [platos, setPlatos] = useState<Plato[]>([])
  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    activo: false,
    publicado: false,
  })
  const [platosAsignados, setPlatosAsignados] = useState<PlatoAsignado[]>([])

  const diasSemana = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 7, label: "Domingo" },
  ]

  useEffect(() => {
    fetchPlatos()
  }, [])

  const fetchPlatos = async () => {
    try {
      const response = await fetch("/api/platos")
      if (response.ok) {
        const data = await response.json()
        setPlatos(data)
      }
    } catch (error) {
      console.error("Error fetching platos:", error)
      toast.error("Error al cargar los platos")
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const agregarPlato = () => {
    setPlatosAsignados((prev) => [
      ...prev,
      {
        plato_id: "",
        dia_semana: 1,
      },
    ])
  }

  const removerPlato = (index: number) => {
    setPlatosAsignados((prev) => prev.filter((_, i) => i !== index))
  }

  const actualizarPlatoAsignado = (index: number, field: "plato_id" | "dia_semana", value: string | number) => {
    setPlatosAsignados((prev) =>
      prev.map((plato, i) => {
        if (i === index) {
          const updated = { ...plato, [field]: value }
          if (field === "plato_id") {
            updated.plato = platos.find((p) => p.id === value)
          }
          return updated
        }
        return plato
      }),
    )
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.fecha_inicio) {
      errors.push("La fecha de inicio es requerida")
    }

    if (!formData.fecha_fin) {
      errors.push("La fecha de fin es requerida")
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio)
      const fin = new Date(formData.fecha_fin)

      if (fin <= inicio) {
        errors.push("La fecha de fin debe ser posterior a la fecha de inicio")
      }
    }

    const platosValidos = platosAsignados.filter((p) => p.plato_id && p.dia_semana)
    if (platosValidos.length === 0) {
      errors.push("Debe asignar al menos un plato")
    }

    // Verificar duplicados
    const duplicados = new Set()
    for (const plato of platosValidos) {
      const key = `${plato.plato_id}-${plato.dia_semana}`
      if (duplicados.has(key)) {
        errors.push("No puede asignar el mismo plato al mismo día")
        break
      }
      duplicados.add(key)
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
      return
    }

    setLoading(true)

    try {
      const platosValidos = platosAsignados.filter((p) => p.plato_id && p.dia_semana)

      const result = await crearMenuSemanal({
        ...formData,
        platos: platosValidos,
      })

      if (result.success) {
        toast.success("Menú semanal creado exitosamente")
        router.push("/gama/menus")
      } else {
        toast.error(result.error || "Error al crear el menú semanal")
      }
    } catch (error) {
      console.error("Error creating menu:", error)
      toast.error("Error al crear el menú semanal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha de Fin</Label>
          <Input
            id="fecha_fin"
            type="date"
            value={formData.fecha_fin}
            onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => handleInputChange("activo", checked)}
          />
          <Label htmlFor="activo">Menú Activo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="publicado"
            checked={formData.publicado}
            onCheckedChange={(checked) => handleInputChange("publicado", checked)}
          />
          <Label htmlFor="publicado">Publicado</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platos del Menú</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarPlato}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Plato
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {platosAsignados.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay platos asignados. Haz clic en "Agregar Plato" para comenzar.
            </p>
          ) : (
            platosAsignados.map((platoAsignado, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label>Plato</Label>
                  <Select
                    value={platoAsignado.plato_id}
                    onValueChange={(value) => actualizarPlatoAsignado(index, "plato_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plato" />
                    </SelectTrigger>
                    <SelectContent>
                      {platos.map((plato) => (
                        <SelectItem key={plato.id} value={plato.id}>
                          <div className="flex items-center gap-2">
                            <span>{plato.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {plato.tipo}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Label>Día</Label>
                  <Select
                    value={platoAsignado.dia_semana.toString()}
                    onValueChange={(value) => actualizarPlatoAsignado(index, "dia_semana", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value.toString()}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => removerPlato(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Menú Semanal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
