import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"

export default function IngredienteNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🥕</div>
          <CardTitle>Ingrediente no encontrado</CardTitle>
          <CardDescription>El ingrediente que buscas no existe o el ID proporcionado no es válido.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Verifica que la URL sea correcta o que el ingrediente no haya sido eliminado.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/gama/ingredientes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Ingredientes
              </Link>
            </Button>
            <Button asChild>
              <Link href="/gama/ingredientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Ingrediente
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
