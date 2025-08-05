"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const empresaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  descuento_porcentaje: z.number().min(0).max(100).default(0),
})

const sucursalSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  responsable_nombre: z.string().optional(),
  responsable_telefono: z.string().optional(),
  dias_entrega: z.array(z.number()).default([1, 2, 3, 4, 5]),
})

export async function createEmpresa(formData: FormData) {
  try {
    const supabase = await createClient()

    // Validar datos de empresa
    const empresaData = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      direccion: formData.get("direccion") as string,
      descuento_porcentaje: Number.parseFloat(formData.get("descuento_porcentaje") as string) || 0,
    }

    const validatedEmpresa = empresaSchema.parse(empresaData)

    // Crear empresa
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .insert([validatedEmpresa])
      .select()
      .single()

    if (empresaError) {
      console.error("Error creating empresa:", empresaError)
      throw new Error("Error al crear la empresa")
    }

    // Procesar sucursales
    const sucursalesData = []
    let index = 0

    while (formData.get(`sucursales[${index}][nombre]`)) {
      const diasEntregaStr = formData.get(`sucursales[${index}][dias_entrega]`) as string
      let diasEntrega = [1, 2, 3, 4, 5] // Default

      if (diasEntregaStr) {
        try {
          diasEntrega = JSON.parse(diasEntregaStr)
        } catch {
          diasEntrega = diasEntregaStr
            .split(",")
            .map((d) => Number.parseInt(d.trim()))
            .filter((d) => !isNaN(d))
        }
      }

      const sucursalData = {
        empresa_id: empresa.id,
        nombre: formData.get(`sucursales[${index}][nombre]`) as string,
        direccion: formData.get(`sucursales[${index}][direccion]`) as string,
        responsable_nombre: (formData.get(`sucursales[${index}][responsable_nombre]`) as string) || null,
        responsable_telefono: (formData.get(`sucursales[${index}][responsable_telefono]`) as string) || null,
        dias_entrega: diasEntrega,
      }

      const validatedSucursal = sucursalSchema.parse(sucursalData)
      sucursalesData.push(validatedSucursal)
      index++
    }

    // Crear sucursales si existen
    if (sucursalesData.length > 0) {
      const { error: sucursalesError } = await supabase.from("sucursales").insert(sucursalesData)

      if (sucursalesError) {
        console.error("Error creating sucursales:", sucursalesError)
        throw new Error("Error al crear las sucursales")
      }
    }

    revalidatePath("/gama/empresas")
    redirect("/gama/empresas")
  } catch (error) {
    console.error("Error in createEmpresa:", error)
    throw error
  }
}

export async function updateEmpresa(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // Validar datos de empresa
    const empresaData = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      direccion: formData.get("direccion") as string,
      descuento_porcentaje: Number.parseFloat(formData.get("descuento_porcentaje") as string) || 0,
    }

    const validatedEmpresa = empresaSchema.parse(empresaData)

    // Actualizar empresa
    const { error: empresaError } = await supabase.from("empresas").update(validatedEmpresa).eq("id", id)

    if (empresaError) {
      console.error("Error updating empresa:", empresaError)
      throw new Error("Error al actualizar la empresa")
    }

    revalidatePath("/gama/empresas")
    revalidatePath(`/gama/empresas/${id}`)
    redirect("/gama/empresas")
  } catch (error) {
    console.error("Error in updateEmpresa:", error)
    throw error
  }
}

export async function deleteEmpresa(id: string) {
  try {
    const supabase = await createClient()

    // Eliminar sucursales primero
    const { error: sucursalesError } = await supabase.from("sucursales").delete().eq("empresa_id", id)

    if (sucursalesError) {
      console.error("Error deleting sucursales:", sucursalesError)
      throw new Error("Error al eliminar las sucursales")
    }

    // Eliminar empresa
    const { error: empresaError } = await supabase.from("empresas").delete().eq("id", id)

    if (empresaError) {
      console.error("Error deleting empresa:", empresaError)
      throw new Error("Error al eliminar la empresa")
    }

    revalidatePath("/gama/empresas")
  } catch (error) {
    console.error("Error in deleteEmpresa:", error)
    throw error
  }
}

export async function createSucursal(empresaId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const diasEntregaStr = formData.get("dias_entrega") as string
    let diasEntrega = [1, 2, 3, 4, 5] // Default

    if (diasEntregaStr) {
      try {
        diasEntrega = JSON.parse(diasEntregaStr)
      } catch {
        diasEntrega = diasEntregaStr
          .split(",")
          .map((d) => Number.parseInt(d.trim()))
          .filter((d) => !isNaN(d))
      }
    }

    const sucursalData = {
      empresa_id: empresaId,
      nombre: formData.get("nombre") as string,
      direccion: formData.get("direccion") as string,
      responsable_nombre: (formData.get("responsable_nombre") as string) || null,
      responsable_telefono: (formData.get("responsable_telefono") as string) || null,
      dias_entrega: diasEntrega,
    }

    const validatedSucursal = sucursalSchema.parse(sucursalData)

    const { error } = await supabase.from("sucursales").insert([validatedSucursal])

    if (error) {
      console.error("Error creating sucursal:", error)
      throw new Error("Error al crear la sucursal")
    }

    revalidatePath("/gama/empresas")
    revalidatePath(`/gama/empresas/${empresaId}`)
  } catch (error) {
    console.error("Error in createSucursal:", error)
    throw error
  }
}

export async function updateSucursal(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const diasEntregaStr = formData.get("dias_entrega") as string
    let diasEntrega = [1, 2, 3, 4, 5] // Default

    if (diasEntregaStr) {
      try {
        diasEntrega = JSON.parse(diasEntregaStr)
      } catch {
        diasEntrega = diasEntregaStr
          .split(",")
          .map((d) => Number.parseInt(d.trim()))
          .filter((d) => !isNaN(d))
      }
    }

    const sucursalData = {
      nombre: formData.get("nombre") as string,
      direccion: formData.get("direccion") as string,
      responsable_nombre: (formData.get("responsable_nombre") as string) || null,
      responsable_telefono: (formData.get("responsable_telefono") as string) || null,
      dias_entrega: diasEntrega,
    }

    const validatedSucursal = sucursalSchema.omit({ empresa_id: true }).parse(sucursalData)

    const { error } = await supabase.from("sucursales").update(validatedSucursal).eq("id", id)

    if (error) {
      console.error("Error updating sucursal:", error)
      throw new Error("Error al actualizar la sucursal")
    }

    revalidatePath("/gama/empresas")
  } catch (error) {
    console.error("Error in updateSucursal:", error)
    throw error
  }
}

export async function deleteSucursal(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("sucursales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting sucursal:", error)
      throw new Error("Error al eliminar la sucursal")
    }

    revalidatePath("/gama/empresas")
  } catch (error) {
    console.error("Error in deleteSucursal:", error)
    throw error
  }
}
