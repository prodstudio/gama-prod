import { supabaseAdmin } from "@/lib/supabase/admin"
import { EmpresaForm } from "@/components/forms/empresa-form"

export default async function NuevaEmpresaPage() {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  try {
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
  } catch (error) {
    console.error("Error in NuevaEmpresaPage:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la página</h2>
          <p className="text-gray-600">No se pudieron cargar los datos necesarios.</p>
        </div>
      </div>
    )
  }
}
