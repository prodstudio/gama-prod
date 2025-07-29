import { createServerClient } from "@/lib/supabase/server"
import { PlanForm } from "@/components/forms/plan-form"
import { notFound } from "next/navigation"

interface EditPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const supabase = createServerClient()

  const { data: plan, error } = await supabase.from("planes").select("*").eq("id", params.id).single()

  if (error || !plan) {
    notFound()
  }

  return <PlanForm plan={plan} mode="edit" />
}
