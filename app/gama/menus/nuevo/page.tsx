"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMenuSemanalAction } from "@/lib/actions/menus-actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoMenuPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/gama/menus">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Menú Semanal</h1>
          <p className="text-muted-foreground">Crea un nuevo menú semanal para tu empresa</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Menú</CardTitle>
          <CardDescription>Completa los datos básicos del menú semanal</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createMenuSemanalAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Menú</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: Menú Semana 1 - Enero 2024" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input id="fechaInicio" name="fechaInicio" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input id="fechaFin" name="fechaFin" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" defaultValue="borrador">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Crear Menú</Button>
              <Link href="/gama/menus">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. Crea el menú con la información básica</p>
            <p>2. Asigna platos a cada día de la semana (próximamente)</p>
            <p>3. Publica el menú cuando esté listo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
