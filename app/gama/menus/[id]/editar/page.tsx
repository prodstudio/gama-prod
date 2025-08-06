import { notFound } from "next/navigation"
import { getMenuSemanal } from "@/lib/actions/menus-actions"
import { getPlatos } from "@/lib/actions/platos-actions"
import { MenuSemanalForm } from "@/components/forms/menu-semanal-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditarMenuPage({ params }: PageProps) {
  const [menu, platos] = await Promise.all([
    getMenuSemanal(params.id),
    getPlatos()
  ])

  if (!menu) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Menú Semanal</h1>
        <p className="text-muted-foreground">
          Modifica el menú "{menu.nombre}"
        </p>
      </div>

      <MenuSemanalForm 
        menu={menu} 
        platosDisponibles={platos || []} 
        isEditing={true}
      />
    </div>
  )
}
