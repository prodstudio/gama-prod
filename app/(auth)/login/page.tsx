"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loginAction } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  const errorDetails = searchParams.get("details")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/gama/dashboard")
  }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a Gama Gourmet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
