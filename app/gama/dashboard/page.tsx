import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GamaDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard de Gama</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Hoy</CardTitle>
            <CardDescription>Total de pedidos para el día de hoy.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
          </CardContent>
        </Card>
        {/* Agrega más tarjetas de métricas aquí */}
      </div>
    </div>
  )
}
