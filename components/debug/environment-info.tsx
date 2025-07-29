"use client"

export function EnvironmentInfo() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="font-medium mb-3">🔧 Variables de Entorno</h3>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="font-mono text-gray-600">{key}:</span>
            <span className={`font-mono ${value ? "text-green-600" : "text-red-600"}`}>
              {value ? (key.includes("KEY") ? `${value.substring(0, 20)}...` : value) : "No configurada"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
