import type { CookieOptions } from "@supabase/ssr"

const getCookieDomain = () => {
  let appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Si la variable no está definida o es para desarrollo local, usamos 'localhost'.
  if (!appUrl || appUrl.includes("localhost")) {
    return "localhost"
  }

  try {
    // Nos aseguramos de que la URL tenga un protocolo para que el constructor de URL funcione.
    if (!appUrl.startsWith("http")) {
      appUrl = `https://` + appUrl
    }
    const url = new URL(appUrl)
    // Devolvemos el hostname (ej: 'v0-gama-gourmet-product.vercel.app')
    return url.hostname
  } catch (error) {
    console.error("URL de la aplicación inválida en las variables de entorno:", error)
    // Como fallback seguro, usamos localhost.
    return "localhost"
  }
}

// Opciones de cookies compartidas para toda la aplicación.
export const cookieOptions: CookieOptions = {
  domain: getCookieDomain(),
  path: "/",
}
