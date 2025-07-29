import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/database"
import { cookieOptions } from "./config"

export const createServerClient = () => {
  const cookieStore = cookies()

  return createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
      cookieOptions,
    },
  )
}
