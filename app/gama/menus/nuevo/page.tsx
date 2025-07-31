import { Suspense } from "react"
import { MenuSemanalForm } from "@/components/forms/menu-semanal-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

async function getPlatosDisponibles(): Promise<Plato[]> {
  try {
    const { data, error } = await supabaseAdmin.from("platos").select("id, nombre, tipo, descripcion").order("nombre")

    if (error) {
      console.error("Error fetching platos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching platos:", error)
    return []
  }
}

function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FormWithData() {
  const platosDisponibles = await getPlatosDisponibles()

  if (platosDisponibles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No hay platos disponibles</h3>
            <p className="text-muted-foreground text-center mb-4">
              Necesitas crear algunos platos antes de poder crear un menú semanal.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <MenuSemanalForm platosDisponibles={platosDisponibles} />
}

export default function NuevoMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Menú Semanal</h1>
        <p className="text-muted-foreground">Crea un nuevo menú semanal asignando platos a cada día</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <FormWithData />
      </Suspense>
    </div>
  )
}
