"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, MapPin, Phone } from "lucide-react"
import type { Sucursal } from "@/lib/types/database"
import { SucursalForm } from "./sucursal-form"
import { DeleteSucursalButton } from "./delete-sucursal-button"

interface SucursalesListProps {
  empresaId: string
  sucursales: Sucursal[]
}

export function SucursalesList({ empresaId, sucursales }: SucursalesListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null)

  const handleFormClose = () => {
    setShowForm(false)
    setEditingSucursal(null)
  }

  const handleEdit = (sucursal: Sucursal) => {
    setEditingSucursal(sucursal)
    setShowForm(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sucursales</CardTitle>
            <CardDescription>Ubicaciones de entrega de la empresa</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sucursal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <SucursalForm
            empresaId={empresaId}
            sucursal={editingSucursal}
            onClose={handleFormClose}
            mode={editingSucursal ? "edit" : "create"}
          />
        )}

        {sucursales.length > 0 ? (
          <div className="space-y-3">
            {sucursales.map((sucursal) => (
              <div key={sucursal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{sucursal.nombre}</h4>
                      <Badge variant={sucursal.activa ? "default" : "secondary"} className="text-xs">
                        {sucursal.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {sucursal.direccion}
                      </div>
                      {sucursal.telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {sucursal.telefono}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(sucursal)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <DeleteSucursalButton sucursalId={sucursal.id} sucursalNombre={sucursal.nombre} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No hay sucursales registradas</p>
            <p className="text-sm">Agrega la primera sucursal para comenzar</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
