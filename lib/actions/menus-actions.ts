"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

interface MenuSemanalData {
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  platos: {
    plato_id: string
    dia_semana: number
  }[]
}

export async function crearMenuSemanal(data: MenuSemanalData) {
  try {
    // Crear el menú semanal
    const { data: menuSemanal, error: menuError } = await supabaseAdmin
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
      console.error("Error creating menu semanal:", menuError)
      return { success: false, error: menuError.message }
    }

    // Crear las relaciones con los platos
    if (data.platos.length > 0) {
      const menuPlatos = data.platos.map((plato) => ({
        menu_semanal_id: menuSemanal.id,
        plato_id: plato.plato_id,
        dia_semana: plato.dia_semana,
      }))

      const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(menuPlatos)

      if (platosError) {
        console.error("Error creating menu platos:", platosError)
        // Si falla la inserción de platos, eliminar el menú creado
        await supabaseAdmin.from("menus_semanales").delete().eq("id", menuSemanal.id)

        return { success: false, error: platosError.message }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menuSemanal }
  } catch (error) {
    console.error("Error in crearMenuSemanal:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function actualizarMenuSemanal(id: string, data: Partial<MenuSemanalData>) {
  try {
    const { error } = await supabaseAdmin
      .from("menus_semanales")
      .update({
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        activo: data.activo,
        publicado: data.publicado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating menu semanal:", error)
      return { success: false, error: error.message }
    }

    // Si se proporcionan platos, actualizar las relaciones
    if (data.platos) {
      // Eliminar relaciones existentes
      await supabaseAdmin.from("menu_platos").delete().eq("menu_semanal_id", id)

      // Crear nuevas relaciones
      if (data.platos.length > 0) {
        const menuPlatos = data.platos.map((plato) => ({
          menu_semanal_id: id,
          plato_id: plato.plato_id,
          dia_semana: plato.dia_semana,
        }))

        const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(menuPlatos)

        if (platosError) {
          console.error("Error updating menu platos:", platosError)
          return { success: false, error: platosError.message }
        }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in actualizarMenuSemanal:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function eliminarMenuSemanal(id: string) {
  try {
    // Primero eliminar las relaciones con platos
    await supabaseAdmin.from("menu_platos").delete().eq("menu_semanal_id", id)

    // Luego eliminar el menú semanal
    const { error } = await supabaseAdmin.from("menus_semanales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting menu semanal:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in eliminarMenuSemanal:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}
