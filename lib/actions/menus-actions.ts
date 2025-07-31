"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

interface MenuSemanalData {
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  platos: Array<{
    plato_id: string
    dia_semana: number
  }>
}

interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

export async function createMenuSemanalAction(data: MenuSemanalData): Promise<ActionResult> {
  try {
    // Validar datos
    if (!data.fecha_inicio || !data.fecha_fin) {
      return { success: false, error: "Las fechas son requeridas" }
    }

    const fechaInicio = new Date(data.fecha_inicio)
    const fechaFin = new Date(data.fecha_fin)

    if (fechaFin < fechaInicio) {
      return { success: false, error: "La fecha de fin debe ser posterior a la fecha de inicio" }
    }

    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 6) {
      return { success: false, error: "El menú no puede durar más de 7 días" }
    }

    if (!data.platos || data.platos.length === 0) {
      return { success: false, error: "Debes agregar al menos un plato al menú" }
    }

    // Crear el menú semanal
    const { data: menuData, error: menuError } = await supabaseAdmin
      .from("menus_semanales")
      .insert({
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        activo: data.activo,
        publicado: data.publicado,
      })
      .select()
      .single()

    if (menuError) {
      console.error("Error creating menu:", menuError)
      return { success: false, error: "Error al crear el menú semanal" }
    }

    // Insertar los platos del menú
    const platosData = data.platos.map((plato) => ({
      menu_semanal_id: menuData.id,
      plato_id: plato.plato_id,
      dia_semana: plato.dia_semana,
    }))

    const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(platosData)

    if (platosError) {
      console.error("Error inserting menu platos:", platosError)
      // Intentar eliminar el menú creado si falló la inserción de platos
      await supabaseAdmin.from("menus_semanales").delete().eq("id", menuData.id)
      return { success: false, error: "Error al asignar platos al menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menuData }
  } catch (error) {
    console.error("Unexpected error creating menu:", error)
    return { success: false, error: "Error inesperado al crear el menú" }
  }
}

export async function getMenuSemanalAction(id: string): Promise<ActionResult> {
  try {
    const { data, error } = await supabaseAdmin
      .from("menus_semanales")
      .select(`
        *,
        menu_platos (
          id,
          plato_id,
          dia_semana,
          platos (
            id,
            nombre,
            tipo,
            descripcion
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching menu:", error)
      return { success: false, error: "Menú no encontrado" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching menu:", error)
    return { success: false, error: "Error inesperado al obtener el menú" }
  }
}

export async function updateMenuSemanalAction(id: string, data: Partial<MenuSemanalData>): Promise<ActionResult> {
  try {
    const { error } = await supabaseAdmin
      .from("menus_semanales")
      .update({
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        activo: data.activo,
        publicado: data.publicado,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating menu:", error)
      return { success: false, error: "Error al actualizar el menú" }
    }

    // Si se proporcionaron platos, actualizar también
    if (data.platos) {
      // Eliminar platos existentes
      await supabaseAdmin.from("menu_platos").delete().eq("menu_semanal_id", id)

      // Insertar nuevos platos
      if (data.platos.length > 0) {
        const platosData = data.platos.map((plato) => ({
          menu_semanal_id: id,
          plato_id: plato.plato_id,
          dia_semana: plato.dia_semana,
        }))

        const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(platosData)

        if (platosError) {
          console.error("Error updating menu platos:", platosError)
          return { success: false, error: "Error al actualizar los platos del menú" }
        }
      }
    }

    revalidatePath("/gama/menus")
    revalidatePath(`/gama/menus/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating menu:", error)
    return { success: false, error: "Error inesperado al actualizar el menú" }
  }
}

export async function deleteMenuSemanalAction(id: string): Promise<ActionResult> {
  try {
    const { error } = await supabaseAdmin.from("menus_semanales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting menu:", error)
      return { success: false, error: "Error al eliminar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting menu:", error)
    return { success: false, error: "Error inesperado al eliminar el menú" }
  }
}
