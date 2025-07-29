"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { loginAction } from "@/lib/actions/auth-actions"
import { ConfigChecker } from "@/components/debug/config-checker" // Importamos el nuevo componente

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  const errorDetails = searchParams.get("details")

  const getErrorMessage = (err: string | null, details: string | null) => {
    if (!err) return ""
    switch (err) {
      case "no_session":
        return "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
      case "profile_error":
        return `Error al buscar tu perfil: ${details || "desconocido"}. Contacta a soporte.`
      case "profile_not_found":
        return "No se encontró un perfil asociado a tu cuenta. Contacta a soporte."
      case "user_inactive":
        return "Tu usuario está inactivo. Contacta a soporte."
      case "middleware_exception":
        return `Error inesperado en el sistema: ${details || "desconocido"}.`
      default:
        return "Ocurrió un error inesperado."
    }
  }

  const errorMessage = formError || getErrorMessage(urlError, errorDetails)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setFormError("")

    try {
      const result = await loginAction(formData)

      if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      } else if (result?.error) {
        setFormError(result.error)
      }
    } catch (err) {
      setFormError("Error inesperado. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-50 to-gama-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🍽️</div>
          <CardTitle className="text-2xl font-bold">Gama Gourmet</CardTitle>
          <CardDescription>Ingresa a tu cuenta para acceder a la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          <ConfigChecker /> {/* Añadimos el componente aquí */}
        </CardContent>
      </Card>
    </div>
  )
}
