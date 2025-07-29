import { supabaseAdmin } from "@/lib/supabase/admin"
import { EmpresaForm } from "@/components/forms/empresa-form"
import { notFound } from "next/navigation"

interface EditEmpresaPageProps {
  params: {
    id: string
  }
}

export default async function EditEmpresaPage({ params }: EditEmpresaPageProps) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const [{ data: empresa }, { data: planes }] = await Promise.all([
    supabaseAdmin.from("empresas").select("*").eq("id", params.id).single(),
    supabaseAdmin.from("planes").select("*").eq("activo", true).order("nombre", { ascending: true }),
  ])

  if (!empresa) {
    notFound()
  }

  return <EmpresaForm empresa={empresa} planes={planes || []} mode="edit" />
}
