"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateMenuData {
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: "borrador" | "publicado"
  platos: { [key: string]: Array<{ id: string; nombre: string; tipo: string }> }
}

interface UpdateMenuData {
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: "borrador" | "publicado"
  platos: { [key: string]: Array<{ id: string; nombre: string; tipo: string }> }
}

const DIAS_MAP: { [key: string]: number } = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
}

export async function createMenuSemanal(data: CreateMenuData) {
  try {
    const supabase = createClient()

    // Crear el menú semanal
    const { data: menu, error: menuError } = await supabase
      .from("menus_semanales")
      .insert({
        nombre: data.nombre,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        publicado: data.estado === "publicado",
      })
      .select()
      .single()

    if (menuError) {
      console.error("Error creating menu:", menuError)
      return { success: false, error: "Error al crear el menú" }
    }

    // Insertar los platos del menú
    const menuPlatos = []
    let orden = 1

    for (const [dia, platos] of Object.entries(data.platos)) {
      const diaNumero = DIAS_MAP[dia]
      if (!diaNumero) continue

      for (const plato of platos) {
        menuPlatos.push({
          menu_semanal_id: menu.id,
          plato_id: plato.id,
          dia_semana: diaNumero,
          orden: orden++,
        })
      }
    }

    if (menuPlatos.length > 0) {
      const { error: platosError } = await supabase
        .from("menu_platos")
        .insert(menuPlatos)

      if (platosError) {
        console.error("Error inserting menu platos:", platosError)
        // Eliminar el menú creado si falla la inserción de platos
        await supabase.from("menus_semanales").delete().eq("id", menu.id)
        return { success: false, error: "Error al agregar los platos al menú" }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menu }
  } catch (error) {
    console.error("Error in createMenuSemanal:", error)
    return { success: false, error: "Error inesperado al crear el menú" }
  }
}

export async function updateMenuSemanal(menuId: string, data: UpdateMenuData) {
  try {
    const supabase = createClient()

    // Actualizar el menú semanal
    const { error: menuError } = await supabase
      .from("menus_semanales")
      .update({
        nombre: data.nombre,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        publicado: data.estado === "publicado",
      })
      .eq("id", menuId)

    if (menuError) {
      console.error("Error updating menu:", menuError)
      return { success: false, error: "Error al actualizar el menú" }
    }

    // Eliminar platos existentes
    const { error: deleteError } = await supabase
      .from("menu_platos")
      .delete()
      .eq("menu_semanal_id", menuId)

    if (deleteError) {
      console.error("Error deleting existing platos:", deleteError)
      return { success: false, error: "Error al actualizar los platos del menú" }
    }

    // Insertar los nuevos platos del menú
    const menuPlatos = []
    let orden = 1

    for (const [dia, platos] of Object.entries(data.platos)) {
      const diaNumero = DIAS_MAP[dia]
      if (!diaNumero) continue

      for (const plato of platos) {
        menuPlatos.push({
          menu_semanal_id: menuId,
          plato_id: plato.id,
          dia_semana: diaNumero,
          orden: orden++,
        })
      }
    }

    if (menuPlatos.length > 0) {
      const { error: platosError } = await supabase
        .from("menu_platos")
        .insert(menuPlatos)

      if (platosError) {
        console.error("Error inserting menu platos:", platosError)
        return { success: false, error: "Error al actualizar los platos del menú" }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in updateMenuSemanal:", error)
    return { success: false, error: "Error inesperado al actualizar el menú" }
  }
}

export async function publishMenuAction(menuId: string) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from("menus_semanales")
      .update({ publicado: true })
      .eq("id", menuId)

    if (error) {
      console.error("Error publishing menu:", error)
      return { success: false, error: "Error al publicar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in publishMenuAction:", error)
    return { success: false, error: "Error inesperado al publicar el menú" }
  }
}

export async function duplicateMenuAction(menuId: string) {
  try {
    const supabase = createClient()

    // Obtener el menú original
    const { data: originalMenu, error: menuError } = await supabase
      .from("menus_semanales")
      .select("*")
      .eq("id", menuId)
      .single()

    if (menuError || !originalMenu) {
      console.error("Error fetching original menu:", menuError)
      return { success: false, error: "Error al obtener el menú original" }
    }

    // Crear el nuevo menú
    const { data: newMenu, error: createError } = await supabase
      .from("menus_semanales")
      .insert({
        nombre: `${originalMenu.nombre} (Copia)`,
        fecha_inicio: originalMenu.fecha_inicio,
        fecha_fin: originalMenu.fecha_fin,
        publicado: false, // Siempre crear como borrador
      })
      .select()
      .single()

    if (createError || !newMenu) {
      console.error("Error creating new menu:", createError)
      return { success: false, error: "Error al crear el menú duplicado" }
    }

    // Obtener los platos del menú original
    const { data: originalPlatos, error: platosError } = await supabase
      .from("menu_platos")
      .select("*")
      .eq("menu_semanal_id", menuId)

    if (platosError) {
      console.error("Error fetching original platos:", platosError)
      // Limpiar el menú creado
      await supabase.from("menus_semanales").delete().eq("id", newMenu.id)
      return { success: false, error: "Error al obtener los platos del menú original" }
    }

    // Duplicar los platos si existen
    if (originalPlatos && originalPlatos.length > 0) {
      const newPlatos = originalPlatos.map(plato => ({
        menu_semanal_id: newMenu.id,
        plato_id: plato.plato_id,
        dia_semana: plato.dia_semana,
        orden: plato.orden,
      }))

      const { error: insertPlatosError } = await supabase
        .from("menu_platos")
        .insert(newPlatos)

      if (insertPlatosError) {
        console.error("Error duplicating platos:", insertPlatosError)
        // Limpiar el menú creado
        await supabase.from("menus_semanales").delete().eq("id", newMenu.id)
        return { success: false, error: "Error al duplicar los platos del menú" }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: newMenu }
  } catch (error) {
    console.error("Error in duplicateMenuAction:", error)
    return { success: false, error: "Error inesperado al duplicar el menú" }
  }
}

export async function deleteMenuAction(menuId: string) {
  try {
    const supabase = createClient()

    // Primero eliminar los platos del menú
    const { error: platosError } = await supabase
      .from("menu_platos")
      .delete()
      .eq("menu_semanal_id", menuId)

    if (platosError) {
      console.error("Error deleting menu platos:", platosError)
      return { success: false, error: "Error al eliminar los platos del menú" }
    }

    // Luego eliminar el menú
    const { error: menuError } = await supabase
      .from("menus_semanales")
      .delete()
      .eq("id", menuId)

    if (menuError) {
      console.error("Error deleting menu:", menuError)
      return { success: false, error: "Error al eliminar el menú" }
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteMenuAction:", error)
    return { success: false, error: "Error inesperado al eliminar el menú" }
  }
}

export async function getMenusSemanales() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("menus_semanales")
      .select(`
        id,
        nombre,
        fecha_inicio,
        fecha_fin,
        publicado,
        created_at,
        menu_platos (
          dia_semana,
          platos (
            tipo
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menus:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getMenusSemanales:", error)
    return null
  }
}

export async function getMenuSemanal(id: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("menus_semanales")
      .select(`
        id,
        nombre,
        fecha_inicio,
        fecha_fin,
        publicado,
        created_at,
        menu_platos (
          dia_semana,
          orden,
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
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getMenuSemanal:", error)
    return null
  }
}
