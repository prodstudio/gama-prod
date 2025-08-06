'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar, TrendingUp, Users, ChefHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PedidoDia {
  fecha: string
  platos: {
    nombre: string
    cantidad: number
  }[]
  total: number
}

interface EstadisticasGenerales {
  totalPedidosHoy: number
  totalViandas: number
  platosActivos: number
  empresasActivas: number
}

export default function DashboardPage() {
  const [pedidosSemana, setPedidosSemana] = useState<PedidoDia[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalPedidosHoy: 0,
    totalViandas: 0,
    platosActivos: 0,
    empresasActivas: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatosDashboard()
  }, [])

  const cargarDatosDashboard = async () => {
    try {
      const supabase = createClient()
      
      // Obtener fechas de la semana actual
      const hoy = new Date()
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // Lunes
      
      const fechasSemana = []
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicioSemana)
        fecha.setDate(inicioSemana.getDate() + i)
        fechasSemana.push(fecha.toISOString().split('T')[0])
      }

      // Simular datos de pedidos por día (aquí conectarías con tu base de datos real)
      const pedidosSimulados: PedidoDia[] = [
        {
          fecha: fechasSemana[0], // Lunes
          platos: [
            { nombre: 'Milanesa de ternera con puré', cantidad: 85 },
            { nombre: 'Ensalada César con pollo', cantidad: 42 },
            { nombre: 'Pasta integral con vegetales', cantidad: 35 }
          ],
          total: 162
        },
        {
          fecha: fechasSemana[1], // Martes
          platos: [
            { nombre: 'Pollo al curry con arroz', cantidad: 78 },
            { nombre: 'Tarta de espinaca y ricota', cantidad: 55 },
            { nombre: 'Wrap de falafel', cantidad: 29 }
          ],
          total: 162
        },
        {
          fecha: fechasSemana[2], // Miércoles
          platos: [],
          total: 0
        },
        {
          fecha: fechasSemana[3], // Jueves
          platos: [
            { nombre: 'Salmón grillado con quinoa', cantidad: 65 },
            { nombre: 'Risotto de hongos', cantidad: 48 }
          ],
          total: 113
        },
        {
          fecha: fechasSemana[4], // Viernes
          platos: [
            { nombre: 'Hamburguesa de lentejas', cantidad: 72 },
            { nombre: 'Wok de vegetales', cantidad: 38 },
            { nombre: 'Pizza margherita', cantidad: 45 }
          ],
          total: 155
        }
      ]

      setPedidosSemana(pedidosSimulados)

      // Cargar estadísticas generales
      const [platosResult, empresasResult] = await Promise.all([
        supabase.from('platos').select('id').eq('activo', true),
        supabase.from('empresas').select('id').eq('activo', true)
      ])

      setEstadisticas({
        totalPedidosHoy: 45,
        totalViandas: 892,
        platosActivos: platosResult.data?.length || 0,
        empresasActivas: empresasResult.data?.length || 0
      })

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return {
      dia: dias[date.getDay()],
      numero: date.getDate(),
      mes: meses[date.getMonth()]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de la producción y estadísticas generales
          </p>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalPedidosHoy}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viandas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalViandas}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platos Activos</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.platosActivos}</div>
            <p className="text-xs text-muted-foreground">
              En el menú
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.empresasActivas}</div>
            <p className="text-xs text-muted-foreground">
              Clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan de Producción Semanal */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Plan de Producción Semanal</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pedidosSemana.map((dia, index) => {
            const fechaFormateada = formatearFecha(dia.fecha)
            const tienePedidos = dia.platos.length > 0

            return (
              <Card key={dia.fecha} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {fechaFormateada.dia},
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {fechaFormateada.numero} de {fechaFormateada.mes}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {tienePedidos ? (
                    <>
                      {/* Header de tabla */}
                      <div className="flex justify-between text-sm font-medium text-muted-foreground border-b pb-2">
                        <span>Plato</span>
                        <span>Cantidad</span>
                      </div>

                      {/* Lista de platos */}
                      <div className="space-y-3">
                        {dia.platos.map((plato, platoIndex) => (
                          <div key={platoIndex} className="flex justify-between items-start">
                            <span className="text-sm flex-1 pr-2">{plato.nombre}</span>
                            <Badge variant="secondary" className="ml-2">
                              {plato.cantidad}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-medium">
                          <span className="text-sm text-muted-foreground">Total del día:</span>
                          <span className="font-bold">{dia.total} viandas</span>
                        </div>
                      </div>

                      {/* Botón Ver Lista */}
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Lista
                      </Button>
                    </>
                  ) : (
                    /* Estado vacío - sin botones */
                    <div className="text-center py-8">
                      <p className="text-lg font-medium">Aún no hay pedidos confirmados.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Esperando cierre de pedidos...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Resumen de la semana */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {pedidosSemana.reduce((acc, dia) => acc + dia.total, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total viandas semana</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pedidosSemana.filter(dia => dia.platos.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Días con producción</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(pedidosSemana.reduce((acc, dia) => acc + dia.total, 0) / pedidosSemana.filter(dia => dia.platos.length > 0).length) || 0}
              </div>
              <p className="text-sm text-muted-foreground">Promedio por día</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
