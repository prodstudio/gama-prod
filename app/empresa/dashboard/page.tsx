import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmpresaDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard de Empresa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, [Nombre del Admin]</CardTitle>
          <CardDescription>Resumen de la actividad de tu empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí verás las métricas principales de tu empresa.</p>
        </CardContent>
      </Card>
    </div>
  )
}
