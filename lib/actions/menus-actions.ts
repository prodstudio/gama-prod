"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { menuSemanalSchema, type MenuSemanalFormData } from "@/lib/validations/menus"

interface PlatoAsignado {
  plato_id: string
  dia_semana: number
}

export async function createMenuSemanalAction(data: MenuSemanalFormData & { platos: PlatoAsignado[] }) {
  try {
    // Validar los datos básicos
    const validatedData = menuSemanalSchema.parse(data)

    console.log("Creating menu with data:", validatedData)
    console.log("Platos to assign:", data.platos)

    // Crear el menú semanal
    const { data: menuSemanal, error: menuError } = await supabaseAdmin
      .from("menus_semanales")
      .insert({
        fecha_inicio: validatedData.fecha_inicio,
        fecha_fin: validatedData.fecha_fin,
        activo: validatedData.activo,
        publicado: validatedData.publicado,
      })
      .select()
      .single()

    if (menuError) {
      console.error("Error creating menu semanal:", menuError)
      return { success: false, error: "Error al crear el menú semanal" }
    }

    console.log("Menu semanal created:", menuSemanal)

    // Insertar los platos del menú
    if (data.platos && data.platos.length > 0) {
      const menuPlatos = data.platos.map((plato) => ({
        menu_semanal_id: menuSemanal.id,
        plato_id: plato.plato_id,
        dia_semana: plato.dia_semana,
      }))

      console.log("Inserting menu platos:", menuPlatos)

      const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(menuPlatos)

      if (platosError) {
        console.error("Error inserting menu platos:", platosError)
        // Intentar eliminar el menú creado si falló la inserción de platos
        await supabaseAdmin.from("menus_semanales").delete().eq("id", menuSemanal.id)
        return { success: false, error: "Error al asignar platos al menú" }
      }

      console.log("Menu platos inserted successfully")
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menuSemanal }
  } catch (error) {
    console.error("Error in createMenuSemanalAction:", error)
    return { success: false, error: "Error inesperado al crear el menú semanal" }
  }
}

export async function updateMenuSemanalAction(id: string, data: MenuSemanalFormData & { platos: PlatoAsignado[] }) {
  try {
    // Validar los datos básicos
    const validatedData = menuSemanalSchema.parse(data)

    // Actualizar el menú semanal
    const { data: menuSemanal, error: menuError } = await supabaseAdmin
      .from("menus_semanales")
      .update({
        fecha_inicio: validatedData.fecha_inicio,
        fecha_fin: validatedData.fecha_fin,
        activo: validatedData.activo,
        publicado: validatedData.publicado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (menuError) {
      console.error("Error updating menu semanal:", menuError)
      return { success: false, error: "Error al actualizar el menú semanal" }
    }

    // Eliminar platos existentes
    const { error: deleteError } = await supabaseAdmin.from("menu_platos").delete().eq("menu_semanal_id", id)

    if (deleteError) {
      console.error("Error deleting existing menu platos:", deleteError)
      return { success: false, error: "Error al actualizar los platos del menú" }
    }

    // Insertar los nuevos platos del menú
    if (data.platos && data.platos.length > 0) {
      const menuPlatos = data.platos.map((plato) => ({
        menu_semanal_id: id,
        plato_id: plato.plato_id,
        dia_semana: plato.dia_semana,
      }))

      const { error: platosError } = await supabaseAdmin.from("menu_platos").insert(menuPlatos)

      if (platosError) {
        console.error("Error inserting menu platos:", platosError)
        return { success: false, error: "Error al asignar platos al menú" }
      }
    }

    revalidatePath("/gama/menus")
    revalidatePath(`/gama/menus/${id}`)
    return { success: true, data: menuSemanal }
  } catch (error) {
    console.error("Error in updateMenuSemanalAction:", error)
    return { success: false, error: "Error inesperado al actualizar el menú semanal" }
  }
}

export async function deleteMenuSemanalAction(id: string) {
  try {
    // Eliminar el menú semanal (los platos se eliminan automáticamente por CASCADE)
    const { error } = await supabaseAdmin.from("menus_semanales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting menu semanal:", error)
      return { success: false, error: "Error al eliminar el menú semanal" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteMenuSemanalAction:", error)
    return { success: false, error: "Error inesperado al eliminar el menú semanal" }
  }
}

export async function toggleMenuSemanalStatusAction(id: string, activo: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from("menus_semanales")
      .update({ activo, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error toggling menu status:", error)
      return { success: false, error: "Error al cambiar el estado del menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in toggleMenuSemanalStatusAction:", error)
    return { success: false, error: "Error inesperado al cambiar el estado del menú" }
  }
}

export async function publishMenuSemanalAction(id: string, publicado: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from("menus_semanales")
      .update({ publicado, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error publishing menu:", error)
      return { success: false, error: "Error al publicar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in publishMenuSemanalAction:", error)
    return { success: false, error: "Error inesperado al publicar el menú" }
  }
}
