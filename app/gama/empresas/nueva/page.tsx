import { supabaseAdmin } from "@/lib/supabase/admin"
import { EmpresaForm } from "@/components/forms/empresa-form"

export default async function NuevaEmpresaPage() {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Obtener planes activos para el selector
  const { data: planes, error } = await supabaseAdmin
    .from("planes")
    .select("*")
    .eq("activo", true)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("Error fetching planes:", error)
  }

  return <EmpresaForm planes={planes || []} mode="create" />
}
