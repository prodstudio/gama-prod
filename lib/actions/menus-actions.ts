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
      return { success: false, error: "Error al crear el menú semanal" }
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
        // Intentar eliminar el menú semanal creado
        await supabaseAdmin.from("menus_semanales").delete().eq("id", menuSemanal.id)

        return { success: false, error: "Error al asignar los platos al menú" }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menuSemanal }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al crear el menú semanal" }
  }
}

export async function obtenerMenusSemanales() {
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
          plato:platos (
            id,
            nombre,
            categoria
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menus semanales:", error)
      return { success: false, error: "Error al obtener los menús semanales" }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al obtener los menús semanales" }
  }
}
