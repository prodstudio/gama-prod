"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface MenuData {
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: "borrador" | "publicado"
  platos: {
    [key: string]: Array<{
      id: string
      nombre: string
      tipo: string
    }>
  }
}

const DIAS_SEMANA_MAP = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
}

export async function createMenuSemanal(data: MenuData) {
  try {
    const supabase = await createClient()

    console.log("Creando menú con datos:", data)

    // Validar datos
    if (!data.nombre || !data.fecha_inicio || !data.fecha_fin) {
      return { success: false, error: "Faltan datos requeridos" }
    }

    // Crear el menú semanal
    const { data: menu, error: menuError } = await supabase
      .from("menus_semanales")
      .insert({
        nombre: data.nombre,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        publicado: data.estado === "publicado",
        activo: true,
      })
      .select()
      .single()

    if (menuError) {
      console.error("Error creando menú:", menuError)
      return { success: false, error: `Error al crear el menú: ${menuError.message}` }
    }

    console.log("Menú creado:", menu)

    // Crear las relaciones menu-platos
    const menuPlatos = []
    for (const [dia, platos] of Object.entries(data.platos)) {
      if (platos && platos.length > 0) {
        for (let i = 0; i < platos.length; i++) {
          const diaSemana = DIAS_SEMANA_MAP[dia as keyof typeof DIAS_SEMANA_MAP]
          if (diaSemana) {
            menuPlatos.push({
              menu_semanal_id: menu.id,
              plato_id: platos[i].id,
              dia_semana: diaSemana,
              orden: i + 1,
            })
          }
        }
      }
    }

    console.log("Platos a insertar:", menuPlatos)

    if (menuPlatos.length > 0) {
      const { error: platosError } = await supabase.from("menu_platos").insert(menuPlatos)

      if (platosError) {
        console.error("Error insertando platos:", platosError)
        // Si falla la inserción de platos, eliminar el menú creado
        await supabase.from("menus_semanales").delete().eq("id", menu.id)
        return { success: false, error: `Error al asignar platos: ${platosError.message}` }
      }
    }

    revalidatePath("/gama/menus")
    return { success: true, data: menu }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { success: false, error: "Error inesperado al crear el menú" }
  }
}

// Server Action para formularios
export async function createMenuSemanalAction(formData: FormData) {
  try {
    const supabase = await createClient()

    // Extraer datos del FormData
    const nombre = formData.get("nombre") as string
    const fechaInicio = formData.get("fechaInicio") as string
    const fechaFin = formData.get("fechaFin") as string
    const estado = (formData.get("estado") as string) || "borrador"

    console.log("Datos del formulario:", { nombre, fechaInicio, fechaFin, estado })

    // Validar datos básicos
    if (!nombre || !fechaInicio || !fechaFin) {
      throw new Error("Faltan datos requeridos")
    }

    // Crear el menú semanal
    const { data: menu, error: menuError } = await supabase
      .from("menus_semanales")
      .insert({
        nombre,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        publicado: estado === "publicado",
        activo: true,
      })
      .select()
      .single()

    if (menuError) {
      console.error("Error creando menú:", menuError)
      throw new Error(`Error al crear el menú: ${menuError.message}`)
    }

    console.log("Menú creado exitosamente:", menu)

    revalidatePath("/gama/menus")
    redirect("/gama/menus")
  } catch (error) {
    console.error("Error en createMenuSemanalAction:", error)
    throw error
  }
}

export async function getMenusSemanales() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("menus_semanales")
      .select(`
        id,
        nombre,
        fecha_inicio,
        fecha_fin,
        publicado,
        activo,
        created_at,
        menu_platos (
          id,
          dia_semana,
          orden,
          platos (
            id,
            nombre,
            descripcion
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo menús:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error en getMenusSemanales:", error)
    return []
  }
}

export async function getMenuSemanal(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("menus_semanales")
      .select(`
        id,
        nombre,
        fecha_inicio,
        fecha_fin,
        publicado,
        activo,
        created_at,
        menu_platos (
          id,
          dia_semana,
          orden,
          platos (
            id,
            nombre,
            descripcion,
            precio,
            categoria
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error obteniendo menú:", error)
      throw new Error(`Error obteniendo menú: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error en getMenuSemanal:", error)
    throw error
  }
}

export async function deleteMenuSemanal(id: string) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Usuario no autenticado")
    }

    // Eliminar el menú (los platos se eliminan en cascada)
    const { error } = await supabase.from("menus_semanales").delete().eq("id", id)

    if (error) {
      console.error("Error eliminando menú:", error)
      throw new Error(`Error eliminando menú: ${error.message}`)
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error en deleteMenuSemanal:", error)
    throw error
  }
}

export async function toggleMenuPublicado(id: string) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Usuario no autenticado")
    }

    // Obtener estado actual
    const { data: currentMenu, error: getError } = await supabase
      .from("menus_semanales")
      .select("publicado")
      .eq("id", id)
      .single()

    if (getError) {
      throw new Error(`Error obteniendo menú: ${getError.message}`)
    }

    // Cambiar estado
    const { error: updateError } = await supabase
      .from("menus_semanales")
      .update({ publicado: !currentMenu.publicado })
      .eq("id", id)

    if (updateError) {
      throw new Error(`Error actualizando menú: ${updateError.message}`)
    }

    revalidatePath("/gama/menus")
    return { success: true }
  } catch (error) {
    console.error("Error en toggleMenuPublicado:", error)
    throw error
  }
}
