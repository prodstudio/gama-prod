import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-50 to-gama-100 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🍽️ Gama Gourmet</h1>
          <p className="text-gray-600">Plataforma de Gestión de Viandas Empresariales</p>
          <div className="mt-4 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Modo Desarrollo:</strong> Autenticación deshabilitada temporalmente
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Portal Gama Admin */}
          <Link
            href="/gama/dashboard"
            className="block p-6 bg-gama-50 hover:bg-gama-100 border border-gama-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">👨‍💼</div>
              <h3 className="font-bold text-gama-800 mb-2">Portal Gama</h3>
              <p className="text-sm text-gama-600">Administración completa de la plataforma</p>
            </div>
          </Link>

          {/* Portal Empresa */}
          <Link
            href="/empresa/dashboard"
            className="block p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-bold text-blue-800 mb-2">Portal Empresa</h3>
              <p className="text-sm text-blue-600">Gestión de empleados y pedidos</p>
            </div>
          </Link>

          {/* Portal Empleado */}
          <Link
            href="/empleado/menu"
            className="block p-6 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-bold text-purple-800 mb-2">Portal Empleado</h3>
              <p className="text-sm text-purple-600">Selección de menús y pedidos</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/test-connection"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🔍 Probar Conexión DB
          </Link>
        </div>
      </div>
    </div>
  )
}
