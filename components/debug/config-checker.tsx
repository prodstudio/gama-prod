"use client"

export function ConfigChecker() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <h4 className="font-bold text-yellow-800">Verificación de Configuración:</h4>
      <p className="text-yellow-700">
        La aplicación cree que su URL es:
        <br />
        <strong className="break-all">{appUrl || "NO CONFIGURADA"}</strong>
      </p>
      <p className="mt-2 text-yellow-700">
        Asegúrate de que esta URL coincida con la **"Site URL"** en la configuración de tu proyecto de Supabase.
      </p>
    </div>
  )
}
