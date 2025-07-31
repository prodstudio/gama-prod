"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, X, Save, Plus } from "lucide-react"
import { toast } from "sonner"
import { createMenuSemanalAction } from "@/lib/actions/menus-actions"
import { menuSemanalSchema, type MenuSemanalFormData } from "@/lib/validations/menus"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

interface MenuSemanalFormProps {
  platosDisponibles: Plato[]
  initialData?: Partial<MenuSemanalFormData>
}

interface PlatoAsignado {
  plato_id: string
  dia_semana: number
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

export function MenuSemanalForm({ platosDisponibles = [], initialData }: MenuSemanalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [platosAsignados, setPlatosAsignados] = useState<PlatoAsignado[]>(initialData?.platos || [])
  const [selectedPlato, setSelectedPlato] = useState("")
  const [selectedDia, setSelectedDia] = useState("")

  const form = useForm<MenuSemanalFormData>({
    resolver: zodResolver(menuSemanalSchema),
    defaultValues: {
      fecha_inicio: initialData?.fecha_inicio || "",
      fecha_fin: initialData?.fecha_fin || "",
      activo: initialData?.activo ?? true,
      publicado: initialData?.publicado ?? false,
      platos: initialData?.platos || [],
    },
  })

  const agregarPlato = () => {
    if (!selectedPlato || !selectedDia) {
      toast.error("Selecciona un plato y un día")
      return
    }

    const platoId = selectedPlato
    const diaSemana = Number.parseInt(selectedDia)

    // Verificar si ya existe este plato en este día
    const existe = platosAsignados.some((p) => p.plato_id === platoId && p.dia_semana === diaSemana)

    if (existe) {
      toast.error("Este plato ya está asignado a este día")
      return
    }

    const nuevosPlatos = [...platosAsignados, { plato_id: platoId, dia_semana: diaSemana }]
    setPlatosAsignados(nuevosPlatos)
    form.setValue("platos", nuevosPlatos)

    // Limpiar selecciones
    setSelectedPlato("")
    setSelectedDia("")
  }

  const removerPlato = (index: number) => {
    const nuevosPlatos = platosAsignados.filter((_, i) => i !== index)
    setPlatosAsignados(nuevosPlatos)
    form.setValue("platos", nuevosPlatos)
  }

  const getPlatoNombre = (platoId: string) => {
    const plato = platosDisponibles.find((p) => p.id === platoId)
    return plato?.nombre || "Plato desconocido"
  }

  const getDiaNombre = (dia: number) => {
    const diaObj = DIAS_SEMANA.find((d) => d.value === dia)
    return diaObj?.label || "Día desconocido"
  }

  async function onSubmit(data: MenuSemanalFormData) {
    try {
      setIsSubmitting(true)

      if (platosAsignados.length === 0) {
        toast.error("Debes agregar al menos un plato al menú")
        return
      }

      const result = await createMenuSemanalAction({
        ...data,
        platos: platosAsignados,
      })

      if (result.success) {
        toast.success("Menú semanal creado exitosamente")
        router.push("/gama/menus")
        router.refresh()
      } else {
        toast.error(result.error || "Error al crear el menú semanal")
      }
    } catch (error) {
      console.error("Error creating menu:", error)
      toast.error("Error inesperado al crear el menú semanal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Menú
              </CardTitle>
              <CardDescription>Configura las fechas y estado del menú semanal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Menú Activo</FormLabel>
                        <FormDescription>El menú está disponible para las empresas</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publicado</FormLabel>
                        <FormDescription>El menú es visible para los empleados</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Agregar platos */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Platos</CardTitle>
              <CardDescription>Selecciona platos para cada día de la semana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormLabel>Plato</FormLabel>
                  <Select value={selectedPlato} onValueChange={setSelectedPlato}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plato" />
                    </SelectTrigger>
                    <SelectContent>
                      {platosDisponibles.map((plato) => (
                        <SelectItem key={plato.id} value={plato.id}>
                          {plato.nombre} ({plato.tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel>Día de la Semana</FormLabel>
                  <Select value={selectedDia} onValueChange={setSelectedDia}>
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
                  <Button type="button" onClick={agregarPlato} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platos asignados */}
          {platosAsignados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platos del Menú ({platosAsignados.length})</CardTitle>
                <CardDescription>Platos programados para esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platosAsignados.map((plato, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{getDiaNombre(plato.dia_semana)}</Badge>
                        <span className="font-medium">{getPlatoNombre(plato.plato_id)}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerPlato(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Menú
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
