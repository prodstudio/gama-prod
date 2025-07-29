import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createServerClient()

  // Verificar si hay una sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Obtener el rol del usuario para redirigir al portal correcto
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (userProfile) {
      switch (userProfile.role) {
        case "gama_admin":
          redirect("/gama/dashboard")
        case "empresa_admin":
          redirect("/empresa/dashboard")
        case "empleado":
          redirect("/empleado/menu")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-50 to-gama-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Gama Gourmet</h1>
          <p className="text-gray-600 mb-8">Plataforma de Gestión de Viandas Empresariales</p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-gama-600 hover:bg-gama-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              🔐 Iniciar Sesión
            </Link>

            <Link
              href="/test-connection"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              🔍 Probar Conexión
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Versión: 1.0.0</p>
            <p>Entorno: {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
