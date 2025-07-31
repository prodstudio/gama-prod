"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, X, Save } from "lucide-react"
import { toast } from "sonner"
import { crearMenuSemanal } from "@/lib/actions/menus-actions"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

interface PlatoAsignado {
  plato_id: string
  dia_semana: number
  plato?: Plato
}

interface MenuSemanalFormProps {
  platosDisponibles: Plato[]
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

export function MenuSemanalForm({ platosDisponibles }: MenuSemanalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Estado del formulario
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [activo, setActivo] = useState(true)
  const [publicado, setPublicado] = useState(false)
  const [platosAsignados, setPlatosAsignados] = useState<PlatoAsignado[]>([])

  // Estado para agregar platos
  const [platoSeleccionado, setPlatoSeleccionado] = useState("")
  const [diaSeleccionado, setDiaSeleccionado] = useState("")

  const agregarPlato = () => {
    if (!platoSeleccionado || !diaSeleccionado) {
      toast.error("Selecciona un plato y un día")
      return
    }

    const dia = Number.parseInt(diaSeleccionado)
    const plato = platosDisponibles.find((p) => p.id === platoSeleccionado)

    // Verificar si ya existe el plato en ese día
    const yaExiste = platosAsignados.some((pa) => pa.plato_id === platoSeleccionado && pa.dia_semana === dia)

    if (yaExiste) {
      toast.error("Este plato ya está asignado a este día")
      return
    }

    const nuevoPlatoAsignado: PlatoAsignado = {
      plato_id: platoSeleccionado,
      dia_semana: dia,
      plato: plato,
    }

    setPlatosAsignados([...platosAsignados, nuevoPlatoAsignado])
    setPlatoSeleccionado("")
    setDiaSeleccionado("")
    toast.success("Plato agregado al menú")
  }

  const eliminarPlato = (platoId: string, dia: number) => {
    setPlatosAsignados(platosAsignados.filter((pa) => !(pa.plato_id === platoId && pa.dia_semana === dia)))
    toast.success("Plato eliminado del menú")
  }

  const getDiaNombre = (dia: number) => {
    return DIAS_SEMANA.find((d) => d.value === dia)?.label || "Día desconocido"
  }

  const getPlatosPorDia = (dia: number) => {
    return platosAsignados.filter((pa) => pa.dia_semana === dia)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fechaInicio || !fechaFin) {
      toast.error("Las fechas son obligatorias")
      return
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio")
      return
    }

    if (platosAsignados.length === 0) {
      toast.error("Debes asignar al menos un plato al menú")
      return
    }

    setIsLoading(true)

    try {
      const menuData = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activo,
        publicado,
        platos: platosAsignados.map((pa) => ({
          plato_id: pa.plato_id,
          dia_semana: pa.dia_semana,
        })),
      }

      const result = await crearMenuSemanal(menuData)

      if (result.success) {
        toast.success("Menú semanal creado exitosamente")
        router.push("/gama/menus")
      } else {
        toast.error(result.error || "Error al crear el menú")
      }
    } catch (error) {
      console.error("Error creating menu:", error)
      toast.error("Error inesperado al crear el menú")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Información básica del menú */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información del Menú
          </CardTitle>
          <CardDescription>Define las fechas del menú y su configuración</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Menú activo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="publicado" checked={publicado} onCheckedChange={setPublicado} />
              <Label htmlFor="publicado">Publicar menú</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asignación de platos */}
      <Card>
        <CardHeader>
          <CardTitle>Asignar Platos</CardTitle>
          <CardDescription>Selecciona los platos para cada día de la semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Plato</Label>
              <Select value={platoSeleccionado} onValueChange={setPlatoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plato" />
                </SelectTrigger>
                <SelectContent>
                  {platosDisponibles.map((plato) => (
                    <SelectItem key={plato.id} value={plato.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {plato.tipo}
                        </Badge>
                        {plato.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Día de la semana</Label>
              <Select value={diaSeleccionado} onValueChange={setDiaSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
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

            <div className="flex items-end">
              <Button
                type="button"
                onClick={agregarPlato}
                className="w-full"
                disabled={!platoSeleccionado || !diaSeleccionado}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Lista de platos asignados por día */}
          {platosAsignados.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Platos asignados ({platosAsignados.length})</h4>
              <div className="grid gap-4">
                {DIAS_SEMANA.map((dia) => {
                  const platosDelDia = getPlatosPorDia(dia.value)
                  if (platosDelDia.length === 0) return null

                  return (
                    <div key={dia.value} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">{dia.label}</h5>
                      <div className="space-y-2">
                        {platosDelDia.map((platoAsignado) => (
                          <div
                            key={`${platoAsignado.plato_id}-${platoAsignado.dia_semana}`}
                            className="flex items-center justify-between bg-muted p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {platoAsignado.plato?.tipo}
                              </Badge>
                              <span>{platoAsignado.plato?.nombre}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarPlato(platoAsignado.plato_id, platoAsignado.dia_semana)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Creando..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Crear Menú
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
