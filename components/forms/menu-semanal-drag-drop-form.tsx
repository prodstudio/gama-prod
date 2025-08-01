"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X, Calendar, Save, Send, ChefHat } from "lucide-react"
import { toast } from "sonner"
import { createMenuSemanal } from "@/lib/actions/menus-actions"
import { createClient } from "@/lib/supabase/client"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

interface MenuPlatos {
  lunes: Plato[]
  martes: Plato[]
  miercoles: Plato[]
  jueves: Plato[]
  viernes: Plato[]
}

const DIAS_SEMANA = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
]

const TIPO_COLORS = {
  plato_principal: "bg-blue-100 text-blue-800",
  entrada: "bg-green-100 text-green-800",
  postre: "bg-purple-100 text-purple-800",
  ensalada: "bg-yellow-100 text-yellow-800",
  sopa: "bg-orange-100 text-orange-800",
}

export function MenuSemanalDragDropForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [platosDisponibles, setPlatosDisponibles] = useState<Plato[]>([])
  const [platosFiltrados, setPlatosFiltrados] = useState<Plato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlato, setSelectedPlato] = useState("")
  const [selectedDia, setSelectedDia] = useState("")
  const [menuPlatos, setMenuPlatos] = useState<MenuPlatos>({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
  })
  const [loading, setLoading] = useState(false)
  const [loadingPlatos, setLoadingPlatos] = useState(true)

  // Cargar platos disponibles (excluyendo bebidas)
  useEffect(() => {
    async function loadPlatos() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("platos")
          .select("id, nombre, tipo, descripcion")
          .neq("tipo", "bebida") // Excluir bebidas
          .order("nombre")

        if (error) {
          console.error("Error loading platos:", error)
          toast.error("Error al cargar los platos")
          return
        }

        setPlatosDisponibles(data || [])
        setPlatosFiltrados(data || [])
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar los platos")
      } finally {
        setLoadingPlatos(false)
      }
    }

    loadPlatos()
  }, [])

  // Filtrar platos por búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setPlatosFiltrados(platosDisponibles)
    } else {
      const filtered = platosDisponibles.filter(
        (plato) =>
          plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plato.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setPlatosFiltrados(filtered)
    }
  }, [searchTerm, platosDisponibles])

  // Generar nombre automático basado en fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        return `${day}/${month}`
      }
      setNombre(`Menú Semanal (${formatDate(inicio)} - ${formatDate(fin)})`)
    }
  }, [fechaInicio, fechaFin])

  // Calcular fechas de semana automáticamente
  useEffect(() => {
    if (fechaInicio && !fechaFin) {
      const inicio = new Date(fechaInicio)
      const fin = new Date(inicio)
      fin.setDate(inicio.getDate() + 4) // Lunes a Viernes = 5 días
      setFechaFin(fin.toISOString().split("T")[0])
    }
  }, [fechaInicio, fechaFin])

  const agregarPlatoConSelector = () => {
    if (!selectedPlato || !selectedDia) {
      toast.error("Selecciona un plato y un día")
      return
    }

    const plato = platosDisponibles.find((p) => p.id === selectedPlato)
    if (!plato) return

    if (menuPlatos[selectedDia as keyof MenuPlatos].some((p) => p.id === plato.id)) {
      toast.error("Este plato ya está agregado a este día")
      return
    }

    setMenuPlatos((prev) => ({
      ...prev,
      [selectedDia]: [...prev[selectedDia as keyof MenuPlatos], plato],
    }))

    // Limpiar selección
    setSelectedPlato("")
    setSelectedDia("")
    toast.success("Plato agregado exitosamente")
  }

  const agregarPlato = (plato: Plato, dia: string) => {
    if (menuPlatos[dia as keyof MenuPlatos].some((p) => p.id === plato.id)) {
      toast.error("Este plato ya está agregado a este día")
      return
    }

    setMenuPlatos((prev) => ({
      ...prev,
      [dia]: [...prev[dia as keyof MenuPlatos], plato],
    }))
    toast.success("Plato agregado exitosamente")
  }

  const quitarPlato = (platoId: string, dia: string) => {
    setMenuPlatos((prev) => ({
      ...prev,
      [dia]: prev[dia as keyof MenuPlatos].filter((p) => p.id !== platoId),
    }))
    toast.success("Plato eliminado")
  }

  const moverPlato = (platoId: string, diaOrigen: string, diaDestino: string) => {
    const plato = menuPlatos[diaOrigen as keyof MenuPlatos].find((p) => p.id === platoId)
    if (!plato) return

    if (menuPlatos[diaDestino as keyof MenuPlatos].some((p) => p.id === plato.id)) {
      toast.error("Este plato ya está agregado al día destino")
      return
    }

    setMenuPlatos((prev) => ({
      ...prev,
      [diaOrigen]: prev[diaOrigen as keyof MenuPlatos].filter((p) => p.id !== platoId),
      [diaDestino]: [...prev[diaDestino as keyof MenuPlatos], plato],
    }))
    toast.success("Plato movido exitosamente")
  }

  const handleSubmit = async (estado: "borrador" | "publicado") => {
    if (!nombre || !fechaInicio || !fechaFin) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    // Verificar que hay al menos un plato
    const totalPlatos = Object.values(menuPlatos).reduce((acc, platos) => acc + platos.length, 0)
    if (totalPlatos === 0) {
      toast.error("Debes agregar al menos un plato al menú")
      return
    }

    setLoading(true)

    try {
      const result = await createMenuSemanal({
        nombre,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado,
        platos: menuPlatos,
      })

      if (result.success) {
        toast.success(`Menú ${estado === "publicado" ? "publicado" : "guardado como borrador"} exitosamente`)
        router.push("/gama/menus")
      } else {
        toast.error(result.error || "Error al crear el menú")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al crear el menú")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/gama/menus")
  }

  if (loadingPlatos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando platos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crear Menú Semanal</h1>
          <p className="text-muted-foreground">Selecciona los platos para cada día de la semana</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={() => handleSubmit("borrador")} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSubmit("publicado")} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Publicar Menú
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Formulario y días de la semana */}
        <div className="lg:col-span-3 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Menú
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Menú</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Menú Semana 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-fin">Fecha Fin</Label>
                  <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
              </div>

              {/* Selector rápido para agregar platos */}
              <Separator />
              <div className="space-y-2">
                <Label>Agregar Plato Rápido</Label>
                <div className="flex gap-2">
                  <Select value={selectedPlato} onValueChange={setSelectedPlato}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar plato..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platosDisponibles.map((plato) => (
                        <SelectItem key={plato.id} value={plato.id}>
                          <div className="flex items-center gap-2">
                            <span>{plato.nombre}</span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${TIPO_COLORS[plato.tipo as keyof typeof TIPO_COLORS] || "bg-gray-100 text-gray-800"}`}
                            >
                              {plato.tipo.replace("_", " ")}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDia} onValueChange={setSelectedDia}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Día..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map((dia) => (
                        <SelectItem key={dia.key} value={dia.key}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={agregarPlatoConSelector} disabled={!selectedPlato || !selectedDia}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Días de la semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIAS_SEMANA.map((dia) => (
              <Card key={dia.key} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    {dia.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] space-y-2">
                    {menuPlatos[dia.key as keyof MenuPlatos].length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        No hay platos asignados
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {menuPlatos[dia.key as keyof MenuPlatos].map((plato, index) => (
                          <div key={plato.id} className="p-3 bg-white rounded-lg border shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{plato.nombre}</p>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs mt-1 ${TIPO_COLORS[plato.tipo as keyof typeof TIPO_COLORS] || "bg-gray-100 text-gray-800"}`}
                                >
                                  {plato.tipo.replace("_", " ")}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                {/* Botón para mover a otro día */}
                                <Select onValueChange={(nuevoDia) => moverPlato(plato.id, dia.key, nuevoDia)}>
                                  <SelectTrigger className="h-6 w-6 p-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DIAS_SEMANA.filter((d) => d.key !== dia.key).map((otroDia) => (
                                      <SelectItem key={otroDia.key} value={otroDia.key}>
                                        Mover a {otroDia.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => quitarPlato(plato.id, dia.key)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platos disponibles */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Platos Disponibles</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-2">
                  {platosFiltrados.map((plato) => (
                    <div key={plato.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{plato.nombre}</p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${TIPO_COLORS[plato.tipo as keyof typeof TIPO_COLORS] || "bg-gray-100 text-gray-800"}`}
                            >
                              {plato.tipo.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        {/* Botones para agregar a cada día */}
                        <Separator />
                        <div className="flex flex-wrap gap-1">
                          {DIAS_SEMANA.map((dia) => (
                            <Button
                              key={dia.key}
                              size="sm"
                              variant="outline"
                              onClick={() => agregarPlato(plato, dia.key)}
                              className="h-6 px-2 text-xs"
                              disabled={menuPlatos[dia.key as keyof MenuPlatos].some((p) => p.id === plato.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {dia.label.slice(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {platosFiltrados.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No se encontraron platos" : "No hay platos disponibles"}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
