import { createServerClient } from "@/lib/supabase/server"
import { TestConnectionClient } from "./test-connection-client"

export default async function TestConnectionPage() {
  let serverConnectionStatus = "disconnected"
  let serverError = ""
  let tablesInfo: any[] = []

  try {
    const supabase = createServerClient()

    // Probar conexión básica
    const { data, error } = await supabase.from("planes").select("count").limit(1)

    if (error) {
      serverError = error.message
    } else {
      serverConnectionStatus = "connected"

      // Obtener información de las tablas
      const { data: planesData } = await supabase.from("planes").select("*").limit(3)
      const { data: empresasData } = await supabase.from("empresas").select("*").limit(3)
      const { data: usersData } = await supabase.from("users").select("*").limit(3)

      tablesInfo = [
        { table: "planes", count: planesData?.length || 0, sample: planesData?.[0] },
        { table: "empresas", count: empresasData?.length || 0, sample: empresasData?.[0] },
        { table: "users", count: usersData?.length || 0, sample: usersData?.[0] },
      ]
    }
  } catch (err) {
    serverError = err instanceof Error ? err.message : "Error desconocido"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Prueba de Conexión con Supabase</h1>

          {/* Conexión del Servidor */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">📡 Conexión del Servidor (SSR)</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    serverConnectionStatus === "connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="font-medium">
                  Estado: {serverConnectionStatus === "connected" ? "✅ Conectado" : "❌ Desconectado"}
                </span>
              </div>

              {serverError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Error:</strong> {serverError}
                </div>
              )}

              {serverConnectionStatus === "connected" && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">📊 Información de Tablas:</h3>
                  <div className="space-y-2">
                    {tablesInfo.map((info, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Tabla: {info.table}</span>
                          <span className="text-sm text-gray-600">Registros: {info.count}</span>
                        </div>
                        {info.sample && (
                          <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                            {JSON.stringify(info.sample, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Componente Cliente */}
          <TestConnectionClient />

          {/* Variables de Entorno */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">🔧 Variables de Entorno</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">SUPABASE_URL:</span>
                  <div className="text-sm text-gray-600 break-all">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL
                      ? `✅ ${process.env.NEXT_PUBLIC_SUPABASE_URL}`
                      : "❌ No configurada"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">SUPABASE_ANON_KEY:</span>
                  <div className="text-sm text-gray-600">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      ? `✅ ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
                      : "❌ No configurada"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📋 Instrucciones:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Verifica que las variables de entorno estén configuradas</li>
              <li>2. Asegúrate de que los scripts SQL se hayan ejecutado</li>
              <li>3. Comprueba que las tablas tengan datos de prueba</li>
              <li>4. Si hay errores, revisa la configuración de Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
