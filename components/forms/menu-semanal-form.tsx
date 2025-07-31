"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { crearMenuSemanal } from "@/lib/actions/menus-actions"

interface Plato {
  id: string
  nombre: string
  categoria: string
}

interface MenuPlatoData {
  plato_id: string
  dia_semana: number
}

interface FormData {
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  platos: MenuPlatoData[]
}

const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
]

export function MenuSemanalForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [platos, setPlatos] = useState<Plato[]>([])
  const [formData, setFormData] = useState<FormData>({
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
    publicado: false,
    platos: [],
  })

  // Cargar platos disponibles
  useEffect(() => {
    async function fetchPlatos() {
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
    fetchPlatos()
  }, [])

  // Validación manual del formulario
  const validateForm = (): string | null => {
    if (!formData.fecha_inicio) return "La fecha de inicio es requerida"
    if (!formData.fecha_fin) return "La fecha de fin es requerida"
    if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
      return "La fecha de fin debe ser posterior a la fecha de inicio"
    }
    if (formData.platos.length === 0) return "Debe agregar al menos un plato"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)
    try {
      const result = await crearMenuSemanal(formData)
      if (result.success) {
        toast.success("Menú semanal creado exitosamente")
        router.push("/gama/menus")
      } else {
        toast.error(result.error || "Error al crear el menú semanal")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al crear el menú semanal")
    } finally {
      setLoading(false)
    }
  }

  const agregarPlato = (platoId: string, diaSemana: number) => {
    // Verificar que no exista ya este plato en este día
    const existe = formData.platos.some((p) => p.plato_id === platoId && p.dia_semana === diaSemana)

    if (existe) {
      toast.error("Este plato ya está asignado a este día")
      return
    }

    setFormData((prev) => ({
      ...prev,
      platos: [...prev.platos, { plato_id: platoId, dia_semana: diaSemana }],
    }))
  }

  const removerPlato = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      platos: prev.platos.filter((_, i) => i !== index),
    }))
  }

  const getPlatoNombre = (platoId: string) => {
    const plato = platos.find((p) => p.id === platoId)
    return plato?.nombre || "Plato no encontrado"
  }

  const getDiaNombre = (dia: number) => {
    const diaObj = DIAS_SEMANA.find((d) => d.value === dia)
    return diaObj?.label || "Día no válido"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha de Fin</Label>
          <Input
            id="fecha_fin"
            type="date"
            value={formData.fecha_fin}
            onChange={(e) => setFormData((prev) => ({ ...prev, fecha_fin: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Configuración */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
          />
          <Label htmlFor="activo">Menú Activo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="publicado"
            checked={formData.publicado}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, publicado: checked }))}
          />
          <Label htmlFor="publicado">Publicado</Label>
        </div>
      </div>

      {/* Asignación de platos */}
      <Card>
        <CardHeader>
          <CardTitle>Asignación de Platos</CardTitle>
          <CardDescription>Selecciona los platos para cada día de la semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlatoSelector onAgregarPlato={agregarPlato} platos={platos} />

          {/* Lista de platos asignados */}
          <div className="space-y-2">
            <Label>Platos Asignados ({formData.platos.length})</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {formData.platos.map((menuPlato, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getDiaNombre(menuPlato.dia_semana)}</Badge>
                    <span className="text-sm">{getPlatoNombre(menuPlato.plato_id)}</span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerPlato(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.platos.length === 0 && <p className="text-sm text-muted-foreground">No hay platos asignados</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
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

// Componente para seleccionar y agregar platos
function PlatoSelector({
  onAgregarPlato,
  platos,
}: {
  onAgregarPlato: (platoId: string, diaSemana: number) => void
  platos: Plato[]
}) {
  const [selectedPlato, setSelectedPlato] = useState("")
  const [selectedDia, setSelectedDia] = useState("")

  const handleAgregar = () => {
    if (!selectedPlato || !selectedDia) {
      toast.error("Selecciona un plato y un día")
      return
    }

    onAgregarPlato(selectedPlato, Number.parseInt(selectedDia))
    setSelectedPlato("")
    setSelectedDia("")
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label>Plato</Label>
        <Select value={selectedPlato} onValueChange={setSelectedPlato}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar plato" />
          </SelectTrigger>
          <SelectContent>
            {platos.map((plato) => (
              <SelectItem key={plato.id} value={plato.id}>
                {plato.nombre} ({plato.categoria})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label>Día</Label>
        <Select value={selectedDia} onValueChange={setSelectedDia}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar día" />
          </SelectTrigger>
          <SelectContent>
            {DIAS_SEMANA.map((dia) => (
              <SelectItem key={dia.value} value={dia.value.toString()}>
                {dia.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="button" onClick={handleAgregar}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
