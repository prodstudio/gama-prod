'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, X } from 'lucide-react'
import { updateMenuSemanal } from "@/lib/actions/menus-actions"
import { toast } from "sonner"

interface Plato {
  id: string
  nombre: string
  tipo: string
  imagen_url?: string
}

interface MenuPlato {
  dia_semana: number
  orden: number
  platos: Plato
}

interface Menu {
  id: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  publicado: boolean
  menu_platos: MenuPlato[]
}

interface MenuSemanalEditFormProps {
  menu: Menu
  platosDisponibles: Plato[]
}

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' }
]

const CATEGORIAS = [
  { id: 'plato_principal', nombre: 'Principales', limite: 5, tipos: ['plato_principal'] },
  { id: 'entrada', nombre: 'Entradas', limite: 2, tipos: ['entrada', 'ensalada', 'sopa'] },
  { id: 'postre', nombre: 'Postres', limite: 4, tipos: ['postre'] }
]

const TIPO_TO_CATEGORIA: { [key: string]: string } = {
  'plato_principal': 'plato_principal',
  'entrada': 'entrada',
  'ensalada': 'entrada',
  'sopa': 'entrada',
  'postre': 'postre'
}

export function MenuSemanalEditForm({ menu, platosDisponibles }: MenuSemanalEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Estado del formulario
  const [nombre, setNombre] = useState(menu.nombre)
  const [fechaInicio, setFechaInicio] = useState(menu.fecha_inicio)
  const [fechaFin, setFechaFin] = useState(menu.fecha_fin)
  
  // Estado del menú semanal - inicializar con datos existentes
  const [menuSemanal, setMenuSemanal] = useState(() => {
    const inicial: { [key: string]: { [key: string]: Plato[] } } = {}
    
    // Inicializar estructura vacía
    DIAS_SEMANA.forEach(dia => {
      inicial[dia.id] = {}
      CATEGORIAS.forEach(categoria => {
        inicial[dia.id][categoria.id] = []
      })
    })
    
    // Llenar con datos existentes
    menu.menu_platos?.forEach(menuPlato => {
      const categoria = TIPO_TO_CATEGORIA[menuPlato.platos.tipo] || 'plato_principal'
      if (inicial[menuPlato.dia_semana] && inicial[menuPlato.dia_semana][categoria]) {
        inicial[menuPlato.dia_semana][categoria].push(menuPlato.platos)
      }
    })
    
    return inicial
  })
  
  // Estado de filtros
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos')

  // Filtrar platos disponibles
  const platosFiltrados = platosDisponibles.filter(plato => {
    const coincideBusqueda = plato.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === 'todos' || 
      CATEGORIAS.find(cat => cat.id === categoriaFiltro)?.tipos.includes(plato.tipo)
    
    return coincideBusqueda && coincideCategoria && plato.tipo !== 'bebida'
  })

  const agregarPlato = (plato: Plato, diaId: number, categoriaId: string) => {
    const categoria = CATEGORIAS.find(c => c.id === categoriaId)
    if (!categoria) return

    const platosActuales = menuSemanal[diaId][categoriaId] || []
    
    // Verificar límite
    if (platosActuales.length >= categoria.limite) {
      toast.error(`Máximo ${categoria.limite} ${categoria.nombre.toLowerCase()} por día`)
      return
    }

    // Verificar si ya está agregado
    if (platosActuales.some(p => p.id === plato.id)) {
      toast.error('Este plato ya está agregado en este día')
      return
    }

    setMenuSemanal(prev => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        [categoriaId]: [...platosActuales, plato]
      }
    }))
  }

  const removerPlato = (platoId: string, diaId: number, categoriaId: string) => {
    setMenuSemanal(prev => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        [categoriaId]: prev[diaId][categoriaId].filter(p => p.id !== platoId)
      }
    }))
  }

  const handleSubmit = async (publicar: boolean = false) => {
    if (!nombre.trim() || !fechaInicio || !fechaFin) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('nombre', nombre)
        formData.append('fecha_inicio', fechaInicio)
        formData.append('fecha_fin', fechaFin)
        formData.append('publicado', publicar.toString())

        // Agregar platos al FormData
        Object.entries(menuSemanal).forEach(([diaId, categorias]) => {
          Object.entries(categorias).forEach(([categoriaId, platos]) => {
            platos.forEach((plato, index) => {
              formData.append(`${categoriaId}_${diaId}_${index + 1}`, plato.id)
            })
          })
        })

        const result = await updateMenuSemanal(menu.id, formData)
        
        if (result?.success === false) {
          toast.error(result.error || 'Error al actualizar el menú')
        } else {
          toast.success(`Menú ${publicar ? 'publicado' : 'guardado'} correctamente`)
          router.push('/gama/menus')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al actualizar el menú')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de Información del Menú */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Información del Menú</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Menú</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Menú Semana 1"
              />
            </div>
            
            <div>
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={isPending}
                className="w-full"
                variant="outline"
              >
                {isPending ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
              
              <Button 
                onClick={() => handleSubmit(true)}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? 'Publicando...' : 'Publicar Menú'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Platos Disponibles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Platos Disponibles</CardTitle>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar platos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoriaFiltro === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFiltro('todos')}
                >
                  Todos
                </Button>
                {CATEGORIAS.map(categoria => (
                  <Button
                    key={categoria.id}
                    variant={categoriaFiltro === categoria.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoriaFiltro(categoria.id)}
                  >
                    {categoria.nombre}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {platosFiltrados.map(plato => {
                const categoria = TIPO_TO_CATEGORIA[plato.tipo]
                return (
                  <div key={plato.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{plato.nombre}</div>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORIAS.find(c => c.id === categoria)?.nombre || plato.tipo}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {DIAS_SEMANA.map(dia => {
                        const platosEnDia = menuSemanal[dia.id][categoria] || []
                        const yaAgregado = platosEnDia.some(p => p.id === plato.id)
                        const limite = CATEGORIAS.find(c => c.id === categoria)?.limite || 0
                        const limiteAlcanzado = platosEnDia.length >= limite

                        return (
                          <Button
                            key={dia.id}
                            size="sm"
                            variant={yaAgregado ? "default" : limiteAlcanzado ? "secondary" : "outline"}
                            className="h-6 w-6 p-0 text-xs"
                            onClick={() => {
                              if (yaAgregado) {
                                removerPlato(plato.id, dia.id, categoria)
                              } else if (!limiteAlcanzado) {
                                agregarPlato(plato, dia.id, categoria)
                              }
                            }}
                            disabled={limiteAlcanzado && !yaAgregado}
                            title={`${dia.nombre.substring(0, 3)} - ${yaAgregado ? 'Quitar' : limiteAlcanzado ? 'Límite alcanzado' : 'Agregar'}`}
                          >
                            {yaAgregado ? '✓' : limiteAlcanzado ? '−' : '+'}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel del Menú Semanal */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Menú Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {DIAS_SEMANA.map(dia => (
                <div key={dia.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">{dia.nombre}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIAS.map(categoria => {
                      const platos = menuSemanal[dia.id][categoria.id] || []
                      return (
                        <div key={categoria.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{categoria.nombre}</h4>
                            <Badge variant="outline" className="text-xs">
                              {platos.length}/{categoria.limite}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 min-h-[60px] border-2 border-dashed border-gray-200 rounded-lg p-2">
                            {platos.map((plato, index) => (
                              <div key={`${plato.id}-${index}`} className="flex items-center justify-between bg-white border rounded p-2">
                                <span className="text-sm font-medium">{plato.nombre}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removerPlato(plato.id, dia.id, categoria.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {platos.length === 0 && (
                              <div className="text-center text-gray-400 text-sm py-4">
                                Sin {categoria.nombre.toLowerCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
