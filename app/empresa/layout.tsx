import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Verificar que el usuario tenga rol de empresa
  const { data: profile } = await supabase.from("usuarios").select("rol").eq("id", user.id).single()

  if (!profile || profile.rol !== "EMPRESA") {
    redirect("/")
  }

  return <DashboardLayout userRole="EMPRESA">{children}</DashboardLayout>
}
