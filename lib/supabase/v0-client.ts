import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

// Cliente específico para v0 con el rol v0_app_role
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
}

if (!process.env.SUPABASE_V0_ROLE_KEY) {
  throw new Error("SUPABASE_V0_ROLE_KEY is required")
}

export const supabaseV0 = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_V0_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)

// Función helper para verificar la conexión
export async function testV0Connection() {
  try {
    const { data, error } = await supabaseV0.from("platos").select("count").limit(1)

    if (error) {
      console.error("Error testing v0 connection:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Conexión v0 exitosa" }
  } catch (error) {
    console.error("Error in testV0Connection:", error)
    return { success: false, error: "Error de conexión" }
  }
}
