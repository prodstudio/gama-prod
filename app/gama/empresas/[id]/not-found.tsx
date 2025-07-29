import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building } from "lucide-react"

export default function EmpresaNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🏢</div>
          <CardTitle>Empresa no encontrada</CardTitle>
          <CardDescription>La empresa que buscas no existe o el ID proporcionado no es válido.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Verifica que la URL sea correcta o que la empresa no haya sido eliminada.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/gama/empresas">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Empresas
              </Link>
            </Button>
            <Button asChild>
              <Link href="/gama/empresas/nueva">
                <Building className="mr-2 h-4 w-4" />
                Nueva Empresa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
