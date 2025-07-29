import type { CookieOptions } from "@supabase/ssr"

// Esta función extrae el nombre de host de la URL de la aplicación.
// Es crucial para que las cookies funcionen correctamente tanto en local como en producción.
const getCookieDomain = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // En desarrollo local, el host es 'localhost'.
  if (!appUrl || appUrl.includes("localhost")) {
    return "localhost"
  }

  try {
    // En producción, extraemos el hostname (ej: 'v0-gama-gourmet-product.vercel.app')
    const url = new URL(appUrl)
    return url.hostname
  } catch (error) {
    console.error("URL de la aplicación inválida en las variables de entorno:", error)
    // Como fallback seguro, usamos localhost.
    return "localhost"
  }
}

// Opciones de cookies compartidas para toda la aplicación.
// Al definir el 'domain' y 'path', nos aseguramos de que las cookies
// se establezcan y lean correctamente en todos los contextos (cliente, servidor, middleware).
export const cookieOptions: CookieOptions = {
  domain: getCookieDomain(),
  path: "/",
}
