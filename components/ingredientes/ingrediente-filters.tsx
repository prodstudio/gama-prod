"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface IngredienteFiltersProps {
  searchParams: {
    search?: string
    categoria?: string
  }
  categoriasDisponibles: string[]
}

export function IngredienteFilters({ searchParams, categoriasDisponibles }: IngredienteFiltersProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.search || "")
  const [categoria, setCategoria] = useState(searchParams.categoria || "all")

  const handleFilter = () => {
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set("search", search.trim())
    }

    if (categoria && categoria !== "all") {
      params.set("categoria", categoria)
    }

    const queryString = params.toString()
    router.push(`/gama/ingredientes${queryString ? `?${queryString}` : ""}`)
  }

  const handleClear = () => {
    setSearch("")
    setCategoria("all")
    router.push("/gama/ingredientes")
  }

  const hasActiveFilters = search.trim() || (categoria && categoria !== "all")

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="text-sm font-medium mb-2 block">
              Buscar por nombre
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ingredientes..."
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
          </div>

          <div className="min-w-[200px]">
            <label htmlFor="categoria" className="text-sm font-medium mb-2 block">
              Categoría
            </label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoriasDisponibles.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleFilter}>Filtrar</Button>
        </div>
      </CardContent>
    </Card>
  )
}
