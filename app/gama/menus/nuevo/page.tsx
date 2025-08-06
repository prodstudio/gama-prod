"use client"

import { MenuSemanalForm } from "@/components/forms/menu-semanal-form"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NuevoMenuPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/gama/menus">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Menús
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Menú Semanal</h1>
          <p className="text-muted-foreground">
            Arma el menú completo para la semana. Los clientes verán según su plan contratado.
          </p>
        </div>
      </div>

      <MenuSemanalForm />
    </div>
  )
}
