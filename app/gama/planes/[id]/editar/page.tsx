import { supabaseAdmin } from "@/lib/supabase/admin" // Cambiar a cliente admin
import { PlanForm } from "@/components/forms/plan-form"
import { notFound } from "next/navigation"

interface EditPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const { data: plan, error } = await supabaseAdmin.from("planes").select("*").eq("id", params.id).single()

  if (error || !plan) {
    notFound()
  }

  return <PlanForm plan={plan} mode="edit" />
}
