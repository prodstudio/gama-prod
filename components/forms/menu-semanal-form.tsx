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
import { X, Save, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { crearMenuSemanal } from "@/lib/actions/menus-actions"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

interface PlatoAsignado {
  plato_id: string
  nombre: string
  tipo: string
}

interface PlatosPorDia {
  [key: number]: PlatoAsignado[]
}

const DIAS_SEMANA = [
  { numero: 1, nombre: "Lunes" },
  { numero: 2, nombre: "Martes" },
  { numero: 3, nombre: "Miércoles" },
  { numero: 4, nombre: "Jueves" },
  { numero: 5, nombre: "Viernes" },
  { numero: 6, nombre: "Sábado" },
  { numero: 7, nombre: "Domingo" },
]

export function MenuSemanalForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [platos, setPlatos] = useState<Plato[]>([])
  const [platosPorDia, setPlatosPorDia] = useState<PlatosPorDia>({})
  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
    publicado: false,
  })

  // Cargar platos disponibles
  useEffect(() => {
    async function cargarPlatos() {
      try {
        const { data, error } = await supabaseAdmin
          .from("platos")
          .select("id, nombre, tipo, descripcion")
          .order("nombre")

        if (error) {
          console.error("Error cargando platos:", error)
          return
        }

        setPlatos(data || [])
      } catch (error) {
        console.error("Error cargando platos:", error)
      }
    }

    cargarPlatos()
  }, [])

  const agregarPlatoAlDia = (dia: number, platoId: string) => {
    const plato = platos.find((p) => p.id === platoId)
    if (!plato) return

    setPlatosPorDia((prev) => ({
      ...prev,
      [dia]: [
        ...(prev[dia] || []),
        {
          plato_id: plato.id,
          nombre: plato.nombre,
          tipo: plato.tipo,
        },
      ],
    }))
  }

  const removerPlatoDelDia = (dia: number, index: number) => {
    setPlatosPorDia((prev) => ({
      ...prev,
      [dia]: prev[dia]?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar fechas
      if (!formData.fecha_inicio || !formData.fecha_fin) {
        alert("Por favor completa las fechas")
        return
      }

      // Convertir platosPorDia al formato esperado
      const platosArray = []
      for (const [dia, platosDelDia] of Object.entries(platosPorDia)) {
        for (const plato of platosDelDia) {
          platosArray.push({
            plato_id: plato.plato_id,
            dia_semana: Number.parseInt(dia),
          })
        }
      }

      const menuData = {
        ...formData,
        platos: platosArray,
      }

      const result = await crearMenuSemanal(menuData)

      if (result.success) {
        router.push("/gama/menus")
      } else {
        alert(result.error || "Error al crear el menú")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error inesperado al crear el menú")
    } finally {
      setLoading(false)
    }
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
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha de Fin</Label>
          <Input
            id="fecha_fin"
            type="date"
            value={formData.fecha_fin}
            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
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
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
          <Label htmlFor="activo">Menú Activo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="publicado"
            checked={formData.publicado}
            onCheckedChange={(checked) => setFormData({ ...formData, publicado: checked })}
          />
          <Label htmlFor="publicado">Publicar Menú</Label>
        </div>
      </div>

      {/* Asignación de platos por día */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Asignar Platos por Día</h3>
        <div className="grid gap-4">
          {DIAS_SEMANA.map((dia) => (
            <Card key={dia.numero}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {dia.nombre}
                </CardTitle>
                <CardDescription>{platosPorDia[dia.numero]?.length || 0} platos asignados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Platos asignados */}
                {platosPorDia[dia.numero]?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {platosPorDia[dia.numero].map((plato, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {plato.nombre}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removerPlatoDelDia(dia.numero, index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Selector para agregar platos */}
                <div className="flex gap-2">
                  <Select onValueChange={(value) => agregarPlatoAlDia(dia.numero, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar plato..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platos.map((plato) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            "Creando..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Crear Menú Semanal
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
