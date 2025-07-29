import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

// Verificar las variables de entorno antes de crear el cliente Supabase
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: Faltan variables de entorno de Supabase (URL o SERVICE_ROLE_KEY).")
  throw new Error("Configuración de Supabase incompleta en el servidor.")
}

// Nota: supabaseAdmin usa la SERVICE_ROLE_KEY y solo debe usarse en código del lado del servidor.
// Esta clave se obtiene de la configuración de tu proyecto en Supabase (Settings -> API).
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
