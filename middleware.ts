import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// MIDDLEWARE TEMPORAL - SIN AUTENTICACIÓN
// TODO: Reactivar autenticación completa más tarde

export async function middleware(req: NextRequest) {
  // Por ahora, permitimos acceso a todas las rutas
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
