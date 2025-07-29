"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr" // Importamos el nuevo cliente
import type { Database } from "@/lib/types/database"

// Creamos una instancia del cliente para esta página de prueba
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export function TestConnectionClient() {
  const [clientStatus, setClientStatus] = useState<"loading" | "connected" | "error">("loading")
  const [clientError, setClientError] = useState("")
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [realtimeStatus, setRealtimeStatus] = useState<"disconnected" | "connected">("disconnected")

  useEffect(() => {
    testClientConnection()
    testAuthStatus()
    testRealtimeConnection()
  }, [])

  const testClientConnection = async () => {
    try {
      const { data, error } = await supabase.from("planes").select("count").limit(1)

      if (error) {
        setClientStatus("error")
        setClientError(error.message)
      } else {
        setClientStatus("connected")
      }
    } catch (err) {
      setClientStatus("error")
      setClientError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const testAuthStatus = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth error:", error)
      }

      setAuthStatus(session ? "authenticated" : "unauthenticated")
    } catch (err) {
      console.error("Auth test error:", err)
      setAuthStatus("unauthenticated")
    }
  }

  const testRealtimeConnection = () => {
    const channel = supabase
      .channel("test-channel")
      .on("presence", { event: "sync" }, () => {
        setRealtimeStatus("connected")
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected")
        }
      })

    // Cleanup después de 5 segundos
    setTimeout(() => {
      supabase.removeChannel(channel)
    }, 5000)
  }

  const testInsert = async () => {
    try {
      const testPlan = {
        nombre: `Plan Test ${Date.now()}`,
        descripcion: "Plan creado para prueba de conexión",
        incluye_entrada: true,
        incluye_postre: false,
        incluye_bebida: false,
        precio_mensual: 15000,
        activo: true,
      }

      const { data, error } = await supabase.from("planes").insert(testPlan).select()

      if (error) {
        alert(`Error al insertar: ${error.message}`)
      } else {
        alert(`✅ Plan creado exitosamente: ${data[0].nombre}`)
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Error desconocido"}`)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🌐 Conexión del Cliente (CSR)</h2>

      <div className="space-y-4">
        {/* Estado de conexión del cliente */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                clientStatus === "connected"
                  ? "bg-green-500"
                  : clientStatus === "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            ></div>
            <span className="font-medium">
              Cliente:{" "}
              {clientStatus === "connected" ? "✅ Conectado" : clientStatus === "error" ? "❌ Error" : "⏳ Cargando..."}
            </span>
          </div>

          {clientError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {clientError}
            </div>
          )}
        </div>

        {/* Estado de autenticación */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                authStatus === "authenticated"
                  ? "bg-green-500"
                  : authStatus === "unauthenticated"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
              }`}
            ></div>
            <span className="font-medium">
              Auth:{" "}
              {authStatus === "authenticated"
                ? "✅ Autenticado"
                : authStatus === "unauthenticated"
                  ? "⚪ No autenticado"
                  : "⏳ Verificando..."}
            </span>
          </div>
        </div>

        {/* Estado de Realtime */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${realtimeStatus === "connected" ? "bg-green-500" : "bg-gray-500"}`}
            ></div>
            <span className="font-medium">
              Realtime: {realtimeStatus === "connected" ? "✅ Conectado" : "⚪ Desconectado"}
            </span>
          </div>
        </div>

        {/* Botón de prueba */}
        {clientStatus === "connected" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">🧪 Prueba de Escritura</h3>
            <p className="text-sm text-green-800 mb-3">
              Haz clic para probar la inserción de datos en la base de datos:
            </p>
            <button
              onClick={testInsert}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Crear Plan de Prueba
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
