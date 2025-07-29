"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

export function PlatoFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  const handleClearFilters = () => {
    setSearchTerm("")
    setTipoFilter("todos")
    setEstadoFilter("todos")
  }

  const hasActiveFilters = searchTerm || tipoFilter !== "todos" || estadoFilter !== "todos"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar platos por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por tipo */}
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo de plato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="principal">Principal</SelectItem>
            <SelectItem value="postre">Postre</SelectItem>
            <SelectItem value="bebida">Bebida</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por estado */}
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters} className="whitespace-nowrap bg-transparent">
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros activos:
          </div>

          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{searchTerm}"
              <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {tipoFilter !== "todos" && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {tipoFilter}
              <button onClick={() => setTipoFilter("todos")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {estadoFilter !== "todos" && (
            <Badge variant="secondary" className="gap-1">
              Estado: {estadoFilter}
              <button onClick={() => setEstadoFilter("todos")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
