"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Loader2 } from "lucide-react"
import { deleteIngredienteAction } from "@/lib/actions/ingredientes-actions"

interface DeleteIngredienteButtonProps {
  ingredienteId: string
  ingredienteNombre: string
}

export function DeleteIngredienteButton({ ingredienteId, ingredienteNombre }: DeleteIngredienteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await deleteIngredienteAction(ingredienteId)

      if (result?.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
      }
    } catch (err) {
      setError("Error inesperado al eliminar el ingrediente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar ingrediente?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar el ingrediente <strong>"{ingredienteNombre}"</strong>. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Ingrediente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
