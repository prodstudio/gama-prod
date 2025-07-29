import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin" // Importamos el cliente de admin
import type { Database } from "@/lib/types/database"

// Rutas que requieren autenticación
const protectedRoutes = ["/gama", "/empresa", "/empleado"]

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/signup", "/forgot-password", "/test-connection"]

// Mapeo de roles a rutas permitidas
const roleRoutes = {
  gama_admin: ["/gama"],
  empresa_admin: ["/empresa"],
  empleado: ["/empleado"],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const { pathname } = req.nextUrl

  // Intentamos obtener la sesión
  let {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión, intentamos refrescarla.
  // Esta es una solución común para problemas de timing post-login.
  if (!session) {
    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.refreshSession()
    if (newSession) {
      session = newSession
    }
    // Si hay un error en el refresh, lo dejamos pasar para que el siguiente bloque lo maneje
  }

  // Rutas públicas siempre accesibles
  if (publicRoutes.some((route) => pathname.startsWith(route)) || pathname === "/") {
    return res
  }

  // Si no hay sesión en una ruta protegida, redirigir con error
  if (!session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("error", "no_session")
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión, verificar perfil y rol
  try {
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("role, activo")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.redirect(new URL(`/login?error=profile_error&details=${profileError.message}`, req.url))
    }

    if (!userProfile) {
      return NextResponse.redirect(new URL("/login?error=profile_not_found", req.url))
    }

    if (!userProfile.activo) {
      return NextResponse.redirect(new URL("/login?error=user_inactive", req.url))
    }

    const userRole = userProfile.role
    const hasAccess = roleRoutes[userRole]?.some((route) => pathname.startsWith(route))

    if (hasAccess) {
      // El usuario tiene acceso, permitir que continúe
      return res
    } else {
      // No tiene acceso a esta ruta, redirigir a su dashboard por defecto
      const defaultRoute = getDefaultRouteForRole(userRole)
      return NextResponse.redirect(new URL(defaultRoute, req.url))
    }
  } catch (e) {
    const error = e as Error
    return NextResponse.redirect(new URL(`/login?error=middleware_exception&details=${error.message}`, req.url))
  }
}

function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case "gama_admin":
      return "/gama/dashboard"
    case "empresa_admin":
      return "/empresa/dashboard"
    case "empleado":
      return "/empleado/menu"
    default:
      return "/login"
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
