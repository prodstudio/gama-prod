'use client'

import { Suspense, useState } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, Eye, Copy, Trash2, Globe, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getMenusSemanales, publishMenuAction, duplicateMenuAction, deleteMenuAction } from "@/lib/actions/menus-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Menu {
  id: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  publicado: boolean
  created_at: string
  menu_platos?: Array<{
    dia_semana: number
    platos: {
      tipo: string
    }
  }>
}

function MenusList({ menus }: { menus: Menu[] }) {
  const [publishDialog, setPublishDialog] = useState<{ open: boolean; menu: Menu | null; hasIncomplete: boolean }>({
    open: false,
    menu: null,
    hasIncomplete: false
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; menu: Menu | null }>({
    open: false,
    menu: null
  })
  const router = useRouter()

  const checkMenuCompleteness = (menu: Menu) => {
    if (!menu.menu_platos || menu.menu_platos.length === 0) return true

    // Verificar que cada día (1-5) tenga al menos un plato principal
    const diasConPrincipal = new Set()
    menu.menu_platos.forEach(plato => {
      if (plato.platos.tipo === 'plato_principal') {
        diasConPrincipal.add(plato.dia_semana)
      }
    })

    return diasConPrincipal.size < 5 // Si no tiene los 5 días completos
  }

  const handlePublish = async (menu: Menu) => {
    const hasIncomplete = checkMenuCompleteness(menu)
    
    if (hasIncomplete) {
      setPublishDialog({ open: true, menu, hasIncomplete: true })
    } else {
      await executePublish(menu)
    }
  }

  const executePublish = async (menu: Menu) => {
    try {
      const result = await publishMenuAction(menu.id)
      if (result.success) {
        toast.success("Menú publicado correctamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al publicar el menú")
      }
    } catch (error) {
      toast.error("Error al publicar el menú")
    }
    setPublishDialog({ open: false, menu: null, hasIncomplete: false })
  }

  const handleDuplicate = async (menu: Menu) => {
    try {
      const result = await duplicateMenuAction(menu.id)
      if (result.success) {
        toast.success("Menú duplicado correctamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al duplicar el menú")
      }
    } catch (error) {
      toast.error("Error al duplicar el menú")
    }
  }

  const handleDelete = async (menu: Menu) => {
    setDeleteDialog({ open: true, menu })
  }

  const executeDelete = async () => {
    if (!deleteDialog.menu) return

    try {
      const result = await deleteMenuAction(deleteDialog.menu.id)
      if (result.success) {
        toast.success("Menú eliminado correctamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar el menú")
      }
    } catch (error) {
      toast.error("Error al eliminar el menú")
    }
    setDeleteDialog({ open: false, menu: null })
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay menús semanales</h3>
        <p className="text-gray-500 mb-4">Comienza creando tu primer menú semanal</p>
        <Link href="/gama/menus/nuevo">
          <Button className="bg-gray-800 hover:bg-gray-900 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Menú
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
          <div>Nombre / Semana</div>
          <div>Estado</div>
          <div>Fecha de Creación</div>
          <div className="text-right">Acciones</div>
        </div>

        {/* Menu Items */}
        <div className="divide-y">
          {menus.map((menu) => (
            <div key={menu.id} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
              {/* Nombre / Semana */}
              <div>
                <div className="font-medium text-gray-900">{menu.nombre}</div>
                <div className="text-sm text-gray-500">
                  {new Date(menu.fecha_inicio).toLocaleDateString("es-ES", { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })} - {new Date(menu.fecha_fin).toLocaleDateString("es-ES", { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              </div>

              {/* Estado */}
              <div>
                <Badge 
                  variant={menu.publicado ? "default" : "secondary"}
                  className={menu.publicado ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  {menu.publicado ? "Publicado" : "Borrador"}
                </Badge>
              </div>

              {/* Fecha de Creación */}
              <div className="text-sm text-gray-600">
                {new Date(menu.created_at).toLocaleDateString("es-ES", {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                })}
              </div>

              {/* Acciones */}
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/gama/menus/${menu.id}/editar`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {!menu.publicado && (
                      <DropdownMenuItem onClick={() => handlePublish(menu)}>
                        <Globe className="mr-2 h-4 w-4" />
                        Publicar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDuplicate(menu)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(menu)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Publicación con Advertencia */}
      <AlertDialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog({ open, menu: null, hasIncomplete: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Menú Incompleto</AlertDialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setPublishDialog({ open: false, menu: null, hasIncomplete: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialogDescription>
              Este menú tiene días sin completar. ¿Deseas publicarlo de todas formas o prefieres editarlo primero?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Link href={`/gama/menus/${publishDialog.menu?.id}/editar`}>
                Editar
              </Link>
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => publishDialog.menu && executePublish(publishDialog.menu)}>
              Publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, menu: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Eliminar Menú</AlertDialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setDeleteDialog({ open: false, menu: null })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el menú "{deleteDialog.menu?.nombre}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MenusListSkeleton() {
  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
        <div>Nombre / Semana</div>
        <div>Estado</div>
        <div>Fecha de Creación</div>
        <div className="text-right">Acciones</div>
      </div>

      {/* Skeleton Items */}
      <div className="divide-y">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center animate-pulse">
            <div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex justify-end">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function MenusPageContent() {
  const menus = await getMenusSemanales()
  return <MenusList menus={menus || []} />
}

export default function MenusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menús Semanales</h1>
          <p className="text-muted-foreground">Gestiona los menús semanales de tu empresa</p>
        </div>
        <Link href="/gama/menus/nuevo">
          <Button className="bg-gray-800 hover:bg-gray-900 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Menú
          </Button>
        </Link>
      </div>

      <Suspense fallback={<MenusListSkeleton />}>
        <MenusPageContent />
      </Suspense>
    </div>
  )
}
