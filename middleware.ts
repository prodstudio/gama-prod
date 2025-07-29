import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/types/database"
import { cookieOptions } from "@/lib/supabase/config"
import { supabaseAdmin } from "@/lib/supabase/admin"

const protectedRoutes = ["/gama", "/empresa", "/empleado"]
const publicRoutes = ["/login", "/signup", "/forgot-password", "/test-connection"]
const roleRoutes = {
  gama_admin: ["/gama"],
  empresa_admin: ["/empresa"],
  empleado: ["/empleado"],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: "", ...options }),
      },
      cookieOptions,
    },
  )

  let {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const {
      data: { session: newSession },
    } = await supabase.auth.refreshSession()
    if (newSession) {
      session = newSession
    }
  }

  const { pathname } = req.nextUrl
  if (publicRoutes.some((route) => pathname.startsWith(route)) || pathname === "/") {
    return res
  }

  if (!session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("error", "no_session")
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

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
      return res
    } else {
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
