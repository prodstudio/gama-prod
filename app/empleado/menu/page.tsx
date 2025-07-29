import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmpleadoMenu() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Menú de la Semana</h1>
      <Card>
        <CardHeader>
          <CardTitle>Selecciona tus comidas</CardTitle>
          <CardDescription>Elige tus viandas para cada día de la semana.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí se mostrará el menú semanal interactivo.</p>
        </CardContent>
      </Card>
    </div>
  )
}
