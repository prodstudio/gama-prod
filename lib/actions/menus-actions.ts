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
    // Validar datos
    if (!data.fecha_inicio || !data.fecha_fin) {
      return { success: false, error: "Las fechas son requeridas" }
    }

    const fechaInicio = new Date(data.fecha_inicio)
    const fechaFin = new Date(data.fecha_fin)

    if (fechaFin < fechaInicio) {
      return { success: false, error: "La fecha de fin debe ser posterior a la fecha de inicio" }
    }

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
      return { success: false, error: "Error al obtener los menús semanales" }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al obtener los menús semanales" }
  }
}

export async function obtenerMenuSemanal(id: string) {
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
      return { success: false, error: "Menú no encontrado" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al obtener el menú" }
  }
}

export async function eliminarMenuSemanal(id: string) {
  try {
    const { error } = await supabaseAdmin.from("menus_semanales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting menu semanal:", error)
      return { success: false, error: "Error al eliminar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al eliminar el menú" }
  }
}
