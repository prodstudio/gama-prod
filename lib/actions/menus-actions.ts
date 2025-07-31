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
      return { success: false, error: "Error al crear el menú semanal" }
    }

    // Crear las asignaciones de platos
    if (data.platos.length > 0) {
      const platosData = data.platos.map((plato) => ({
        menu_semanal_id: menuSemanal.id,
        plato_id: plato.plato_id,
        dia_semana: plato.dia_semana,
      }))

      const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(platosData)

      if (platosError) {
        console.error("Error creating menu platos:", platosError)
        // Si falla la inserción de platos, eliminar el menú creado
        await supabaseAdmin.from("menus_semanales").delete().eq("id", menuSemanal.id)
        return { success: false, error: "Error al asignar los platos al menú" }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menuSemanal }
  } catch (error) {
    console.error("Error in crearMenuSemanal:", error)
    return { success: false, error: "Error inesperado al crear el menú" }
  }
}

export async function getMenusSemanales() {
  try {
    const { data, error } = await supabaseAdmin
      .from("menus_semanales")
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        activo,
        publicado,
        created_at,
        menu_platos (
          id,
          dia_semana,
          platos (
            id,
            nombre,
            tipo
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menus semanales:", error)
      return []
    }

    return data.map((menu) => ({
      ...menu,
      platos_count: menu.menu_platos?.length || 0,
    }))
  } catch (error) {
    console.error("Error in getMenusSemanales:", error)
    return []
  }
}

export async function getMenuSemanal(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("menus_semanales")
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        activo,
        publicado,
        created_at,
        updated_at,
        menu_platos (
          id,
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
      console.error("Error fetching menu semanal:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getMenuSemanal:", error)
    return null
  }
}

export async function eliminarMenuSemanal(id: string) {
  try {
    // Primero eliminar los platos del menú
    const { error: platosError } = await supabaseAdmin.from("menu_platos").delete().eq("menu_semanal_id", id)

    if (platosError) {
      console.error("Error deleting menu platos:", platosError)
      return { success: false, error: "Error al eliminar los platos del menú" }
    }

    // Luego eliminar el menú
    const { error: menuError } = await supabaseAdmin.from("menus_semanales").delete().eq("id", id)

    if (menuError) {
      console.error("Error deleting menu semanal:", menuError)
      return { success: false, error: "Error al eliminar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in eliminarMenuSemanal:", error)
    return { success: false, error: "Error inesperado al eliminar el menú" }
  }
}
