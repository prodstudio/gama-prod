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
import { Search, Plus, X, Calendar, Save, Send, ChefHat, Eye } from 'lucide-react'
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
  lunes: {
    principales: Plato[]
    entradas: Plato[]
    postres: Plato[]
  }
  martes: {
    principales: Plato[]
    entradas: Plato[]
    postres: Plato[]
  }
  miercoles: {
    principales: Plato[]
    entradas: Plato[]
    postres: Plato[]
  }
  jueves: {
    principales: Plato[]
    entradas: Plato[]
    postres: Plato[]
  }
  viernes: {
    principales: Plato[]
    entradas: Plato[]
    postres: Plato[]
  }
}

const DIAS_SEMANA = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
]

const CATEGORIAS = [
  { key: "principales", label: "Principales", max: 5, color: "bg-blue-100 text-blue-800" },
  { key: "entradas", label: "Entradas", max: 2, color: "bg-green-100 text-green-800" },
  { key: "postres", label: "Postres", max: 4, color: "bg-purple-100 text-purple-800" },
]

const TIPO_TO_CATEGORIA = {
  plato_principal: "principales",
  entrada: "entradas", 
  postre: "postres",
  ensalada: "entradas",
  sopa: "entradas",
}

export function MenuSemanalDragDropForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [platosDisponibles, setPlatosDisponibles] = useState<Plato[]>([])
  const [platosFiltrados, setPlatosFiltrados] = useState<Plato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [menuPlatos, setMenuPlatos] = useState<MenuPlatos>({
    lunes: { principales: [], entradas: [], postres: [] },
    martes: { principales: [], entradas: [], postres: [] },
    miercoles: { principales: [], entradas: [], postres: [] },
    jueves: { principales: [], entradas: [], postres: [] },
    viernes: { principales: [], entradas: [], postres: [] },
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
          .eq("activo", true)
          .order("tipo")
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

  // Filtrar platos por búsqueda y categoría
  useEffect(() => {
    let filtered = platosDisponibles

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (plato) =>
          plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plato.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por categoría
    if (filtroCategoria !== "todos") {
      const tiposPermitidos = Object.keys(TIPO_TO_CATEGORIA).filter(
        (tipo) => TIPO_TO_CATEGORIA[tipo as keyof typeof TIPO_TO_CATEGORIA] === filtroCategoria,
      )
      filtered = filtered.filter((plato) => tiposPermitidos.includes(plato.tipo))
    }

    setPlatosFiltrados(filtered)
  }, [searchTerm, filtroCategoria, platosDisponibles])

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

  const agregarPlato = (plato: Plato, dia: string, categoria: string) => {
    const categoriaConfig = CATEGORIAS.find((c) => c.key === categoria)
    const diaKey = dia as keyof MenuPlatos
    const categoriaKey = categoria as keyof MenuPlatos["lunes"]

    // Verificar límite
    if (menuPlatos[diaKey][categoriaKey].length >= (categoriaConfig?.max || 0)) {
      toast.error(`Máximo ${categoriaConfig?.max} ${categoriaConfig?.label.toLowerCase()} por día`)
      return
    }

    // Verificar duplicado
    if (menuPlatos[diaKey][categoriaKey].some((p) => p.id === plato.id)) {
      toast.error("Este plato ya está agregado a esta categoría")
      return
    }

    setMenuPlatos((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [categoria]: [...prev[dia][categoriaKey], plato],
      },
    }))
    toast.success("Plato agregado exitosamente")
  }

  const quitarPlato = (platoId: string, dia: string, categoria: string) => {
    const diaKey = dia as keyof MenuPlatos
    const categoriaKey = categoria as keyof MenuPlatos["lunes"]

    setMenuPlatos((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [categoria]: prev[dia][categoriaKey].filter((p) => p.id !== platoId),
      },
    }))
    toast.success("Plato eliminado")
  }

  const handleSubmit = async (estado: "borrador" | "publicado") => {
    if (!nombre || !fechaInicio || !fechaFin) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    // Verificar que hay al menos un plato
    const totalPlatos = Object.values(menuPlatos).reduce((acc, dia) => {
      return acc + Object.values(dia).reduce((dayAcc, categoria) => dayAcc + categoria.length, 0)
    }, 0)

    if (totalPlatos === 0) {
      toast.error("Debes agregar al menos un plato al menú")
      return
    }

    setLoading(true)

    try {
      // Convertir estructura para el backend
      const platosParaBackend: { [key: string]: Array<{ id: string; nombre: string; tipo: string }> } = {}

      Object.entries(menuPlatos).forEach(([dia, categorias]) => {
        platosParaBackend[dia] = []
        Object.entries(categorias).forEach(([categoria, platos]) => {
          platosParaBackend[dia].push(...platos)
        })
      })

      const result = await createMenuSemanal({
        nombre,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado,
        platos: platosParaBackend,
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

  const getCategoriaFromTipo = (tipo: string): string => {
    return TIPO_TO_CATEGORIA[tipo as keyof typeof TIPO_TO_CATEGORIA] || "principales"
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
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Armado de Menú Semanal</h2>
            <p className="text-muted-foreground">
              Menú completo: 5 principales, 2 entradas, 4 postres por día
            </p>
          </div>
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
            </CardContent>
          </Card>

          {/* Días de la semana */}
          <div className="space-y-4">
            {DIAS_SEMANA.map((dia) => (
              <Card key={dia.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    {dia.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIAS.map((categoria) => (
                      <div key={categoria.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{categoria.label}</h4>
                          <Badge variant="outline" className="text-xs">
                            {menuPlatos[dia.key as keyof MenuPlatos][categoria.key as keyof MenuPlatos["lunes"]].length}/
                            {categoria.max}
                          </Badge>
                        </div>
                        <div className="min-h-[120px] space-y-2 p-3 bg-gray-50 rounded-lg">
                          {menuPlatos[dia.key as keyof MenuPlatos][categoria.key as keyof MenuPlatos["lunes"]].length === 0 ? (
                            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/25 rounded-lg">
                              Sin {categoria.label.toLowerCase()}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {menuPlatos[dia.key as keyof MenuPlatos][categoria.key as keyof MenuPlatos["lunes"]].map((plato) => (
                                <div key={plato.id} className="p-2 bg-white rounded border shadow-sm">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs truncate">{plato.nombre}</p>
                                      <Badge variant="secondary" className={`text-xs mt-1 ${categoria.color}`}>
                                        {plato.tipo.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => quitarPlato(plato.id, dia.key, categoria.key)}
                                      className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platos disponibles */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Platos Disponibles
              </CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar plato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las categorías</SelectItem>
                    {CATEGORIAS.map((categoria) => (
                      <SelectItem key={categoria.key} value={categoria.key}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-2 space-y-1">
                  {platosFiltrados.map((plato) => {
                    const categoria = getCategoriaFromTipo(plato.tipo)
                    const categoriaConfig = CATEGORIAS.find((c) => c.key === categoria)
                    
                    return (
                      <div key={plato.id} className="group hover:bg-gray-50 p-2 rounded border-b border-gray-100">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{plato.nombre}</p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${categoriaConfig?.color || "bg-gray-100 text-gray-800"}`}
                            >
                              {plato.tipo.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        {/* Botones minimalistas para agregar a cada día */}
                        <div className="flex flex-wrap gap-1">
                          {DIAS_SEMANA.map((dia) => {
                            const diaKey = dia.key as keyof MenuPlatos
                            const categoriaKey = categoria as keyof MenuPlatos["lunes"]
                            const yaAgregado = menuPlatos[diaKey][categoriaKey].some((p) => p.id === plato.id)
                            const limiteAlcanzado = menuPlatos[diaKey][categoriaKey].length >= (categoriaConfig?.max || 0)

                            return (
                              <button
                                key={dia.key}
                                onClick={() => agregarPlato(plato, dia.key, categoria)}
                                disabled={yaAgregado || limiteAlcanzado}
                                className={`
                                  px-2 py-1 text-xs rounded transition-colors
                                  ${yaAgregado 
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                    : limiteAlcanzado
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }
                                `}
                              >
                                {yaAgregado ? '✓' : '+'} {dia.label.slice(0, 3)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {platosFiltrados.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {searchTerm || filtroCategoria !== "todos" ? "No se encontraron platos" : "No hay platos disponibles"}
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
