import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Building2, ChefHat, Utensils, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"

async function getDashboardStats() {
  try {
    // Obtener estadísticas básicas
    const [empresasResult, ingredientesResult, platosResult, planesResult] = await Promise.all([
      supabaseAdmin.from("empresas").select("id, nombre, activo").limit(1000),
      supabaseAdmin.from("ingredientes").select("id, nombre, activo").limit(1000),
      supabaseAdmin.from("platos").select("id, nombre, activo").limit(1000),
      supabaseAdmin.from("planes").select("id, nombre, activo").limit(1000),
    ])

    const empresas = empresasResult.data || []
    const ingredientes = ingredientesResult.data || []
    const platos = platosResult.data || []
    const planes = planesResult.data || []

    return {
      empresas: {
        total: empresas.length,
        activas: empresas.filter(e => e.activo).length,
        inactivas: empresas.filter(e => !e.activo).length,
      },
      ingredientes: {
        total: ingredientes.length,
        activos: ingredientes.filter(i => i.activo).length,
        inactivos: ingredientes.filter(i => !i.activo).length,
      },
      platos: {
        total: platos.length,
        activos: platos.filter(p => p.activo).length,
        inactivos: platos.filter(p => !p.activo).length,
      },
      planes: {
        total: planes.length,
        activos: planes.filter(p => p.activo).length,
        inactivos: planes.filter(p => !p.activo).length,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      empresas: { total: 0, activas: 0, inactivas: 0 },
      ingredientes: { total: 0, activos: 0, inactivos: 0 },
      platos: { total: 0, activos: 0, inactivos: 0 },
      planes: { total: 0, activos: 0, inactivos: 0 },
    }
  }
}

async function getRecentActivity() {
  try {
    // Obtener actividad reciente de diferentes tablas
    const [recentEmpresas, recentIngredientes, recentPlatos] = await Promise.all([
      supabaseAdmin
        .from("empresas")
        .select("id, nombre, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("ingredientes")
        .select("id, nombre, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("platos")
        .select("id, nombre, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    return {
      empresas: recentEmpresas.data || [],
      ingredientes: recentIngredientes.data || [],
      platos: recentPlatos.data || [],
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return {
      empresas: [],
      ingredientes: [],
      platos: [],
    }
  }
}

function StatsCard({ 
  title, 
  total, 
  active, 
  inactive, 
  icon: Icon, 
  href 
}: {
  title: string
  total: number
  active: number
  inactive: number
  icon: any
  href: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default" className="text-xs">
            {active} activos
          </Badge>
          {inactive > 0 && (
            <Badge variant="secondary" className="text-xs">
              {inactive} inactivos
            </Badge>
          )}
        </div>
        <Link href={href}>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            Ver todos
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function RecentActivityCard({ 
  title, 
  items, 
  href, 
  icon: Icon 
}: {
  title: string
  items: Array<{ id: string; nombre: string; created_at: string }>
  href: string
  icon: any
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Elementos creados recientemente</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay elementos recientes</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{item.nombre}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link href={href}>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            Ver todos
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  const actions = [
    {
      title: "Nueva Empresa",
      description: "Registrar una nueva empresa cliente",
      href: "/gama/empresas/nueva",
      icon: Building2,
    },
    {
      title: "Nuevo Ingrediente",
      description: "Agregar ingrediente al catálogo",
      href: "/gama/ingredientes/nuevo",
      icon: ChefHat,
    },
    {
      title: "Nuevo Plato",
      description: "Crear un nuevo plato",
      href: "/gama/platos/nuevo",
      icon: Utensils,
    },
    {
      title: "Nuevo Plan",
      description: "Diseñar un nuevo plan alimentario",
      href: "/gama/planes/nuevo",
      icon: Calendar,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
        <CardDescription>Crear nuevos elementos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <action.icon className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-full mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-8 w-full mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function DashboardContent() {
  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ])

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Empresas"
          total={stats.empresas.total}
          active={stats.empresas.activas}
          inactive={stats.empresas.inactivas}
          icon={Building2}
          href="/gama/empresas"
        />
        <StatsCard
          title="Ingredientes"
          total={stats.ingredientes.total}
          active={stats.ingredientes.activos}
          inactive={stats.ingredientes.inactivos}
          icon={ChefHat}
          href="/gama/ingredientes"
        />
        <StatsCard
          title="Platos"
          total={stats.platos.total}
          active={stats.platos.activos}
          inactive={stats.platos.inactivos}
          icon={Utensils}
          href="/gama/platos"
        />
        <StatsCard
          title="Planes"
          total={stats.planes.total}
          active={stats.planes.activos}
          inactive={stats.planes.inactivos}
          icon={Calendar}
          href="/gama/planes"
        />
      </div>

      {/* Actividad reciente y acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivityCard
          title="Empresas Recientes"
          items={recentActivity.empresas}
          href="/gama/empresas"
          icon={Building2}
        />
        <RecentActivityCard
          title="Ingredientes Recientes"
          items={recentActivity.ingredientes}
          href="/gama/ingredientes"
          icon={ChefHat}
        />
        <QuickActionsCard />
      </div>

      {/* Alertas y notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Sistema operativo - Todos los servicios funcionando correctamente</span>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Puedes usar las acciones rápidas para crear nuevos elementos rápidamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function GamaDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Gama</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de gestión alimentaria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Sistema Activo
          </Badge>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
