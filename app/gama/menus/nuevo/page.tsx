import { Suspense } from "react"
import { MenuSemanalForm } from "@/components/forms/menu-semanal-form"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface Plato {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
}

async function getPlatosDisponibles(): Promise<Plato[]> {
  try {
    const { data: platos, error } = await supabaseAdmin
      .from("platos")
      .select("id, nombre, tipo, descripcion")
      .eq("activo", true)
      .order("nombre")

    if (error) {
      console.error("Error fetching platos:", error)
      return []
    }

    return platos || []
  } catch (error) {
    console.error("Error in getPlatosDisponibles:", error)
    return []
  }
}

async function NuevoMenuContent() {
  const platosDisponibles = await getPlatosDisponibles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Menú Semanal</h1>
        <p className="text-muted-foreground">Crea un nuevo menú semanal para las empresas</p>
      </div>

      <MenuSemanalForm platosDisponibles={platosDisponibles} />
    </div>
  )
}

export default function NuevoMenuPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <NuevoMenuContent />
    </Suspense>
  )
}
